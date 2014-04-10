'use strict';

var util = require("util"),
	Base = require("./base");

var Role = module.exports = function Role(rbac, name) {
	this._allow = {};

	Base.call(this, rbac, Base.type.ROLE, name);
};

util.inherits(Role, Base);

/**
 * Add role or permission to current role
 * @param  {Role|Permission} item Instance of role or permission
 * @return {Role}      Return current instance of role
 */
Role.prototype.grant = function(item) {
	if(!this.hasSameRBAC(item)) throw new Error('Item is from different instance of RBAC');

	this._allow[item.getName()] = item;
	return this;
};

/**
 * Return true if contains permission
 * @param  {String}  action   Name of action
 * @param  {String}  resource Name of resource
 * @return {Boolean}          
 */
Role.prototype.can = function(action, resource) {
	for(var index in this._allow) {
		var item = this._allow[index];
		if(item.can(action, resource) === true) {
			return true;
		}
	}

	return false;
};

/**
 * Check if the role has any of the given permissions.
 * @param  {Array} permissions  Array (of [String action, String resource])
 * @return {[type]}            
 */
Role.prototype.canAny = function(permissions) {
	for(var i=0; i<permissions.length; i++) {
		var permission = permissions[i];

		if(this.can(permission[0], permission[1]) === true) {
			return true;
		}
	}

	return false;
};


/**
 * Check if the model has all of the given permissions.
 * @param  {String} roleName    [description]
 * @param  {Array} permissions  Array (of [String action, String resource])
 * @return {[type]}            
 */
Role.prototype.canAll = function(permissions) {
	for(var i=0; i<permissions.length; i++) {
		var permission = permissions[i];

		if(this.can(permission[0], permission[1]) !== true) {
			return false;
		}
	}

	return true;
};

/**
 * Return true if the current role contains the specified role name
 * @param  {String}  name Name of role
 * @return {Boolean}      
 */
Role.prototype.hasRole = function(name) {
	if(this.getName() === name) return true;

	for(var index in this._allow) {
		var item = this._allow[index];

		if(item.getType() === Base.type.ROLE && item.hasRole(name)===true) {
			return true;
		}
	}

	return false;
};


/**
 * Return array of permission assigned to actual role  
 * @return {Array}    Array of permission assigned to actual role  
 */
Role.prototype.getScope = function(ignoreDuplicates) {
	var scope = [];

	//search from whole hierarchy
	for(var index in this._allow) {
		var item = this._allow[index];
		var itemScope = item.getScope(true);

		scope = scope.concat(itemScope);
	}

	//remove duplicates
	if(!ignoreDuplicates) {
		scope.filter(function(elem, pos) {
			return scope.indexOf(elem) == pos;
		}); 		
	}

	return scope;
};