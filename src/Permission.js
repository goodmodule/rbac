import Base from './Base';

export const DELIMITER = '_';

export default class Permission extends Base {
  /**
   * Permission constructor
   * @constructor Permission
   * @extends {Base}
   * @param  {RBAC}     rbac       Instance of the RBAC
   * @param  {String}   action     Name of the action
   * @param  {String}   resource   Name of the resource
   * @param  {Boolean}  [add=true] True if you need to save it to storage
   * @param  {Function} cb         Callback function after add
   */
  constructor(rbac, action, resource, add, cb) {
    if (typeof add === 'function') {
      cb = add;
      add = true;
    }

    if (!action || !resource) {
      return cb(new Error('One of parameters is undefined'));
    }

    if (!Permission.isValidName(action) || !Permission.isValidName(resource)) {
      return cb(new Error('Action or resource has no valid name'));
    }

    super(rbac, Permission.createName(action, resource), add, cb);
  }

  /**
   * Get action name of actual permission
   * @member Permission#action {String} Action of permission
   */
  get action() {
    if (!this._action) {
      const decoded = Permission.decodeName(this.name);
      if (!decoded) {
        throw new Error('Action is null');
      }

      this._action = decoded.action;
    }

    return this._action;
  }

  /**
   * Get resource name of actual permission
   * @member Permission#resource {String} Resource of permission
   */
  get resource() {
    if (!this._resource) {
      const decoded = Permission.decodeName(this.name);
      if (!decoded) {
        throw new Error('Resource is null');
      }

      this._resource = decoded.resource;
    }

    return this._resource;
  }

  /**
   * Return true if has same action and resource
   * @method Permission#can
   * @param  {String}  action   Name of action
   * @param  {String}  resource Name of resource
   * @return {Boolean}
   */
  can(action, resource) {
    return this.action === action && this.resource === resource;
  }

  /**
   * Compute name of permission from action and resource
   * @function createName
   * @memberof Permission
   * @param  {String} action   Name of permission
   * @param  {String} resource Resource of permission
   * @return {String}          Computed name of permission
   * @static
   */
  static createName(action, resource) {
    return action + DELIMITER + resource;
  }

  static decodeName(name) {
    const pos = name.indexOf(DELIMITER);
    if (pos === -1) {
      return null;
    }

    return {
      action: name.substr(0, pos),
      resource: name.substr(pos + 1),
    };
  }

  /**
   * Correct name can contain only alphanumeric characters
   * @function isValidName
   * @memberof Permission
   * @param  {String}  name Name
   * @return {Boolean}
   * @static
   */
  static isValidName(name) {
    if (/^[a-zA-Z0-9]+$/.test(name)) {
      return true;
    }

    return false;
  }
}
