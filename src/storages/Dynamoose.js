import values from 'lodash/values';
import Storage from './index';
import Permission from '../Permission';
import Role from '../Role';
import keymirror from 'keymirror';

const Type = keymirror({
  PERMISSION: null,
  ROLE: null,
});

function createSchema(Schema) {
  const schema = new Schema({
    // name: { type: String, required: true, unique: true },
    name: { type: String, hashKey: true },
    // type: { type: String, 'enum': values(Type), required: true },
    type: String,
    grants: [String],
  },
  {
    throughput: {read: 15, write: 5}
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

    options.modelName = options.modelName || 'rbac';
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
    });

    newInstance.save(function (err) {
      if (err) {
        return cb(err);
      }

      cb(null, item);
    });

    return this;
  }

  remove(item, cb) {
    const name = item.name;

    this.model.update({ grants: name }, { $DELETE: { grants: null } }, (err) => {
      if (err) {
        return cb(err);
      }
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

    this.model.get({ name: role, type: Type.ROLE }, (err, record) => {
      if (err) {
        return cb(err);
      }

      if (!record) {
        this.model.update({ name: name, type: Type.ROLE }, { grants: [childName] }, (err) => {
          if (err) {
            return cb(err);
          }

          cb(null, true);
        })
      } else {
        this.model.update({ name: name, type: Type.ROLE }, { grants: [...record.grants, childName] }, (err) => {
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

      this.model.update({ name: name, type: Type.ROLE }, { grants: [...record.grants.filter(g => g !== childName)] }, (err) => {
        if (err) {
          return cb(err);
        }

        cb(null, true);
      })
    });

    return this;
  }

  get(name, cb) {
    const rbac = this.rbac;

    this.model.get({ name: name }, (err, record) => {
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

    this.model.get({ type: Type.ROLE }, (err, records) => {
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

    this.model.get({ type: Type.PERMISSION }, (err, records) => {
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

      // if (!record || !record.grants.length) {
      if (!record || !record.grants) {
        return cb(null, []);
      }

      this.model.scan('name').contains(record.grants).exec((err2, records) => {
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
