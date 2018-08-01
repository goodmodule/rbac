// @flow
import isPlainObject from 'lodash/isPlainObject';
import Base from './Base';
import Role from './Role';
import Permission from './Permission';
import Storage from './Storage';
import MemoryStorage from './Memory';

const DEFAULT_OPTIONS = {
  permissions: {},
  roles: [],
  grant: {},
  delimiter: '_',
};

export default class RBAC {
  /**
   * Convert Array of permissions to permission name
   * @function getPermissionNames
   * @memberof RBAC
   * @param  {Array} permissions List of array items of permission names. It contan action and resource
   * @param  {string} delimiter
   * @return {string[]}
   * @static
   */
  static getPermissionNames(permissions, delimiter: string): string[] {
    if (!delimiter) {
      throw new Error('Delimiter is not defined');
    }

    return permissions.map(
      permission => Permission.createName(permission[0], permission[1], delimiter),
    );
  }

  /**
   * RBAC constructor
   * @constructor RBAC
   * @param  {Object} options             Options for RBAC
   * @param  {Storage}  [options.storage]  Storage of grants
   * @param  {Array}    [options.roles]            List of role names (String)
   * @param  {Object}   [options.permissions]      List of permissions
   * @param  {Object}   [options.grants]           List of grants
   */
  constructor(options: Object) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.storage = this.options.storage || new MemoryStorage();
    this.storage.useRBAC(this);
  }

  async init() {
    const { roles, permissions, grants } = this.options;

    return this.create(roles, permissions, grants);
  }

  /**
   * Get instance of Role or Permission by his name
   * @method RBAC#get
   * @param {String} name Name of item
   */
  async get(name: string): ?Base {
    return this.storage.get(name);
  }

  /**
   * Register role or permission to actual RBAC instance
   * @method RBAC#add
   * @param {Base} item Instance of Base
   */
  async add(item: Base): boolean {
    if (!item) {
      throw new Error('Item is undefined');
    }

    if (item.rbac !== this) {
      throw new Error('Item is associated to another RBAC instance');
    }

    return this.storage.add(item);
  }

  /**
   * Remove role or permission from RBAC
   * @method RBAC#remove
   * @param {Base} item Instance of role or permission
   */
  async remove(item: Base): boolean {
    if (!item) {
      throw new Error('Item is undefined');
    }

    if (item.rbac !== this) {
      throw new Error('Item is associated to another RBAC instance');
    }

    return this.storage.remove(item);
  }

  /**
   * Remove role or permission from RBAC
   * @method RBAC#removeByName
   * @param {String} name Name of role or permission
   */
  async removeByName(name: string): boolean {
    const item = await this.get(name);
    if (!item) {
      return true;
    }

    return item.remove();
  }

  /**
   * Grant permission or role to the role
   * @method RBAC#grant
   * @param {Role} role Instance of the role
   * @param {Base} child Instance of the role or permission
   */
  async grant(role: Role, child: Base): boolean {
    if (!role || !child) {
      throw new Error('One of item is undefined');
    }

    if (role.rbac !== this || child.rbac !== this) {
      throw new Error('Item is associated to another RBAC instance');
    }

    if (!(role instanceof Role)) {
      throw new Error('Role is not instance of Role');
    }

    return this.storage.grant(role, child);
  }

  /**
   * Revoke permission or role from the role
   * @method RBAC#revoke
   * @param {Role} role Instance of the role
   * @param {Base} child Instance of the role or permission
   */
  async revoke(role: Role, child: Base): boolean {
    if (!role || !child) {
      throw new Error('One of item is undefined');
    }

    if (role.rbac !== this || child.rbac !== this) {
      throw new Error('Item is associated to another RBAC instance');
    }

    return this.storage.revoke(role, child);
  }

  /**
   * Revoke permission or role from the role by names
   * @method RBAC#revokeByName
   * @param {String} roleName Instance of the role
   * @param {String} childName Instance of the role or permission
   */
  async revokeByName(roleName: string, childName: string): void {
    const [role, child] = await Promise.all([
      this.get(roleName),
      this.get(childName),
    ]);

    return this.revoke(role, child);
  }

  /**
   * Grant permission or role from the role by names
   * @method RBAC#grantByName
   * @param {String} roleName Instance of the role
   * @param {String} childName Instance of the role or permission
   */
  async grantByName(roleName: string, childName: string): void {
    const [role, child] = await Promise.all([
      this.get(roleName),
      this.get(childName),
    ]);

    return this.grant(role, child);
  }

  /**
   * Create a new role assigned to actual instance of RBAC
   * @method RBAC#createRole
   * @param {String} roleName Name of new Role
   * @param {Boolean} [add] True if you need to add it to the storage
   * @return {Role} Instance of the Role
   */
  async createRole(roleName: string, add?: boolean): Role {
    const role = new Role(this, roleName);
    if (add) {
      await role.add();
    }

    return role;
  }

  /**
   * Create a new permission assigned to actual instance of RBAC
   * @method RBAC#createPermission
   * @param {String} action Name of action
   * @param {String} resource Name of resource
   * @param {Boolean} [add] True if you need to add it to the storage
   * @return {Permission} Instance of the Permission
   */
  async createPermission(action:string, resource: string, add?: boolean): Permission {
    const permission = new Permission(this, action, resource);
    if (add) {
      await permission.add();
    }

    return permission;
  }

  /**
   * Callback returns true if role or permission exists
   * @method RBAC#exists
   * @param {String} name Name of item
   */
  async exists(name: string): boolean {
    return this.storage.exists(name);
  }

  /**
   * Callback returns true if role exists
   * @method RBAC#existsRole
   * @param {String} name Name of item
   */
  async existsRole(name: string): boolean {
    return this.storage.existsRole(name);
  }

  /**
   * Callback returns true if permission exists
   * @method RBAC#existsPermission
   * @param {String} action Name of action
   * @param {String} resource Name of resource
   */
  async existsPermission(action: string, resource: string): boolean {
    return this.storage.existsPermission(action, resource);
  }

  /**
   * Return instance of Role by his name
   * @method RBAC#getRole
   * @param {String} name Name of role
   */
  async getRole(name: string): ?Role {
    return this.storage.getRole(name);
  }

  /**
   * Return all instances of Role
   * @method RBAC#getRoles
   */
  async getRoles(): Role[] {
    return this.storage.getRoles();
  }

  /**
   * Return instance of Permission by his action and resource
   * @method RBAC#getPermission
   * @param {String} action Name of action
   * @param {String} resource Name of resource
   */
  async getPermission(action: string, resource: string): ?Permission {
    return this.storage.getPermission(action, resource);
  }

  /**
   * Return instance of Permission by his name
   * @method RBAC#getPermission
   * @param {String} name Name of permission
   */
  async getPermissionByName(name: string): ?Permission {
    const data = Permission.decodeName(name, this.options.delimiter);
    return this.storage.getPermission(data.action, data.resource);
  }

  /**
   * Return all instances of Permission
   * @method RBAC#getPermissions
   */
  async getPermissions(): Permission[] {
    return this.storage.getPermissions();
  }

  /**
   * Create multiple permissions in one step
   * @method RBAC#createPermissions
   * @param {Object} permissions Object of permissions
   * @param {Boolean} [add=true] True if you need to add it to the storage
   */
  async createPermissions(resources: Object, add?: boolean = true): Permission[] {
    if (!isPlainObject(resources)) {
      throw new Error('Resources is not a plain object');
    }

    const permissions = {};

    await Promise.all(Object.keys(resources).map(async (resource) => {
      const actions = resources[resource];

      await Promise.all(actions.map(async (action) => {
        const permission = await this.createPermission(action, resource, add);
        permissions[permission.name] = permission;
      }));
    }));

    return permissions;
  }

  /**
   * Create multiple roles in one step assigned to actual instance of RBAC
   * @method RBAC#createRoles
   * @param {Array} roleNames Array of role names
   * @param {Boolean} [add=true] True if you need to add it to the storage
   */
  async createRoles(roleNames: string[], add?: boolean = true): Role[] {
    const roles = {};
    await Promise.all(roleNames.map(async (roleName) => {
      const role = await this.createRole(roleName, add);

      roles[role.name] = role;
    }));

    return roles;
  }

  /**
   * Grant multiple items in one function
   * @method RBAC#grants
   * @param {Object} List of roles
   */
  async grants(roles: Object) {
    if (!isPlainObject(roles)) {
      throw new Error('Grants is not a plain object');
    }

    await Promise.all(Object.keys(roles).map(async (roleName) => {
      const grants = roles[roleName];

      await Promise.all(grants.map(async (grant) => {
        await this.grantByName(roleName, grant);
      }));
    }));
  }

  /**
   * Create multiple permissions and roles in one step
   * @method RBAC#create
   * @param {Object[]} roleNames List of role names
   * @param {Object[]} permissionNames List of permission names
   * @param {Object} [grants] List of grants
   */
  async create(roleNames, permissionNames, grantsData): Object {
    const [permissions, roles] = await Promise.all([
      this.createPermissions(permissionNames),
      this.createRoles(roleNames),
    ]);


    if (grantsData) {
      await this.grants(grantsData);
    }

    return {
      permissions,
      roles,
    };
  }

  /**
   * Traverse hierarchy of roles.
   * Callback function returns as second parameter item from hierarchy or null if we are on the end of hierarchy.
   * @method RBAC#_traverseGrants
   * @param {string} roleName  Name of role
   * @param {Function} cb Callback function
   * @private
   */
  async traverseGrants(roleName: string, cb: Function, next: String[] = [roleName], used: Object = {}): any {
    const actualRole = next.shift();
    used[actualRole] = true;

    const grants = await this.storage.getGrants(actualRole);
    for (let i = 0; i < grants.length; i += 1) {
      const item = grants[i];
      const { name } = item;

      if (item instanceof Role && !used[name]) {
        used[name] = true;
        next.push(name);
      }

      const result = await cb(item);
      if (result !== undefined) {
        return result;
      }
    }

    if (next.length) {
      return this.traverseGrants(null, cb, next, used);
    }
  }

  /**
   * Return true if role has allowed permission
   * @method RBAC#can
   * @param {string} roleName Name of role
   * @param {string} action Name of action
   * @param {string} resource Name of resource
   * @return {boolean}
   */
  async can(roleName: string, action: string, resource: string): boolean {
    const can = await this.traverseGrants(roleName, (item) => {
      if (item instanceof Permission && item.can(action, resource)) {
        return true;
      }
    });

    return can || false;
  }


  /**
   * Check if the role has any of the given permissions.
   * @method RBAC#canAny
   * @param  {string} roleName Name of role
   * @param  {Object[]}  permissions Array (String action, String resource)
   * @return {boolean}
   */
  async canAny(roleName: string, permissions: Object[]): boolean {
    // prepare the names of permissions
    const permissionNames = RBAC.getPermissionNames(permissions, this.options.delimiter);

    // traverse hierarchy
    const can = await this.traverseGrants(roleName, (item) => {
      if (item instanceof Permission && permissionNames.includes(item.name)) {
        return true;
      }

      return undefined;
    });

    return can || false;
  }

  /**
   * Check if the model has all of the given permissions.
   * @method RBAC#canAll
   * @param {string} roleName Name of role
   * @param {Object[]} permissions Array (String action, String resource)
   * @return {boolean} Current instance
   */
  async canAll(roleName: string, permissions: Object[]) {
    // prepare the names of permissions
    const permissionNames = RBAC.getPermissionNames(permissions, this.options.delimiter);
    const founded = {};
    let foundedCount = 0;

    // traverse hierarchy
    await this.traverseGrants(roleName, (item) => {
      if (item instanceof Permission && permissionNames.includes(item.name) && !founded[item.name]) {
        founded[item.name] = true;
        foundedCount += 1;

        if (foundedCount === permissionNames.length) {
          return true;
        }
      }

      return undefined;
    });

    return foundedCount === permissionNames.length;
  }

  /**
   * Return true if role has allowed permission
   * @method RBAC#hasRole
   * @param {String} roleName Name of role
   * @param {String} roleChildName Name of child role
   * @return {boolean}
   */
  async hasRole(roleName: string, roleChildName: string): boolean {
    if (roleName === roleChildName) {
      return true;
    }

    const has = await this.traverseGrants(roleName, (item) => {
      if (item instanceof Role && item.name === roleChildName) {
        return true;
      }

      return undefined;
    });

    return has || false;
  }

  /**
   * Return array of all permission assigned to role of RBAC
   * @method RBAC#getScope
   * @param  {string} roleName   Name of role
   * @return {string[]}
   */
  async getScope(roleName: string): string[] {
    const scope = [];

    // traverse hierarchy
    await this.traverseGrants(roleName, (item) => {
      if (item instanceof Permission && !scope.includes(item.name)) {
        scope.push(item.name);
      }
    });

    return scope;
  }
}
