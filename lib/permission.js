'use strict';

var util = require("util"),
	Base = require("./base");

/**
 * @constructor
 * @extends {Base}
 */
function Permission(rbac, action, resource, cb) {
	if(!action || !resource) {
		return cb(new Error('One of parameters is undefined'));
	}

	if(!Permission.isValidName(action) || !Permission.isValidName(resource)) {
		return cb(new Error('Action or resource has no valid name'));
	}

	this._action = action;
	this._resource = resource;

	Base.call(this, rbac, Permission.createName(action, resource), cb);
}

util.inherits(Permission, Base);

/**
 * Get action name of actual permission
 * @return {String} Action of permission
 */
Permission.prototype.getAction = function() {
	return this._action;
};

/**
 * Get resource name of actual permission
 * @return {String} Resource of permission
 */
Permission.prototype.getResource = function() {
	return this._resource;
};

/**
 * Return true if has same action and resource
 * @param  {String}  action   Name of action
 * @param  {String}  resource Name of resource
 * @return {Boolean}          
 */
Permission.prototype.can = function(action, resource) {
	return (this._action === action && this._resource === resource);
};

/**
 * Compute name of permission from action and resource
 * @param  {String} action   Name of permission
 * @param  {String} resource Resource of permission
 * @return {String}          Computed name of permission
 */
Permission.createName = function(action, resource) {
	return action + '_' + resource;
};

/**
 * Correct name can contain only alphanumeric characters
 * @param  {String}  name Name
 * @return {Boolean}      
 */
Permission.isValidName = function(name) {
	if (/^[a-zA-Z0-9]+$/.test(name)) {
		return true;
	}

	return false;
};

module.exports = Permission;