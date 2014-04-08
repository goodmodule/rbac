'use strict';

var util = require("util"),
	Base = require("./base");

var Permission = module.exports = function Petmission(rbac, action, resource) {
	if(!action || !resource) throw new Error('One of parameters is undefined');

	this._action = action;
	this._resource = resource;

	Base.call(this, rbac, Base.type.ROLE, Permission.createName(action, resource));
};

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
Permission.prototype.isAllowed = function(action, resource) {
	return (this._action === action && this._resource === resource) ?
		true :
		false;
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