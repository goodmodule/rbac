import Permission from '../Permission';
import Role from '../Role';

export default class Storage {
  /**
   * Storage constructor
   * @constructor Storage
   */
  constructor() {
    this._rbac = null;
  }

  /**
   * Get instance of RBAC
   * @member Storage#rbac {RBAC|null} Instance of RBAC
   */
  get rbac() {
    return this._rbac;
  }

  set rbac(rbac) {
    if (this._rbac) {
      throw new Error('RBAC is already setted');
    }

    this._rbac = rbac;
  }

  /**
   * Add permission or role
   * @method Storage#add
   * @param {Base}   item    Instance of role or permission
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  add(item, cb) {
    cb(new Error('Storage method add is not implemented'));
  }

  /**
   * Remove permission or role
   * @method Storage#remove
   * @param {Base}   item    Instance of role or permission
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  remove(item, cb) {
    cb(new Error('Storage method remove is not implemented'));
  }

  /**
   * Add (grant) permission or role to hierarchy of actual role
   * @method Storage#grant
   * @param  {Role}   role  Instance of role
   * @param  {Base}   child Instance of role or permission
   * @param  {Function} cb    Callback function
   * @return {Storage}       Instance of actual storage
   */
  grant(role, child, cb) {
    cb(new Error('Storage method grant is not implemented'));
  }

  /**
   * Remove (revoke) permission or role from hierarchy of actual role
   * @method Storage#revoke
   * @param  {Role}   role  Instance of role
   * @param  {Base}   child Instance of role or permission
   * @param  {Function} cb    Callback function
   * @return {Storage}       Instance of actual storage
   */
  revoke(role, child, cb) {
    cb(new Error('Storage method revoke is not implemented'));
  }

  /**
   * Get instance of permission or role by his name
   * @method Storage#get
   * @param  {String}   name Name of role or permission
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  get(name, cb) {
    cb(new Error('Storage method get is not implemented'));
  }

  /**
   * Get all instances of Roles
   * @method Storage#getRoles
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  getRoles(cb) {
    cb(new Error('Storage method getRoles is not implemented'));
  }

  /**
   * Get all instances of Permissions
   * @method Storage#getPermissions
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  getPermissions(cb) {
    cb(new Error('Storage method getPermissions is not implemented'));
  }

  /**
   * Get instances of Roles and Permissions assigned to role
   * @method Storage#getGrants
   * @param  {String}   role Name of role
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  getGrants(role, cb) {
    cb(new Error('Storage method getGrants is not implemented'));
  }

  /**
   * Get instance of role by his name
   * @method Storage#getRole
   * @param  {String}   name Name of role
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  getRole(name, cb) {
    this.get(name, (err, item) => {
      if (err || !item) {
        return cb(err, item);
      }

      if (item instanceof Role) {
        return cb(null, item);
      }

      cb(null, null);
    });

    return this;
  }

  /**
   * Get instance of permission by his name
   * @method Storage#getPermission
   * @param  {String}   action   Name of action
   * @param  {String}   resource Name of resource
   * @param  {Function} cb       Callback function
   * @return {Storage}           Instance of actual storage
   */
  getPermission(action, resource, cb) {
    const name = Permission.createName(action, resource);

    this.get(name, (err, item) => {
      if (err || !item) {
        return cb(err, item);
      }

      if (item instanceof Permission) {
        return cb(null, item);
      }

      cb(null, null);
    });

    return this;
  }

  /**
   * Return true with callback if role or permission exists
   * @method Storage#exists
   * @param  {String}   name Name of role or permission
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  exists(name, cb) {
    this.get(name, (err, item) => {
      if (err) {
        return cb(err);
      }

      if (!item) {
        return cb(null, false);
      }

      return cb(null, true);
    });

    return this;
  }

  /**
   * Return true with callback if role exists
   * @method Storage#existsRole
   * @param  {String}   name Name of role
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  existsRole(name, cb) {
    this.getRole(name, (err, item) => {
      if (err) {
        return cb(err);
      }

      if (!item) {
        return cb(null, false);
      }

      return cb(null, true);
    });

    return this;
  }

  /**
   * Return true with callback if permission exists
   * @method Storage#existsPermission
   * @param  {String}   name Name of permission
   * @param  {Function} cb   Callback function
   * @return {Storage}       Instance of actual storage
   */
  existsPermission(action, resource, cb) {
    this.getPermission(action, resource, (err, item) => {
      if (err) {
        return cb(err);
      }

      if (!item) {
        return cb(null, false);
      }

      return cb(null, true);
    });

    return this;
  }
}
