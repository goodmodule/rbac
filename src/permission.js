import Base from './base';

export const DELIMITER = '_';

export default class Permission extends Base {
	/**
	 * @constructor
	 * @extends {Base}
	 */
	constructor (rbac, action, resource, add, cb) {
		if(typeof add === 'function') {
			cb = add;
			add = true;
		}

		if(!action || !resource) {
			return cb(new Error('One of parameters is undefined'));
		}

		if(!Permission.isValidName(action) || !Permission.isValidName(resource)) {
			return cb(new Error('Action or resource has no valid name'));
		}

		this._action = action;
		this._resource = resource;

		super(rbac, Permission.createName(action, resource), add, cb);		
	}

	/**
	 * Get action name of actual permission
	 * @return {String} Action of permission
	 */
	get action() {
		return this._action;
	}

	/**
	 * Get resource name of actual permission
	 * @return {String} Resource of permission
	 */
	get resource() {
		return this._resource;
	}

	/**
	 * Return true if has same action and resource
	 * @param  {String}  action   Name of action
	 * @param  {String}  resource Name of resource
	 * @return {Boolean}          
	 */
	can (action, resource) {
		return this._action === action && this._resource === resource;
	}

	/**
	 * Compute name of permission from action and resource
	 * @param  {String} action   Name of permission
	 * @param  {String} resource Resource of permission
	 * @return {String}          Computed name of permission
	 */
	static createName (action, resource) {
		return action + DELIMITER + resource;
	}

	static decodeName (name) {
		var pos = name.indexOf(DELIMITER);
		if(pos === -1) {
			return null;
		}

		return {
			action   : name.substr(0, pos),
			resource : name.substr(pos+1)
		};
	}

	/**
	 * Correct name can contain only alphanumeric characters
	 * @param  {String}  name Name
	 * @return {Boolean}      
	 */
	static isValidName (name) {
		if (/^[a-zA-Z0-9]+$/.test(name)) {
			return true;
		}

		return false;
	}	
}
