import { createPromiseCallback } from "./Util";

export default class Base {
  /**
   * Base constructor
   * @constructor Base
   * @param  {RBAC}     rbac     Instance of the RBAC
   * @param  {String}   name     Name of the grant
   * @param  {Boolean}  add      True if you need to save it to storage
   * @param  {Function} cb       Callback function after add
   */
  constructor(rbac, name, add, cb) {
    if (!rbac || !name || typeof cb !== 'function') {
      return cb(new Error('One of parameters is undefined'));
    }

    this._name = name;
    this._rbac = rbac;

    if (!add) {
      return cb(null, this);
    }

    rbac.add(this, (err) => cb(err, this));
  }

  /**
   * Get name of actual instance
   * @member Base#name {String}
   */
  get name() {
    return this._name;
  }

  /**
   * Get instance of RBAC
   * @member Base#rbac {RBAC|null} Instance of RBAC
   */
  get rbac() {
    return this._rbac;
  }

  /**
   * Remove this from RBAC (storage)
   * @method Base#remove
   * @param  {Function}         [callback]  Callback function
   * @return {Promise|undefined}            Return  Promise if callback is not provided,otherwise return undefined
   */
  remove(cb) {
    cb = cb || createPromiseCallback();
    this.rbac.remove(this, cb);
    return cb.promise;
  }
}
