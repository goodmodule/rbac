// @flow
import Storage from './Storage';
import Permission from './Permission';
import Role from './Role';
import Base from './Base';

export default class Memory extends Storage {
  items: Object[] = {};

  async add(item: Base): void {
    const { name } = item;
    if (this.items[name]) {
      throw new Error(`Item ${name} already exists`);
    }

    this.items[name] = {
      instance: item,
      grants: [],
    };
  }

  async remove(item: Base): void {
    const { name } = item;
    if (!this.items[name]) {
      throw new Error(`Item ${name} is not presented in storage`);
    }

    // revoke from all instances
    this.items = this.items.map(({ grants, instance }) => ({
      instance,
      grants: grants.filter(grant => grant !== name),
    }));

    // delete from items
    delete this.items[name];
  }

  async grant(role: Role, child: Base): void {
    const { name } = role;
    const { name: childName } = child;

    if (!this.items[name] || !this.items[childName]) {
      throw new Error('Role is not exist');
    }

    if (!(role instanceof Role)) {
      throw new Error('Role is not instance of Role');
    }

    if (name === childName) {
      throw new Error('You can grant yourself');
    }

    const { grants } = this.items[name];
    if (grants.includes(childName)) {
      throw new Error('Grant is already associated');
    }

    grants.push(childName);
  }

  async revoke(role: Role, child: Base): void {
    const { name } = role;
    const { name: childName } = child;

    if (!this.items[name] || !this.items[childName]) {
      throw new Error('Role is not exist');
    }

    const { grants } = this.items[name];
    if (!grants.includes(childName)) {
      throw new Error('Item is not associated to this item');
    }

    this.items[name].grants = grants.filter(grant => grant !== childName);
  }

  async get(name: string): ?Base {
    if (name && this.items[name]) {
      return this.items[name].instance;
    }

    return undefined;
  }

  async getRoles(): Role[] {
    return this.items
      .reduce((filtered: Role[], item: Object): void => {
        const { instance } = item;

        if (instance instanceof Role) {
          filtered.push(instance);
        }
      }, []);
  }

  async getPermissions(): Permission[] {
    return this.items
      .reduce((filtered: Permission[], item: Object): void => {
        const { instance } = item;

        if (instance instanceof Permission) {
          filtered.push(instance);
        }
      }, []);
  }

  async getGrants(role: string): Base[] {
    if (role && this.items[role]) {
      const currentGrants = this.items[role].grants;

      return currentGrants.reduce((filtered: Object[], grantName: string): void => {
        const grant = this.items[grantName];
        if (grant) {
          filtered.push(grant.instance);
        }
      }, []);
    }

    return [];
  }
}
