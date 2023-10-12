import isPlainObject from 'lodash/isPlainObject';

import Base from './Base';
import { Memory as MemoryStorage } from './Memory';
import { Permission } from './Permission';
import { Role } from './Role';
import { Storage } from './Storage';
import {
  ActionType,
  GrandsType,
  PermissionParam,
  PermissionType,
  RBACOptionsType,
  RBACType,
  ResourceType,
  RoleType,
  TraverseGrantsParams,
} from './types';

const DEFAULT_OPTIONS: RBACOptionsType = {
  permissions: {},
  roles: [],
  grants: {},
  delimiter: '_',
};

export class RBAC {
  public options: RBACOptionsType;

  private storage: Storage;
  static Role: typeof Role;
  static Permission: typeof Permission;
  static Storage: typeof Storage;

  /** Convert Array of permissions to permission name */
  static getPermissionNames(permissions: PermissionParam[], delimiter: string): string[] {
    if (!delimiter) {
      throw new Error('Delimiter is not defined');
    }

    return permissions.map(permission => Permission.createName(permission[0], permission[1], delimiter));
  }

  constructor(options: Partial<RBACOptionsType>) {
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

  /** Get instance of Role or Permission by his name */
  async get(name: string): Promise<Base | undefined> {
    return this.storage.get(name);
  }

  /** Register role or permission to actual RBAC instance */
  async add(item: Base): Promise<boolean> {
    if (!item) {
      throw new Error('Item is undefined');
    }

    if (item.rbac !== this) {
      throw new Error('Item is associated to another RBAC instance');
    }

    return this.storage.add(item);
  }

  /** Remove role or permission from RBAC */
  async remove(item: Base): Promise<boolean> {
    if (!item) {
      throw new Error('Item is undefined');
    }

    if (item.rbac !== this) {
      throw new Error('Item is associated to another RBAC instance');
    }

    return this.storage.remove(item);
  }

  /** Remove role or permission from RBAC */
  async removeByName(name: string): Promise<boolean> {
    const item = await this.get(name);
    if (!item) {
      return true;
    }

    return item.remove();
  }

  /** Grant permission or role to the role */
  async grant(role?: Base, child?: Base): Promise<boolean> {
    if (!role || !child) {
      throw new Error('One of item is undefined');
    }

    if (role.rbac !== this || child.rbac !== this) {
      throw new Error('Item is associated to another RBAC instance');
    }

    // if (!(role instanceof Role)) {
    //   throw new Error('Role is not instance of Role');
    // }

    return this.storage.grant(role, child);
  }

  /** Revoke permission or role from the role */
  async revoke(role?: Base, child?: Base): Promise<boolean> {
    if (!role || !child) {
      throw new Error('One of item is undefined');
    }

    if (role.rbac !== this || child.rbac !== this) {
      throw new Error('Item is associated to another RBAC instance');
    }

    return this.storage.revoke(role, child);
  }

  /** Revoke permission or role from the role by names */
  async revokeByName(roleName: string, childName: string): Promise<boolean> {
    const [role, child] = await Promise.all([this.get(roleName), this.get(childName)]);

    return this.revoke(role, child);
  }

  /** Grant permission or role from the role by names */
  async grantByName(roleName: string, childName: string): Promise<boolean> {
    const [role, child] = await Promise.all([this.get(roleName), this.get(childName)]);

    return this.grant(role, child);
  }

  /** Create a new role assigned to actual instance of RBAC */
  async createRole(roleName: RoleType, add?: boolean): Promise<Role> {
    const role = new Role(this, roleName);
    if (add) {
      await role.add();
    }

    return role;
  }

  /** Create a new permission assigned to actual instance of RBAC */
  async createPermission(action: ActionType, resource: ResourceType, add?: boolean): Promise<Permission> {
    const permission = new Permission(this, action, resource);
    if (add) {
      await permission.add();
    }

    return permission;
  }

  /** Callback returns true if role or permission exists */
  async exists(name: string): Promise<boolean> {
    return this.storage.exists(name);
  }

  /** Callback returns true if role exists */
  async existsRole(name: string): Promise<boolean> {
    return this.storage.existsRole(name);
  }

  /** Callback returns true if permission exists */
  async existsPermission(action: string, resource: string): Promise<boolean> {
    return this.storage.existsPermission(action, resource);
  }

  /**  Return instance of Role by his name */
  async getRole(name: string): Promise<Role | undefined> {
    return this.storage.getRole(name);
  }

  /** Return all instances of Role */
  async getRoles(): Promise<Role[]> {
    return this.storage.getRoles();
  }

  /** Return instance of Permission by his action and resource */
  async getPermission(action: string, resource: string): Promise<Permission | undefined> {
    return this.storage.getPermission(action, resource);
  }

  /** Return instance of Permission by his name */
  async getPermissionByName(name: string): Promise<Permission | undefined> {
    const data = Permission.decodeName(name, this.options.delimiter);
    return this.storage.getPermission(data.action, data.resource);
  }

  /** Return all instances of Permission */
  async getPermissions(): Promise<Permission[]> {
    return this.storage.getPermissions();
  }

  /** Create multiple permissions in one step */
  async createPermissions(resources: PermissionType, add = true): Promise<Record<string, Permission>> {
    if (!isPlainObject(resources)) {
      throw new Error('Resources is not a plain object');
    }

    const permissions: Record<string, Permission> = {};

    await Promise.all(
      Object.keys(resources).map(async resource => {
        const actions = resources[resource];

        await Promise.all(
          actions.map(async action => {
            const permission = await this.createPermission(action, resource, add);
            permissions[permission.name] = permission;
          }),
        );
      }),
    );

    return permissions;
  }

  /** Create multiple roles in one step assigned to actual instance of RBAC */
  async createRoles(roleNames: RoleType[], add = true): Promise<Record<string, Role>> {
    const roles: Record<string, Role> = {};
    await Promise.all(
      roleNames.map(async roleName => {
        const role = await this.createRole(roleName, add);

        roles[role.name] = role;
      }),
    );

    return roles;
  }

  /** Grant multiple items in one function */
  async grants(roles: GrandsType) {
    if (!isPlainObject(roles)) {
      throw new Error('Grants is not a plain object');
    }

    await Promise.all(
      Object.keys(roles).map(async roleName => {
        const grants = roles[roleName];

        await Promise.all(
          grants.map(async grant => {
            await this.grantByName(roleName, grant);
          }),
        );
      }),
    );
  }

  /** Create multiple permissions and roles in one step */
  async create(roleNames: RoleType[], permissionNames: PermissionType, grantsData?: GrandsType): Promise<RBACType> {
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
   * */
  async traverseGrants({
    roleName,
    handle,
    next = [roleName],
    used = {},
  }: TraverseGrantsParams): Promise<boolean | undefined> {
    const actualRole = next.shift();
    actualRole && (used[actualRole] = true);

    const grants = actualRole ? await this.storage.getGrants(actualRole) : [];
    for (let i = 0; i < grants.length; i += 1) {
      const item = grants[i];
      const { name } = item;

      if (item instanceof Role && !used[name]) {
        used[name] = true;
        next.push(name);
      }

      const result = await handle(item);
      if (result !== null) {
        return result;
      }
    }

    if (next.length) {
      return this.traverseGrants({ roleName: void 0, handle, next, used });
    }
  }

  /** Return true if role has allowed permission */
  async can(roleName: RoleType, action: ActionType, resource: ResourceType): Promise<boolean> {
    const can = await this.traverseGrants({
      roleName: roleName,
      handle: async item => {
        if (item instanceof Permission && item.can(action, resource)) {
          return true;
        }

        return null;
      },
    });

    return can || false;
  }

  /** Check if the role has any of the given permissions. */
  async canAny(roleName: RoleType, permissions: PermissionParam[]): Promise<boolean> {
    // prepare the names of permissions
    const permissionNames = RBAC.getPermissionNames(permissions, this.options.delimiter);

    // traverse hierarchy
    const can = await this.traverseGrants({
      roleName: roleName,
      handle: async item => {
        if (item instanceof Permission && permissionNames.includes(item.name)) {
          return true;
        }

        return null;
      },
    });

    return can || false;
  }

  /** Check if the model has all the given permissions. */
  async canAll(roleName: RoleType, permissions: PermissionParam[]) {
    // prepare the names of permissions
    const permissionNames = RBAC.getPermissionNames(permissions, this.options.delimiter);
    const founded: Record<RoleType, boolean> = {};
    let foundedCount = 0;

    // traverse hierarchy
    await this.traverseGrants({
      roleName: roleName,
      handle: async item => {
        if (item instanceof Permission && permissionNames.includes(item.name) && !founded[item.name]) {
          founded[item.name] = true;
          foundedCount += 1;

          if (foundedCount === permissionNames.length) {
            return true;
          }
        }

        return null;
      },
    });

    return foundedCount === permissionNames.length;
  }

  /** Return true if role has allowed permission */
  async hasRole(roleName: RoleType, roleChildName: RoleType): Promise<boolean> {
    if (roleName === roleChildName) {
      return true;
    }

    const has = await this.traverseGrants({
      roleName: roleName,
      handle: async item => {
        if (item instanceof Role && item.name === roleChildName) {
          return true;
        }

        return null;
      },
    });

    return has || false;
  }

  /** Return array of all permission assigned to role of RBAC */
  async getScope(roleName: RoleType): Promise<Base['name'][]> {
    const scope: Base['name'][] = [];

    // traverse hierarchy
    await this.traverseGrants({
      roleName: roleName,
      handle: async item => {
        if (item instanceof Permission && !scope.includes(item.name)) {
          scope.push(item.name);
        }

        return null;
      },
    });

    return scope;
  }
}
