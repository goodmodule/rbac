'use strict';

/************************************
Hierarchical RBAC
Role Based Access Control
************************************/

var Role = require('./role'),
	Permission = require('./permission'),
	Base = require('./base');

var RBAC = module.exports = function RBAC() {
	this._items = {};

	this._permissions = {};
	this._roles = {};
};

/**
 * Register role or permission to actual RBAC instance
 * @param  {Base} item Instance of Base
 * @return {RBAC}      Return actual instance
 */
RBAC.prototype.register = function(item) {
	var name = item.getName();

	if(item.getRBAC() !== this) throw new Error('RBAC is different');
	if(this._items[name]) throw new Error('Item with this name already exists');

	this._items[name] = item;

	if(item instanceof Permission) this._permissions[name] = item;
	else if(item instanceof Role) this._roles[name] = item;

	return this;
};

/**
 * Create a new role assigned to actual instance of RBAC
 * @param  {String} name Name of new Role
 * @return {Role}      Instance of new Role
 */
RBAC.prototype.createRole = function(name) {
	return new Role(this, name);
};

/**
 * Create a new Permission assigned to actual instance of RBAC
 * @param  {String} action   Name of action
 * @param  {String} resource Name of resource
 * @return {Permission}        Instance of new Permission
 */
RBAC.prototype.createPermission = function(action, resource) {
	return new Permission(this, action, resource);
};

/**
 * Get instance of Role or Permission by his name
 * @param  {String} name Name of item
 * @return {Role|Permission}    Return instance of Role or Permission or null if item does not exists
 */
RBAC.prototype.get = function(name) {
	return this._items[name] ? this._items[name] : null;
};

/**
 * Return instance of Role by his name
 * @param  {String} name Name of role
 * @return {Role}      Return instance of Role or null if item does not exists
 */
RBAC.prototype.getRole = function(name) {
	return this._roles[name] ? this._roles[name] : null;
};

/**
 * Return instance of Permission by his name
 * @param  {String} name Name of permission
 * @return {Permission}      Return instance of Permission or null if item does not exists
 */
RBAC.prototype.getPermission = function(action, resource) {
	var name = Permission.createName(action, resource);
	return this._permissions[name] ? this._permissions[name] : null;
};

/**
 * Return true if role has allowed permission
 * @param  {String}  roleName Name of role
 * @param  {String}  action   Name of action
 * @param  {String}  resource Name of resource
 * @return {Boolean}          [description]
 */
RBAC.prototype.isAllowed = function(roleName, action, resource) {
	var item = this.getRole(roleName);
	return item ? item.isAllowed(action, resource) : false;
};

/**
 * Return array of all permission assigned to actual instance of RBAC
 * @return {Array}  Array of permission assigned to actual RBAC 
 */
RBAC.prototype.getScope = function() {
	var scope = [];

	//search from whole hierarchy
	for(var name in this._permissions) {
		scope.push(name);
	}

	return scope;
};