import Base from './Base';
import { Permission } from './Permission';
import type { RBAC } from './RBAC';
import { ActionType, PermissionParam, ResourceType, RoleType } from './types';

export class Role extends Base {
  constructor(
    public rbac: RBAC,
    name: RoleType,
  ) {
    if (!Permission.isValidName(name, rbac.options.delimiter)) {
      throw new Error('Role has no valid name');
    }

    super(rbac, name);
  }

  /**  Add role or permission to current role */
  async grant(item: Role | Permission): Promise<boolean> {
    return this.rbac.grant(this, item);
  }

  /** Remove role or permission from current role */
  async revoke(item: Role | Permission): Promise<boolean> {
    return this.rbac.revoke(this, item);
  }

  /** Return true if contains permission */
  async can(action: ActionType, resource: ResourceType): Promise<boolean> {
    return this.rbac.can(this.name, action, resource);
  }

  /** Check if the role has any of the given permissions */
  async canAny(permissions: PermissionParam[]): Promise<boolean> {
    return this.rbac.canAny(this.name, permissions);
  }

  /** Check if the model has all the given permissions */
  async canAll(permissions: PermissionParam[]): Promise<boolean> {
    return this.rbac.canAll(this.name, permissions);
  }

  /** Return true if the current role contains the specified role name */
  async hasRole(roleChildName: RoleType): Promise<boolean> {
    return this.rbac.hasRole(this.name, roleChildName);
  }

  /** Return array of permission assigned to actual role */
  async getScope(): Promise<Base['name'][]> {
    return this.rbac.getScope(this.name);
  }
}
