// @flow
import Storage from './Storage';
import Permission from './Permission';
import Role from './Role';
import Base from './Base';

export default class Memory extends Storage {
  items: Object[] = {};

  async add(item: Base): boolean {
    const { name } = item;
    if (this.items[name]) {
      throw new Error(`Item ${name} already exists`);
    }

    this.items[name] = {
      instance: item,
      grants: [],
    };

    return true;
  }

  async remove(item: Base): boolean {
    const { items } = this;
    const { name } = item;
    if (!items[name]) {
      throw new Error(`Item ${name} is not presented in storage`);
    }

    // revoke from all instances
    Object.keys(items).forEach((itemName: string) => {
      const { grants } = items[itemName];
      items[itemName].grants = grants.filter(grant => grant !== name);
    });

    // delete from items
    delete this.items[name];
    return true;
  }

  async grant(role: Role, child: Base): boolean {
    const { name } = role;
    const { name: childName } = child;

    if (!this.items[name]) {
      throw new Error(`Role ${name} is not exist`);
    }

    if (!this.items[childName]) {
      throw new Error(`Base ${childName} is not exist`);
    }

    if (!(role instanceof Role)) {
      throw new Error('Role is not instance of Role');
    }

    if (name === childName) {
      throw new Error(`You can grant yourself ${name}`);
    }

    const { grants } = this.items[name];
    if (!grants.includes(childName)) {
      grants.push(childName);
    }

    return true;
  }

  async revoke(role: Role, child: Base): boolean {
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

    return true;
  }

  async get(name: string): ?Base {
    if (name && this.items[name]) {
      return this.items[name].instance;
    }

    return undefined;
  }

  async getRoles(): Role[] {
    return this.items
      .reduce((filtered: Role[], item: Object) => {
        const { instance } = item;

        if (instance instanceof Role) {
          filtered.push(instance);
        }

        return filtered;
      }, []);
  }

  async getPermissions(): Permission[] {
    return this.items
      .reduce((filtered: Permission[], item: Object) => {
        const { instance } = item;

        if (instance instanceof Permission) {
          filtered.push(instance);
        }

        return filtered;
      }, []);
  }

  async getGrants(role: string): Base[] {
    if (role && this.items[role]) {
      const currentGrants = this.items[role].grants;

      return currentGrants.reduce((filtered: Object[], grantName: string) => {
        const grant = this.items[grantName];
        if (grant) {
          filtered.push(grant.instance);
        }

        return filtered;
      }, []);
    }

    return [];
  }
}
