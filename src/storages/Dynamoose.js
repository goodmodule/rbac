import keymirror from 'keymirror';
import Storage from './index';
import Permission from '../Permission';
import Role from '../Role';

const Type = keymirror({
  PERMISSION: null,
  ROLE: null,
});

function createSchema(Schema) {
  const schema = new Schema({
    // name: { type: String, required: true, unique: true },
    // type: { type: String, 'enum': values(Type), required: true },
    name: { type: String, hashKey: true },
    type: String,
    grants: { type: [String], default: [] },
  }, {
    throughput: { read: 15, write: 5 },
  });

  return schema;
}

function getType(item) {
  if (item instanceof Role) {
    return Type.ROLE;
  } else if (item instanceof Permission) {
    return Type.PERMISSION;
  }

  return null;
}

function convertToInstance(rbac, record) {
  if (!record) {
    throw new Error('Record is undefined');
  }

  if (record.type === Type.ROLE) {
    return rbac.createRole(record.name, false, () => {});
  } else if (record.type === Type.PERMISSION) {
    const decoded = Permission.decodeName(record.name);
    if (!decoded) {
      throw new Error('Bad permission name');
    }

    return rbac.createPermission(decoded.action, decoded.resource, false, () => {});
  }

  throw new Error('Type is undefined');
}

export default class DynamooseStorage extends Storage {
  constructor(options = {}) {
    super();

    const connection = options.connection;
    if (!connection) {
      throw new Error('Parameter connection is undefined use your current dynamoose connection.');
    }

    options.modelName = options.modelName || 'rbac5';
    options.Schema = options.Schema || connection.Schema;

    this._options = options;

    this._model = connection.model(options.modelName, createSchema(options.Schema));
  }

  get model() {
    return this._model;
  }

  get options() {
    return this._options;
  }

  add(item, cb) {
    const newInstance = new this.model({
      name: item.name,
      type: getType(item),
      grants: [],
    });

    newInstance.save((err) => {
      if (err) {
        return cb(err);
      }

      cb(null, item);
    });

    return this;
  }

  remove(item, cb) {
    const name = item.name;

    this.model.scan({ grants: { contains: name } }, (err, records) => {
      if (err) {
        return cb(err);
      }

      records.forEach((r) => {
        this.model.update({ name: r.name }, { grants: [] }, { allowEmptyArray: true }, (err2) => {
          if (err2) {
            return cb(err2);
          }
        });
      });

      this.model.delete({ name: name }, (err2) => {
        if (err2) {
          return cb(err2);
        }

        cb(null, true);
      });
    });

    return this;
  }

  grant(role, child, cb) {
    const rbac = this.rbac;

    const name = role.name;
    const childName = child.name;

    if (!role instanceof Role) {
      return cb(new Error('Role is not instance of Role'));
    }

    if (name === childName) {
      return cb(new Error('You can grant yourself'));
    }

    this.model.get({ name: name, type: Type.ROLE }, (err, record) => {
      if (err) {
        return cb(err);
      }

      if (!record.grants) {
        this.model.update({ name: name, type: Type.ROLE }, { grants: [childName] }, (err) => {
          if (err) {
            return cb(err);
          }

          cb(null, true);
        })
      } else {
        this.model.update({ name: name, type: Type.ROLE }, { grants: record.grants.filter(g => g !== childName).concat([childName]) }, (err) => {
          if (err) {
            return cb(err);
          }

          cb(null, true);
        })
      }
    });

    return this;
  }

  revoke(role, child, cb) {
    const name = role.name;
    const childName = child.name;

    this.model.get({ name: name, type: Type.ROLE }, (err, record) => {
      if (err) {
        return cb(err);
      }

      this.model.update(
        { name: name, type: Type.ROLE },
        { grants: [...record.grants.filter(g => g !== childName)] },
        { allowEmptyArray: true },
        (err) => {
          if (err) {
            return cb(err);
          }

          cb(null, true);
        },
      );
    });

    return this;
  }

  get(name, cb) {
    const rbac = this.rbac;

    this.model.get(name, (err, record) => {
      if (err) {
        return cb(err);
      }

      if (!record) {
        return cb(null, null);
      }

      cb(null, convertToInstance(rbac, record));
    });

    return this;
  }

  getRoles(cb) {
    const rbac = this.rbac;

    this.model.query({ type: { eq: Type.ROLE } }, (err, records) => {
      if (err) {
        return cb(err);
      }

      const instances = records.map((r) => convertToInstance(rbac, r));

      cb(null, instances);
    });

    return this;
  }

  getPermissions(cb) {
    const rbac = this.rbac;

    // this.model.get({ type: Type.PERMISSION }, (err, records) => {
    this.model.query({ type: { eq: Type.PERMISSION } }, (err, records) => {
      if (err) {
        return cb(err);
      }

      const instances = records.map((r) => convertToInstance(rbac, r));

      cb(null, instances);
    });

    return this;
  }

  getGrants(role, cb) {
    const rbac = this.rbac;

    this.model.get({ name: role, type: Type.ROLE }, (err, record) => {
      if (err) {
        return cb(err);
      }

      if (!record || !record.grants) {
        return cb(null, []);
      }

      this.model.scan({ name: { in: record.grants } }, (err2, records) => {
        if (err2) {
          return cb(err2);
        }

        const instances = records.map((r) => convertToInstance(rbac, r));

        cb(null, instances);
      });
    });

    return this;
  }
}
