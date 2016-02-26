import Storage from './index';
import Permission from '../Permission';
import Role from '../Role';

export default class Memory extends Storage {
  constructor() {
    super();

    this._items = {};
  }

  add(item, cb) {
    const name = item.name;
    if (this._items[name]) {
      return cb(null, this._items[name].item);
    }

    this._items[name] = {
      instance: item,
      grants: [],
    };

    cb(null, item);
    return this;
  }

  remove(item, cb) {
    const name = item.name;
    if (!this._items[name]) {
      return cb(new Error('Item is not presented in storage'));
    }

    // revoke from all instances
    for (const index in this._items) {
      if (!this._items.hasOwnProperty(index)) {
        continue;
      }

      const grants = this._items[index].grants;

      for (let i = 0; i < grants.length; i++) {
        if (grants[i] === name) {
          grants.splice(i, 1);
          break;
        }
      }
    }

    // delete from items
    delete this._items[name];

    cb(null, true);
    return this;
  }

  grant(role, child, cb) {
    const name = role.name;
    const childName = child.name;

    if (!this._items[name] || !this._items[childName]) {
      return cb(new Error('Role is not exist'));
    }

    if (!role instanceof Role) {
      return cb(new Error('Role is not instance of Role'));
    }

    if (name === childName) {
      return cb(new Error('You can grant yourself'));
    }

    const grants = this._items[name].grants;
    for (let i = 0; i < grants.length; i++) {
      const grant = grants[i];

      if (grant === childName) {
        return cb(null, true);
      }
    }

    grants.push(childName);
    cb(null, true);
    return this;
  }

  revoke(role, child, cb) {
    const name = role.name;
    const childName = child.name;

    if (!this._items[name] || !this._items[childName]) {
      return cb(new Error('Role is not exist'));
    }

    const grants = this._items[name].grants;
    for (let i = 0; i < grants.length; i++) {
      const grant = grants[i];

      if (grant === childName) {
        grants.splice(i, 1);
        return cb(null, true);
      }
    }

    cb(new Error('Item is not associated to this item'));
    return this;
  }

  get(name, cb) {
    if (!name || !this._items[name]) {
      return cb(null, null);
    }

    cb(null, this._items[name].instance);
    return this;
  }

  getRoles(cb) {
    const items = [];

    for (const name in this._items) {
      if (!this._items.hasOwnProperty(name)) {
        continue;
      }

      const item = this._items[name].instance;

      if (item instanceof Role) {
        items.push(item);
      }
    }

    cb(null, items);
    return this;
  }

  getPermissions(cb) {
    const items = [];

    for (const name in this._items) {
      if (!this._items.hasOwnProperty(name)) {
        continue;
      }

      const item = this._items[name].instance;

      if (item instanceof Permission) {
        items.push(item);
      }
    }

    cb(null, items);
    return this;
  }

  getGrants(role, cb) {
    if (!role || !this._items[role]) {
      return cb(null, null);
    }

    const roleGrants = this._items[role].grants;

    const grants = [];
    for (let i = 0; i < roleGrants.length; i++) {
      const grantName = roleGrants[i];
      const grant = this._items[grantName];
      if (!grant) {
        continue;
      }

      grants.push(grant.instance);
    }

    cb(null, grants);
    return this;
  }
}
