// @flow
import type RBAC from './RBAC';

export default class Base {
  /**
   * Base constructor
   * @constructor Base
   * @param  {RBAC}     rbac     Instance of the RBAC
   * @param  {String}   name     Name of the grant
   * @param  {Function} cb       Callback function after add
   */
  constructor(rbac: RBAC, name: string) {
    if (!rbac || !name) {
      throw new Error('One of parameters is undefined');
    }

    this.name = name;
    this.rbac = rbac;
  }

  /**
   * Add this to RBAC (storage)
   * @method Base#remove
   * @return {boolean}
   */
  async add(): boolean {
    const { rbac } = this;
    return rbac.add(this);
  }

  /**
   * Remove this from RBAC (storage)
   * @method Base#remove
   * @return {boolean}
   */
  async remove(): boolean {
    const { rbac } = this;
    return rbac.remove(this);
  }
}
