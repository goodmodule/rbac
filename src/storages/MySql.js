import values from 'lodash/values';
import Storage from './index';
import Permission from '../Permission';
import Role from '../Role';
import keymirror from 'keymirror';
import Sequelize from 'sequelize';

const Type = keymirror({
  PERMISSION: null,
  ROLE: null,
});

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

export default class MySqlStorage extends Storage {
  constructor(options = {}) {
    super();

    // NOTE: Pre-create the database first
    options.databaseName = options.databaseName || 'rbac';
    options.host = options.host || 'localhost';
    options.port = options.port || 3306;
    options.nameModel = options.nameModel || 'NameType';
    options.grantModel = options.grantModel || 'Grant';

    this._options = options;

    this.sequelize = new Sequelize(options.databaseName, options.username, options.password, {
      dialect: 'mysql',
      host: options.host,
      port: options.port
    });

    this._createSchema(options.nameModel, options.grantModel);
  }

  _createSchema(nameModel, grantModel) {
    this.NameType = this.sequelize.define(nameModel, {
      name: { type: Sequelize.STRING, unique: true, allowNull: false },
      type: { type: Sequelize.STRING }
    });

    this.Grant = this.sequelize.define(grantModel, {
      grant: { type: Sequelize.STRING, unique:true }
    });

    this.Grant.belongsToMany(this.NameType, {through: 'NameGrant'});
    this.NameType.belongsToMany(this.Grant, {through: 'NameGrant'});
    
    // Create the tables if required
    this.NameType.sync();
    this.Grant.sync();

    this.sequelize.sync();
  }

  get options() {
    return this._options;
  }

  add(item, cb) {
    this.NameType
      .create({name: item.name, type: getType(item)})
      .then(obj => {
        if (!obj) {
          return cb(new Error('Item is undefined'));
        }

        cb(null, item);
      })
      .catch(err => {
        if (err) {
          return cb(err);
        }
      });

    return this;
  }

  remove(item, cb) {
    const name = item.name;

    this.NameType
      .findOne({ where: {name : name} })
      .then(obj => {
        if (!obj) {
          return cb(new Error('Name is undefined'));
        }

        // Remove all associated grants
        obj.setGrants([])
          .then(associatedGrants => {
            obj.destroy();
            cb(null, true);
          })
          .catch(err => {
            return cb(err);
          });
      })
      .catch(err => {
        return cb(err);
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

    this.NameType
      .findOne({ where: {name: name, type: Type.ROLE} })
      .then (obj => {
        if (!obj) {
          return cb(new Error('Name is undefined'));
        }

        // Create grant
        this.Grant
          .findOrCreate({where:{ grant: childName}})
          .spread((grant,created) => {
            if (!grant) {
              return cb(new Error('Grant is undefined'));
            }

            // Make association
            obj.addGrant(grant)
              .then(() => {
                cb(null, true);
              })
              .catch(err => {
                return cb(err);
              });
          })
          .catch(err => {
            return cb(err);
          });
      })
      .catch (err => {
        return cb(err);
      });

    return this;
  }

  revoke(role, child, cb) {
    const name = role.name;
    const childName = child.name;

    this.NameType
      .findOne({ where: {name : name, type: Type.ROLE} })
      .then(obj => {
        // Find matching associated grant
        this.Grant
          .findOne({ where: {grant: childName} })
          .then(grant => {
            if (!grant) {
              return cb(new Error('Item is not associated to this item'));
            }

            // Remove specific grant
            obj.removeGrant(grant)
              .then(() => {
                return cb(null, true);
              })
              .catch(err => {
                return cb(err);
              });
          })
          .catch(err => {
            return cb(err);
          });
      })
      .catch(err => {
        return cb(err);
      });

    return this;
  }

  get(name, cb) {
    const rbac = this.rbac;

    this.NameType
      .findOne({ where: {name : name} })
      .then(record => {
        if (!record) {
          return cb(null, null);  
        }

        cb(null, convertToInstance(rbac, record));        
      })
      .catch(err => {
        return cb(err);
      });

    return this;
  }

  getRoles(cb) {
    const rbac = this.rbac;

    this.NameType
      .findAll({ where: {type: Type.ROLE} })
      .then(records => {
        if (!records) {
          return cb(null, null);  
        }

        const instances = records.map((r) => convertToInstance(rbac, r));

        cb(null, instances);
      })
      .catch(err => {
        return cb(err);
      });

    return this;
  }

  getPermissions(cb) {
    const rbac = this.rbac;

    this.NameType
      .findAll({ where: {type: Type.PERMISSION} })
      .then(records => {
        if (!records) {
          return cb(null, null);  
        }

        const instances = records.map((r) => convertToInstance(rbac, r));

        cb(null, instances);
      })
      .catch(err => {
        return cb(err);
      });

    return this;
  }

  getGrants(role, cb) {
    const rbac = this.rbac;

    // Find a Name with Role
    this.NameType
      .findOne({ where: {name : role, type: Type.ROLE} })
      .then(record => {
        if (!record) {
          return cb(null, []);
        }

        // Get all grants of name
        record.getGrants({})
          .then(grants => {

            let names = [];

            // Find all Name records matching with grant name
            grants.map(r => {
              names.push(r.grant);
            });

            this.NameType
              .findAll({ where: {name: names} })
              .then(records => {
                const instances = records.map((r) => convertToInstance(rbac, r));

                cb(null, instances);
              })
              .catch(err => {
                return cb(null, []);
              });
          })
          .catch(err => {
            return cb(err);
          });
      })
      .catch(err => {
        return cb(err);
      });

    return this;
  }
}
