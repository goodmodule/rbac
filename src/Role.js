// @flow
import Base from './Base';
import Permission from './Permission';
import type RBAC from './RBAC';

export default class Role extends Base {
  /**
   * Role constructor
   * @constructor Role
   * @extends {Base}
   * @param {RBAC} rbac Instance of the RBAC
   * @param {String} name Name of the role
   */
  constructor(rbac: RBAC, name: string) {
    if (!Permission.isValidName(name, rbac.options.delimiter)) {
      throw new Error('Role has no valid name');
    }

    super(rbac, name);
  }

  /**
   * Add role or permission to current role
   * @method Role#grant
   * @param {Role|Permission} item Instance of role or permission
   */
  async grant(item: Base) {
    return this.rbac.grant(this, item);
  }

  /**
   * Remove role or permission from current role
   * @method Role#revoke
   * @param {Role|Permission} item Instance of role or permission
   */
  async revoke(item: Base): boolean {
    return this.rbac.revoke(this, item);
  }

  /**
   * Return true if contains permission
   * @method Role#can
   * @param {string} action Name of action
   * @param {string} resource Name of resource
   */
  async can(action: string, resource: string): boolean {
    return this.rbac.can(this.name, action, resource);
  }

  /**
   * Check if the role has any of the given permissions
   * @method Role#canAny
   * @param {Array} permissions List of permissions. Each has structure (String action, String resource)
   */
  async canAny(permissions): boolean {
    return this.rbac.canAny(this.name, permissions);
  }

  /**
   * Check if the model has all of the given permissions
   * @method Role#canAll
   * @param {Array}  permissions List of permissions. Each has structure (String action, String resource)
   */
  async canAll(permissions): boolean {
    return this.rbac.canAll(this.name, permissions);
  }

  /**
   * Return true if the current role contains the specified role name
   * @method Role#hasRole
   * @param {String} roleChildName Name of role
   */
  async hasRole(roleChildName: string): boolean {
    return this.rbac.hasRole(this.name, roleChildName);
  }

  /**
   * Return array of permission assigned to actual role
   * @method Role#getScope
   */
  async getScope(): Permission[] {
    return this.rbac.getScope(this.name);
  }
}
