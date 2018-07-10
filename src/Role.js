import Base from './Base';
import Permission from './Permission';
import { createPromiseCallback } from './Util';

export default class Role extends Base {
  /**
   * Role constructor
   * @constructor Role
   * @extends {Base}
   * @param  {RBAC}     rbac       Instance of the RBAC
   * @param  {String}   name       Name of the role
   * @param  {Boolean}  [add=true] True if you need to save it to storage
   * @param  {Function} cb         Callback function after add
   */
  constructor(rbac, name, add, cb) {
    if (typeof add === 'function') {
      cb = add;
      add = true;
    }

    if (!Permission.isValidName(name)) {
      return cb(new Error('Role has no valid name'));
    }

    super(rbac, name, add, cb);
  }

  /**
   * Add role or permission to current role
   * @method Role#grant
   * @param  {Role|Permission}    item              Instance of role or permission
   * @param  {Function}           [callback]        Callback function
   * @return {Promise|undefined}                     Return  Promise if callback is not provided,otherwise return undefined
   */
  grant(item, cb) {
    cb = cb || createPromiseCallback();
    this.rbac.grant(this, item, cb);
    return cb.promise;
  }

  /**
   * Remove role or permission from current role
   * @method Role#revoke
   * @param  {Role|Permission}  item           Instance of role or permission
   * @param  {Function}   `     [callback]     Callback function
   * @return {Promise|undefined}               Return  Promise if callback is not provided,otherwise return undefined
   */
  revoke(item, cb) {
    cb = cb || createPromiseCallback();
    this.rbac.revoke(this, item, cb);
    return cb.promise;
  }

  /**
   * Return true if contains permission
   * @method Role#can
   * @param  {String}  action           Name of action
   * @param  {String}  resource         Name of resource
   * @param  {Function} [callback]      Callback function
   * @return {Promise|undefined}        Return  Promise if callback is not provided,otherwise return undefined
   */
  can(action, resource, cb) {
    cb = cb || createPromiseCallback();
    this.rbac.can(this.name, action, resource, cb);
    return cb.promise;
  }

  /**
   * Check if the role has any of the given permissions
   * @method Role#canAny
   * @param  {Array} permissions        List of permissions. Each has structure (String action, String resource)
   * @param  {Function} [callback]      Callback function
   * @return {Promise|undefined}        Return  Promise if callback is not provided,otherwise return undefined
   */
  canAny(permissions, cb) {
    cb = cb || createPromiseCallback();
    this.rbac.canAny(this.name, permissions, cb);
    return cb.promise;
  }

  /**
   * Check if the model has all of the given permissions
   * @method Role#canAll
   * @param  {Array}  permissions         List of permissions. Each has structure (String action, String resource)
   * @param  {Function} [callback]        Callback function
   * @return {Promise|undefined}          Return  Promise if callback is not provided,otherwise return undefined
   */
  canAll(permissions, cb) {
    cb = cb || createPromiseCallback();
    this.rbac.canAll(this.name, permissions, cb);
    return cb.promise;
  }

  /**
   * Return true if the current role contains the specified role name
   * @method Role#hasRole
   * @param  {String}   roleChildName     Name of role
   * @param  {Function} [callback]        Callback function
   * @return {Promise|undefined}          Return  Promise if callback is not provided,otherwise return undefined
   */
  hasRole(roleChildName, cb) {
    cb = cb || createPromiseCallback();
    this.rbac.hasRole(this.name, roleChildName, cb);
    return cb.promise;
  }

  /**
   * Return array of permission assigned to actual role
   * @method Role#getScope
   * @param  {Function} [callback]      Callback function
   * @return {Promise|undefined}        Return  Promise if callback is not provided,otherwise return undefined
   */
  getScope(cb) {
    cb = cb || createPromiseCallback();
    this.rbac.getScope(this.name, cb);
    return cb.promise;
  }
}
