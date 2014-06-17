'use strict';

var util = require("util"),
	Base = require("./base"),
	Permission = require("./permission");

/**
 * @constructor
 * @extends {Base}
 */
function Role(rbac, name, cb) {
	if(!Permission.isValidName(name)) {
		return cb(new Error('Role has no valid name'));
	}

	Base.call(this, rbac, name, cb);
}

util.inherits(Role, Base);

/**
 * Add role or permission to current role
 * @param  {Role|Permission} item	Instance of role or permission
 * @return {Role}                	Return current instance of role
 */
Role.prototype.grant = function(item, cb) {
	this.getRBAC().grant(this, item, cb);
	return this;
};

/**
 * Remove role or permission from current role
 * @param  {Role|Permission} item	Instance of role or permission
 * @return {Role}                	Return current instance of role
 */
Role.prototype.revoke = function(item, cb) {
	this.getRBAC().revoke(this, item, cb);
	return this;
};

/**
 * Return true if contains permission
 * @param  {String}  action  	Name of action
 * @param  {String}  resource	Name of resource
 * @return {Role}            	Return current instance of role          
 */
Role.prototype.can = function(action, resource, cb) {
	this.getRBAC().can(this.getName(), action, resource, cb);
	return this;
};

/**
 * Check if the role has any of the given permissions.
 * @param  {Array} permissions	List of permissions. Each has structure (String action, String resource)
 * @return {Role}             	Return current instance of role
 */
Role.prototype.canAny = function(permissions, cb) {
	this.getRBAC().canAny(this.getName(), permissions, cb);
	return this;
};

/**
 * Check if the model has all of the given permissions.
 * @param  {String} roleName   	Name of role
 * @param  {Array}  permissions	List of permissions. Each has structure (String action, String resource)
 * @return {Role}              	Return current instance of role            
 */
Role.prototype.canAll = function(permissions, cb) {
	this.getRBAC().canAll(this.getName(), permissions, cb);
	return this;
};

/**
 * Return true if the current role contains the specified role name
 * @param  {String} roleChildName	Name of role
 * @return {Role}                	Return current instance of role
 */
Role.prototype.hasRole = function(roleChildName, cb) {
	this.getRBAC().hasRole(this.getName(), roleChildName, cb);
	return this;
};

/**
 * Return array of permission assigned to actual role  
 * @param  {Function} cb	Callback function
 * @return {Role}       	Return current instance of role
 */
Role.prototype.getScope = function(cb) {
	this.getRBAC().getScope(this.getName(), cb);
	return this;
};

module.exports = Role;