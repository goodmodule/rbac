import isPlainObject from 'lodash/isPlainObject';
import { parallel } from 'async';
import Role from './Role';
import Permission from './Permission';
import MemoryStorage from './storages/Memory';

export default class RBAC {
  /**
   * RBAC constructor
   * @constructor RBAC
   * @param  {Object} options             Options for RBAC
   * @param  {Storage}  [options.storage]  Storage of grants
   * @param  {Array}    [options.roles]            List of role names (String)
   * @param  {Object}   [options.permissions]      List of permissions
   * @param  {Object}   [options.grants]           List of grants
   * @param  {Function} [callback]         Callback function
   */
  constructor(options = {}, callback = () => {}) {
    options.storage = options.storage || new MemoryStorage();

    this._options = options;

    this.storage.rbac = this;

    const permissions = options.permissions || {};
    const roles = options.roles || [];
    const grants = options.grants || {};

    this.create(roles, permissions, grants, (err) => {
      if (err) {
        return callback(err);
      }

      return callback(null, this);
    });
  }

  /**
   * The RBAC's options.
   * @member RBAC#options {Object}
   */
  get options() {
    return this._options;
  }

  /**
   * The RBAC's storage.
   * @member RBAC#storage {Storage}
   */
  get storage() {
    return this.options.storage;
  }

  /**
   * Register role or permission to actual RBAC instance
   * @method RBAC#add
   * @param  {Role|Permission}     item Instance of Base
   * @param  {Function} cb   Callback function
   * @return {RBAC}          Return actual instance
   */
  add(item, cb) {
    if (!item) {
      return cb(new Error('Item is undefined'));
    }

    if (item.rbac !== this) {
      return cb(new Error('Item is associated to another RBAC instance'));
    }

    this.storage.add(item, cb);
    return this;
  }

  /**
   * Get instance of Role or Permission by his name
   * @method RBAC#get
   * @param  {String}   name  Name of item
   * @param  {Function} cb    Callback function
   * @return {RBAC}           Return instance of actual RBAC
   */
  get(name, cb) {
    this.storage.get(name, cb);
    return this;
  }

  /**
   * Remove role or permission from RBAC
   * @method RBAC#remove
   * @param  {Role|Permission} item Instance of role or permission
   * @param  {Function}        cb   Callback function
   * @return {RBAC}                 Current instance
   */
  remove(item, cb) {
    if (!item) {
      return cb(new Error('Item is undefined'));
    }

    if (item.rbac !== this) {
      return cb(new Error('Item is associated to another RBAC instance'));
    }

    this.storage.remove(item, cb);
    return this;
  }

  /**
   * Remove role or permission from RBAC
   * @method RBAC#removeByName
   * @param  {String}   name Name of role or permission
   * @param  {Function} cb   Callback function
   * @return {RBAC}          Current instance
   */
  removeByName(name, cb) {
    this.get(name, (err, item) => {
      if (err) {
        return cb(err);
      }

      if (!item) {
        return cb(null, false);
      }

      item.remove(cb);
    });

    return this;
  }

  /**
   * Grant permission or role to the role
   * @method RBAC#grant
   * @param  {Role}            role  Instance of the role
   * @param  {Role|Permission} child Instance of the role or permission
   * @param  {Function}        cb    Callback function
   * @return {RBAC}                  Current instance
   */
  grant(role, child, cb) {
    if (!role || !child) {
      return cb(new Error('One of item is undefined'));
    }

    if (role.rbac !== this || child.rbac !== this) {
      return cb(new Error('Item is associated to another RBAC instance'));
    }

    if (!RBAC.isRole(role)) {
      return cb(new Error('Role is not instance of Role'));
    }

    this.storage.grant(role, child, cb);
    return this;
  }

  /**
   * Revoke permission or role from the role
   * @method RBAC#revoke
   * @param  {Role}            role   Instance of the role
   * @param  {Role|Permission} child  Instance of the role or permission
   * @param  {Function}        cb     Callback function
   * @return {RBAC}                   Current instance
   */
  revoke(role, child, cb) {
    if (!role || !child) {
      return cb(new Error('One of item is undefined'));
    }

    if (role.rbac !== this || child.rbac !== this) {
      return cb(new Error('Item is associated to another RBAC instance'));
    }

    this.storage.revoke(role, child, cb);
    return this;
  }

