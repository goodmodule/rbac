// @flow
import Permission from './Permission';
import Role from './Role';
import Base from './Base';
import type RBAC from './RBAC';

export default class Storage {
  useRBAC(rbac: RBAC): void {
    if (this.rbac) {
      throw new Error('Storage is already in use with another instance of RBAC');
    }

    this.rbac = rbac;
  }

  /**
   * Add permission or role
   * @method Storage#add
   * @param {Base} item Instance of role or permission
   */
  async add(item: Base): boolean {
    throw new Error('Storage method add is not implemented');
  }

  /**
   * Remove permission or role
   * @method Storage#remove
   * @param {Base} item Instance of role or permission
   */
  async remove(item: Base): boolean {
    throw new Error('Storage method remove is not implemented');
  }

  /**
   * Add (grant) permission or role to hierarchy of actual role
   * @method Storage#grant
   * @param  {Role} role  Instance of role
   * @param  {Base} child Instance of role or permission
   */
  async grant(role: Role, child: Base): boolean {
    throw new Error('Storage method grant is not implemented');
  }

  /**
   * Remove (revoke) permission or role from hierarchy of actual role
   * @method Storage#revoke
   * @param  {Role} role  Instance of role
   * @param  {Base} child Instance of role or permission
   */
  async revoke(role: Role, child: Base): boolean {
    throw new Error('Storage method revoke is not implemented');
  }

  /**
   * Get instance of permission or role by his name
   * @method Storage#get
   * @param  {String} name Name of role or permission
   * @return {Base}
   */
  async get(name: string): ?Base {
    throw new Error('Storage method get is not implemented');
  }

  /**
   * Get all instances of Roles
   * @method Storage#getRoles
   * @return {Role[]}
   */
  async getRoles(): Role[] {
    throw new Error('Storage method getRoles is not implemented');
  }

  /**
   * Get all instances of Permissions
   * @method Storage#getPermissions
   * @return {Permission[]}
   */
  async getPermissions(): Permission[] {
    throw new Error('Storage method getPermissions is not implemented');
  }

  /**
   * Get instances of Roles and Permissions assigned to role
   * @method Storage#getGrants
   * @param  {String} role Name of role
   * @return {Base[]}
   */
  async getGrants(role: string): Base[] {
    throw new Error('Storage method getGrants is not implemented');
  }

  /**
   * Get instance of role by his name
   * @method Storage#getRole
   * @param  {String} name Name of role
   * @return {Role}
   */
  async getRole(name: string): ?Role {
    const role = await this.get(name);
    if (role && role instanceof Role) {
      return role;
    }

    return undefined;
  }

  /**
   * Get instance of permission by his name
   * @method Storage#getPermission
   * @param  {string} action   Name of action
   * @param  {string} resource Name of resource
   * @return {Permission}           Instance of actual storage
   */
  async getPermission(action: string, resource: string): ?Permission {
    const name = Permission.createName(action, resource, this.rbac.options.delimiter);
    const item = await this.get(name);
    if (item && item instanceof Permission) {
      return item;
    }

    return undefined;
  }

  /**
   * Return true with callback if role or permission exists
   * @method Storage#exists
   * @param  {string} name Name of role or permission
   * @return {boolean}
   */
  async exists(name: string): boolean {
    const item = await this.get(name);
    return !!item;
  }

  /**
   * Return true with callback if role exists
   * @method Storage#existsRole
   * @param  {string} name Name of role
   * @return {boolean}
   */
  async existsRole(name: string): boolean {
    const role = await this.getRole(name);
    return !!role;
  }

  /**
   * Return true with callback if permission exists
   * @method Storage#existsPermission
   * @param  {string} action Name of action
   * @param  {string} resource Name of resource
   * @return {boolean}
   */
  async existsPermission(action: string, resource: string): boolean {
    const permission = await this.getPermission(action, resource);
    return !!permission;
  }
}
