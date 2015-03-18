/**
 * @constructor
 */
export default class Base {
	constructor (rbac, name, add, cb) {
		if(!rbac || !name || typeof cb !== 'function') {
			return cb(new Error('One of parameters is undefined'));
		}

		this._name = name;
		this._rbac = rbac;

		if(!add) {
			return cb(null, this);	
		}

		rbac.add(this, (err) => cb(err, this));		
	}

	/**
	 * Get name of actual instance
	 * @return {String}  Name of instance
	 */
	get name() {
		return this._name;
	}

	/**
	 * Get instance of RBAC
	 * @return {RBAC|null} Instance of RBAC 
	 */
	get rbac() {
		return this._rbac;
	}

	/**
	 * Remove item from RBAC
	 * @param  {Function} cb Callback function
	 * @return {Base}      
	 */
	remove(cb) {
		this.rbac.remove(this, cb);
		return this;
	}
}