  /**
   * Revoke permission or role from the role by names
   * @method RBAC#revokeByName
   * @param  {String}   roleName  Instance of the role
   * @param  {String}   childName Instance of the role or permission
   * @param  {Function} cb        Callback function
   * @return {RBAC}               Current instance
   */
  revokeByName(roleName, childName, cb) {
    parallel({
      role: (callback) => this.get(roleName, callback),
      child: (callback) => this.get(childName, callback),
    }, (err, results) => {
      if (err) {
        return cb(err);
      }

      this.revoke(results.role, results.child, cb);
    });

    return this;
  }

  /**
   * Grant permission or role from the role by names
   * @method RBAC#grantByName
   * @param  {String}   roleName  Instance of the role
   * @param  {String}   childName Instance of the role or permission
   * @param  {Function} cb        Callback function
   * @return {RBAC}               Current instance
   */
  grantByName(roleName, childName, cb) {
    parallel({
      role: (callback) => this.get(roleName, callback),
      child: (callback) => this.get(childName, callback),
    }, (err, results) => {
      if (err) {
        return cb(err);
      }

      this.grant(results.role, results.child, cb);
    });

    return this;
  }

  /**
   * Create a new role assigned to actual instance of RBAC
   * @method RBAC#createRole
   * @param  {String}  roleName Name of new Role
   * @param  {Boolean} [add=true]    True if you need to add it to the storage
   * @return {Role}    Instance of the Role
   */
  createRole(roleName, add, cb) {
    return new Role(this, roleName, add, cb);
  }

  /**
   * Create a new permission assigned to actual instance of RBAC
   * @method RBAC#createPermission
   * @param  {String} action   Name of action
   * @param  {String} resource Name of resource
   * @param  {Boolean} [add=true]   True if you need to add it to the storage
   * @param  {Function} cb     Callback function
   * @return {Permission}      Instance of the Permission
   */
  createPermission(action, resource, add, cb) {
    return new Permission(this, action, resource, add, cb);
  }

  /**
   * Callback returns true if role or permission exists
   * @method RBAC#exists
   * @param  {String}   name  Name of item
   * @param  {Function} cb    Callback function
   * @return {RBAC}           Return instance of actual RBAC
   */
  exists(name, cb) {
    this.storage.exists(name, cb);
    return this;
  }

  /**
   * Callback returns true if role exists
   * @method RBAC#existsRole
   * @param  {String}   name  Name of item
   * @param  {Function} cb    Callback function
   * @return {RBAC}           Return instance of actual RBAC
   */
  existsRole(name, cb) {
    this.storage.existsRole(name, cb);
    return this;
  }

  /**
   * Callback returns true if permission exists
   * @method RBAC#existsPermission
   * @param  {String}   action  Name of action
   * @param  {String}   resource  Name of resource
   * @param  {Function} cb    Callback function
   * @return {RBAC}           Return instance of actual RBAC
   */
  existsPermission(action, resource, cb) {
    this.storage.existsPermission(action, resource, cb);
    return this;
  }


  /**
   * Return instance of Role by his name
   * @method RBAC#getRole
   * @param  {String}   name  Name of role
   * @param  {Function} cb    Callback function
   * @return {RBAC}           Return instance of actual RBAC
   */
  getRole(name, cb) {
    this.storage.getRole(name, cb);
    return this;
  }

  /**
   * Return all instances of Role
   * @method RBAC#getRoles
   * @param  {Function} cb    Callback function
   * @return {RBAC}           Return instance of actual RBAC
   */
  getRoles(cb) {
    this.storage.getRoles(cb);
    return this;
  }

  /**
   * Return instance of Permission by his action and resource
   * @method RBAC#getPermission
   * @param  {String} action    Name of action
   * @param  {String} resource  Name of resource
   * @param  {Function} cb      Callback function
   * @return {RBAC}             Return instance of actual RBAC
   */
  getPermission(action, resource, cb) {
    this.storage.getPermission(action, resource, cb);
    return this;
  }

  /**
   * Return instance of Permission by his name
   * @method RBAC#getPermission
   * @param  {String} name      Name of permission
   * @param  {Function} cb      Callback function
   * @return {RBAC}             Return instance of actual RBAC
   */
  getPermissionByName(name, cb) {
    const data = Permission.decodeName(name);
    this.storage.getPermission(data.action, data.resource, cb);
    return this;
  }

