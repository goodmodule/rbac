import Base from '../Base';
import { Permission } from '../Permission';
import type { RBAC } from '../RBAC';
import { Role } from '../Role';
import { ActionType, ResourceType, RoleType } from '../types';

export default class Storage {
  public rbac: RBAC | null = null;

  useRBAC(rbac: RBAC): void {
    if (this.rbac) {
      throw new Error('Storage is already in use with another instance of RBAC');
    }

    this.rbac = rbac;
  }

  /** Add permission or role */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async add(item: Base): Promise<boolean> {
    throw new Error('Storage method add is not implemented');
  }

  /** Remove permission or role */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(item: Base): Promise<boolean> {
    throw new Error('Storage method remove is not implemented');
  }

  /** Add (grant) permission or role to hierarchy of actual role */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async grant(role: Base, child: Base): Promise<boolean> {
    throw new Error('Storage method grant is not implemented');
  }

  /** Remove (revoke) permission or role from hierarchy of actual role */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async revoke(role: Base, child: Base): Promise<boolean> {
    throw new Error('Storage method revoke is not implemented');
  }

  /** Get instance of permission or role by his name */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(name: string): Promise<Base | undefined> {
    throw new Error('Storage method get is not implemented');
  }

  /** Get all instances of Roles */
  async getRoles(): Promise<Role[]> {
    throw new Error('Storage method getRoles is not implemented');
  }

  /** Get all instances of Permissions */
  async getPermissions(): Promise<Permission[]> {
    throw new Error('Storage method getPermissions is not implemented');
  }

  /** Get instances of Roles and Permissions assigned to role */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getGrants(role: RoleType): Promise<Base[]> {
    throw new Error('Storage method getGrants is not implemented');
  }

  /** Get instance of role by his name */
  async getRole(name: string): Promise<Role | undefined> {
    const role = await this.get(name);
    if (role && role instanceof Role) {
      return role;
    }

    return undefined;
  }

  /** Get instance of permission by his name */
  async getPermission(action: ActionType, resource: ResourceType): Promise<Permission | undefined> {
    if (!this.rbac) {
      throw new Error('RBAC instance not set!');
    }

    const name = Permission.createName(action, resource, this.rbac.options.delimiter);
    const item = await this.get(name);

    if (item && item instanceof Permission) {
      return item;
    }

    return undefined;
  }

  /** Return true with callback if role or permission exists */
  async exists(name: string): Promise<boolean> {
    const item = await this.get(name);
    return !!item;
  }

  /** Return true with callback if role exists */
  async existsRole(name: string): Promise<boolean> {
    const role = await this.getRole(name);
    return !!role;
  }

  /** Return true with callback if permission exists */
  async existsPermission(action: ActionType, resource: ResourceType): Promise<boolean> {
    const permission = await this.getPermission(action, resource);
    return !!permission;
  }
}
