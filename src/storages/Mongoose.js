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
    name: { type: String, required: true, unique: true },
    type: { type: String, 'enum': values(Type), required: true },
    grants: [String],
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

export default class MongooseStorage extends Storage {
  constructor(options = {}) {
    super();

    const connection = options.connection;
    if (!connection) {
      throw new Error('Parameter connection is undefined use your current mongoose connection.');
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
    this.model.create({
      name: item.name,
      type: getType(item),
    }, (err, obj) => {
      if (err) {
        return cb(err);
      }

      if (!obj) {
        return cb(new Error('Item is undefined'));
      }

      cb(null, item);
    });

    return this;
  }

  remove(item, cb) {
    const name = item.name;

    this.model.update({ grants: name }, {
      $pull: {
        grants: name,
      },
    }, { multi: true }, (err) => {
      if (err) {
        return cb(err);
      }

      this.model.remove({ name }, (err2) => {
        if (err2) {
          return cb(err2);
        }

        cb(null, true);
      });
    });

    return this;
  }

  grant(role, child, cb) {
    const name = role.name;
    const childName = child.name;

    if (!role instanceof Role) {
      return cb(new Error('Role is not instance of Role'));
    }

    if (name === childName) {
      return cb(new Error('You can grant yourself'));
    }

    this.model.update({ name: name, type: Type.ROLE }, { $addToSet: { grants: childName } }, (err) => {
      if (err) {
        return cb(err);
      }

      cb(null, true);
    });

    return this;
  }

  revoke(role, child, cb) {
    const name = role.name;
    const childName = child.name;

    this.model.update({ name: name, type: Type.ROLE }, { $pull: { grants: childName } }, (err, num) => {
      if (err) {
        return cb(err);
      }

      if (num === 0) {
        return cb(new Error('Item is not associated to this item'));
      }

      return cb(null, true);
    });

    return this;
  }

  get(name, cb) {
    const rbac = this.rbac;

    this.model.findOne({ name }, (err, record) => {
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

    this.model.find({ type: Type.ROLE }, (err, records) => {
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

    this.model.find({ type: Type.PERMISSION }, (err, records) => {
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

    this.model.findOne({ name: role, type: Type.ROLE }, (err, record) => {
      if (err) {
        return cb(err);
      }

      if (!record || !record.grants.length) {
        return cb(null, []);
      }

      this.model.find({
        name: {
          $in: record.grants,
        },
      }, (err2, records) => {
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