  /**
   * Return all instances of Permission
   * @method RBAC#getPermissions
   * @param  {Function} cb    Callback function
   * @return {RBAC}           Return instance of actual RBAC
   */
  getPermissions(cb) {
    this.storage.getPermissions(cb);
    return this;
  }

  /**
   * Create multiple permissions in one step
   * @method RBAC#createPermissions
   * @param  {Object}   permissions Object of permissions
   * @param  {Boolean} [add=true]   True if you need to add it to the storage
   * @param  {Function} cb          Callbck function
   * @return {RBAC}                 Instance of actual RBAC
   */
  createPermissions(resources, add, cb) {
    if (typeof add === 'function') {
      return this.createPermissions(resources, true, add);
    }

    const tasks = {};

    if (!isPlainObject(resources)) {
      return cb(new Error('Resources is not a plain object'));
    }

    Object.keys(resources).forEach((resource) => {
      resources[resource].forEach((action) => {
        const name = Permission.createName(action, resource);
        tasks[name] = (callback) => this.createPermission(action, resource, add, callback);
      }, this);
    }, this);

    parallel(tasks, cb);
    return this;
  }

  /**
   * Create multiple roles in one step assigned to actual instance of RBAC
   * @method RBAC#createRoles
   * @param  {Array}    roleNames  Array of role names
   * @param  {Boolean} [add=true]   True if you need to add it to the storage
   * @param  {Function} cb         Callback function
   * @return {RBAC}                Current instance
   */
  createRoles(roleNames, add, cb) {
    if (typeof add === 'function') {
      return this.createRoles(roleNames, true, add);
    }

    const tasks = {};

    roleNames.forEach((roleName) => {
      tasks[roleName] = (callback) => this.createRole(roleName, add, callback);
    }, this);

    parallel(tasks, cb);
    return this;
  }


  /**
   * Grant multiple items in one function
   * @method RBAC#grants
   * @param  {Object}       List of roles
   * @param  {Function} cb  Callback function
   * @return {RBAC}         Current instance
   */
  grants(roles, cb) {
    if (!isPlainObject(roles)) {
      return cb(new Error('Grants is not a plain object'));
    }

    const tasks = [];

    Object.keys(roles).forEach((role) => {
      roles[role].forEach((grant) => {
        tasks.push((callback) => this.grantByName(role, grant, callback));
      }, this);
    }, this);

    parallel(tasks, cb);
    return this;
  }


  /**
   * Create multiple permissions and roles in one step
   * @method RBAC#create
   * @param  {Array}   roleNames       List of role names
   * @param  {Object}  permissionNames List of permission names
   * @param  {Object}  [grants]        List of grants
   * @param  {Array}   cb              Callback function
   * @return {RBAC}                    Instance of actual RBAC
   */
  create(roleNames, permissionNames, grants, cb) {
    if (typeof grants === 'function') {
      return this.create(roleNames, permissionNames, null, grants);
    }

    const tasks = {
      permissions: (callback) => this.createPermissions(permissionNames, callback),
      roles: (callback) => this.createRoles(roleNames, callback),
    };

    parallel(tasks, (err, result) => {
      if (err || !grants) {
        return cb(err, result);
      }

      // add grants to roles
      this.grants(grants, (err2) => {
        if (err2) {
          return cb(err2);
        }

        cb(null, result);
      });
    });

    return this;
  }

  /**
   * Traverse hierarchy of roles.
   * Callback function returns as second parameter item from hierarchy or null if we are on the end of hierarchy.
   * @method RBAC#_traverseGrants
   * @param  {String}   roleName  Name of role
   * @param  {Function} cb        Callback function
   * @return {RBAC}               Return instance of actual RBAC
   * @private
   */
  _traverseGrants(roleName, cb, next = [roleName], used = {}) {
    const actualRole = next.shift();
    used[actualRole] = true;

    this.storage.getGrants(actualRole, (err, items = []) => {
      if (err) {
        return cb(err);
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const name = item.name;

        if (RBAC.isRole(item) && !used[name]) {
          used[name] = true;
          next.push(name);
        }

        if (cb(null, item) === false) {
          return void 0;
        }
      }

      if (next.length === 0) {
        return cb(null, null);
      }

      this._traverseGrants(null, cb, next, used);
    });

    return this;
  }

