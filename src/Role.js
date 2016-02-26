import Base from './Base';
import Permission from './Permission';

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
   * @param  {Role|Permission} item Instance of role or permission
   * @param  {Function} cb          Callback function
   * @return {Role}                 Return current instance of role
   */
  grant(item, cb) {
    this.rbac.grant(this, item, cb);
    return this;
  }

  /**
   * Remove role or permission from current role
   * @method Role#revoke
   * @param  {Role|Permission} item Instance of role or permission
   * @param  {Function} cb          Callback function
   * @return {Role}                 Return current instance of role
   */
  revoke(item, cb) {
    this.rbac.revoke(this, item, cb);
    return this;
  }

  /**
   * Return true if contains permission
   * @method Role#can
   * @param  {String}  action   Name of action
   * @param  {String}  resource Name of resource
   * @param  {Function} cb      Callback function
   * @return {Role}             Return current instance of role
   */
  can(action, resource, cb) {
    this.rbac.can(this.name, action, resource, cb);
    return this;
  }

  /**
   * Check if the role has any of the given permissions
   * @method Role#canAny
   * @param  {Array} permissions  List of permissions. Each has structure (String action, String resource)
   * @param  {Function} cb      Callback function
   * @return {Role}               Return current instance of role
   */
  canAny(permissions, cb) {
    this.rbac.canAny(this.name, permissions, cb);
    return this;
  }

  /**
   * Check if the model has all of the given permissions
   * @method Role#canAll
   * @param  {Array}  permissions List of permissions. Each has structure (String action, String resource)
   * @param  {Function} cb      Callback function
   * @return {Role}               Return current instance of role
   */
  canAll(permissions, cb) {
    this.rbac.canAll(this.name, permissions, cb);
    return this;
  }

  /**
   * Return true if the current role contains the specified role name
   * @method Role#hasRole
   * @param  {String} roleChildName Name of role
   * @param  {Function} cb          Callback function
   * @return {Role}                 Return current instance of role
   */
  hasRole(roleChildName, cb) {
    this.rbac.hasRole(this.name, roleChildName, cb);
    return this;
  }

  /**
   * Return array of permission assigned to actual role
   * @method Role#getScope
   * @param  {Function} cb  Callback function
   * @return {Role}         Return current instance of role
   */
  getScope(cb) {
    this.rbac.getScope(this.name, cb);
    return this;
  }
}
