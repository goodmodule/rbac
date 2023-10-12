import type { RBAC } from './RBAC';
import { GrandType, RoleType } from './types';

export default class Base {
  public name: RoleType | GrandType;
  public rbac: RBAC;

  constructor(rbac: RBAC, name: string) {
    if (!rbac || !name) {
      throw new Error('One of parameters is undefined');
    }

    this.name = name;
    this.rbac = rbac;
  }

  /** Add this to RBAC (storage) */
  async add(): Promise<boolean> {
    return this.rbac.add(this);
  }

  /**  Remove this from RBAC (storage) */
  async remove(): Promise<boolean> {
    return this.rbac.remove(this);
  }
}