  /**
   * Return true if role has allowed permission
   * @method RBAC#can
   * @param  {String}  roleName Name of role
   * @param  {String}  action   Name of action
   * @param  {String}  resource Name of resource
   * @param  {Function} cb        Callback function
   * @return {RBAC}             Current instance
   */
  can(roleName, action, resource, cb) {
    this._traverseGrants(roleName, (err, item) => {
      // if there is a error
      if (err) {
        return cb(err);
      }

      // this is last item
      if (!item) {
        return cb(null, false);
      }

      if (RBAC.isPermission(item) && item.can(action, resource) === true) {
        cb(null, true);
        // end up actual traversing
        return false;
      }
    });

    return this;
  }


  /**
   * Check if the role has any of the given permissions.
   * @method RBAC#canAny
   * @param  {String} roleName     Name of role
   * @param  {Array}  permissions  Array (String action, String resource)
   * @param  {Function} cb        Callback function
   * @return {RBAC}                Current instance
   */
  canAny(roleName, permissions, cb) {
    // prepare the names of permissions
    const permissionNames = RBAC.getPermissionNames(permissions);

    // traverse hierarchy
    this._traverseGrants(roleName, (err, item) => {
      // if there is a error
      if (err) {
        return cb(err);
      }

      // this is last item
      if (!item) {
        return cb(null, false);
      }

      if (RBAC.isPermission(item) && permissionNames.indexOf(item.name) !== -1) {
        cb(null, true);
        // end up actual traversing
        return false;
      }
    });

    return this;
  }

  /**
   * Check if the model has all of the given permissions.
   * @method RBAC#canAll
   * @param  {String} roleName     Name of role
   * @param  {Array}  permissions  Array (String action, String resource)
   * @param  {Function} cb        Callback function
   * @return {RBAC}                Current instance
   */
  canAll(roleName, permissions, cb) {
    // prepare the names of permissions
    const permissionNames = RBAC.getPermissionNames(permissions);
    const founded = {};
    let foundedCount = 0;

    // traverse hierarchy
    this._traverseGrants(roleName, (err, item) => {
      // if there is a error
      if (err) {
        return cb(err);
      }

      // this is last item
      if (!item) {
        return cb(null, false);
      }

      if (RBAC.isPermission(item) && permissionNames.indexOf(item.name) !== -1 && !founded[item.name]) {
        founded[item.name] = true;
        foundedCount++;

        if (foundedCount === permissionNames.length) {
          cb(null, true);
          // end up actual traversing
          return false;
        }
      }
    });

    return this;
  }

  /**
   * Return true if role has allowed permission
   * @method RBAC#hasRole
   * @param  {String}   roleName        Name of role
   * @param  {String}   roleChildName   Name of child role
   * @param  {Function} cb              Callback function
   * @return {RBAC}                     Current instance
   */
  hasRole(roleName, roleChildName, cb) {
    if (roleName === roleChildName) {
      cb(null, true);
      return this;
    }

    this._traverseGrants(roleName, (err, item) => {
      // if there is a error
      if (err) {
        return cb(err);
      }

      // this is last item
      if (!item) {
        return cb(null, false);
      }

      if (RBAC.isRole(item) && item.name === roleChildName) {
        cb(null, true);
        // end up actual traversing
        return false;
      }
    });

    return this;
  }

  /**
   * Return array of all permission assigned to role of RBAC
   * @method RBAC#getScope
   * @param  {String} roleName   Name of role
   * @param  {Function} cb       Callback function
   * @return {RBAC}              Current instance
   */
  getScope(roleName, cb) {
    const scope = [];

    // traverse hierarchy
    this._traverseGrants(roleName, (err, item) => {
      // if there is a error
      if (err) {
        return cb(err);
      }

      // this is last item
      if (!item) {
        return cb(null, scope);
      }

      if (RBAC.isPermission(item) && scope.indexOf(item.name) === -1) {
        scope.push(item.name);
      }
    });

    return this;
  }

  /**
   * Convert Array of permissions to permission name
   * @function getPermissionNames
   * @memberof RBAC
   * @param  {Array} permissions List of array items of permission names. It contan action and resource
   * @return {Array}             List of permission names
   * @static
   */
  static getPermissionNames(permissions) {
    const permissionNames = [];

    for (let i = 0; i < permissions.length; i++) {
      const permission = permissions[i];
      permissionNames.push(Permission.createName(permission[0], permission[1]));
    }

    return permissionNames;
  }

  static isPermission(item) {
    return item instanceof Permission;
  }

  static isRole(item) {
    return item instanceof Role;
  }
}
