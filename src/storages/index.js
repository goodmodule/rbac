import Permission from '../permission';
import Role from '../role';

export default class Storage {
	/**
	 * Constructor of storage
	 */
	constructor () {
		this._rbac = null;
	}

	get rbac() {
		return this._rbac;
	}

	set rbac(rbac) {
		if(this._rbac) {
			throw new Error('RBAC is already setted');
		}

		this._rbac = rbac;
	}

	/**
	 * Add permission or role
	 * @param {Base}   item    Instance of role or permission
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	add (item, cb) {
		cb(new Error('Storage method add is not implemented'));
	}

	/**
	 * Remove permission or role
	 * @param {Base}   item    Instance of role or permission
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	remove (item, cb) {
		cb(new Error('Storage method remove is not implemented'));
	}

	/**
	 * Add (grant) permission or role to hierarchy of actual role
	 * @param  {Role}   role  Instance of role
	 * @param  {Base}   child Instance of role or permission
	 * @param  {Function} cb    Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	grant (role, child, cb) {
		cb(new Error('Storage method grant is not implemented'));
	}

	/**
	 * Remove (revoke) permission or role from hierarchy of actual role
	 * @param  {Role}   role  Instance of role
	 * @param  {Base}   child Instance of role or permission
	 * @param  {Function} cb    Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	revoke (role, child, cb) {
		cb(new Error('Storage method revoke is not implemented'));
	}

	/**
	 * Get instance of permission or role by his name
	 * @param  {String}   name Name of role or permission
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	get (name, cb) {
		cb(new Error('Storage method get is not implemented'));
	}

	/**
	 * Get all instances of Roles
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	getRoles (cb) {
		cb(new Error('Storage method getRoles is not implemented'));
	}

	/**
	 * Get all instances of Permissions
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	getPermissions (cb) {
		cb(new Error('Storage method getPermissions is not implemented'));
	}

	/**
	 * Get instances of Roles and Permissions assigned to role
	 * @param  {String}   role Name of role
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	getGrants (role, cb) {
		cb(new Error('Storage method getGrants is not implemented'));
	}

	/**
	 * Get instance of role by his name
	 * @param  {String}   name Name of role
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	getRole (name, cb) {
		this.get(name, function(err, item) {
			if(err || !item) {
				return cb(err, item);
			}

			if(item instanceof Role) {
				return cb(null, item);
			}

			cb(null, null);
		});

		return this;
	}

	/**
	 * Get instance of permission by his name
	 * @param  {String}   action   Name of action
	 * @param  {String}   resource Name of resource
	 * @param  {Function} cb       Callback function
	 * @return {[type]}            Instance of actual storage
	 */
	getPermission (action, resource, cb) {
		var name = Permission.createName(action, resource);

		this.get(name, function(err, item) {
			if(err || !item) {
				return cb(err, item);
			}

			if(item instanceof Permission) {
				return cb(null, item);
			}

			cb(null, null);
		});

		return this;
	}

	/**
	 * Return true with callback if role or permission exists
	 * @param  {String}   name Name of role or permission
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	exists (name, cb) {
		this.get(name, function(err, item) {
			if(err) {
				return cb(err);
			}

			if(!item) {
				return cb(null, false);
			}

			return cb(null, true);
		});

		return this;
	}

	/**
	 * Return true with callback if role exists
	 * @param  {String}   name Name of role
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	existsRole (name, cb) {
		this.getRole(name, function(err, item) {
			if(err) {
				return cb(err);
			}

			if(!item) {
				return cb(null, false);
			}

			return cb(null, true);
		});

		return this;
	}

	/**
	 * Return true with callback if permission exists
	 * @param  {String}   name Name of permission
	 * @param  {Function} cb   Callback function
	 * @return {Storage}       Instance of actual storage
	 */
	existsPermission (action, resource, cb) {
		this.getPermission(action, resource, function(err, item) {
			if(err) {
				return cb(err);
			}

			if(!item) {
				return cb(null, false);
			}

			return cb(null, true);
		});

		return this;
	}
}