'use strict';

/************************************
Hierarchical RBAC
Role Based Access Control
 ***********************************/

var Role = require('./role'),
	Permission = require('./permission'),
	Base = require('./base');

var RBAC = module.exports = function RBAC() {
	this._items = {};
};

RBAC.prototype.register = function(item) {
	var name = item.getName();

	if(item.getRBAC() !== this) throw new Error('RBAC is different');
	if(this._items[name]) throw new Error('Item with this name already exists');

	this._items[name] = item;
};

RBAC.prototype.createRole = function(name) {
	return new Role(this, name);
};

RBAC.prototype.createPermission = function(action, resource) {
	return new Permission(this, action, resource);
};

RBAC.prototype.get = function(name) {
	return this._items[name] ? this._items[name] : null;
};

RBAC.prototype.getRole = function(name) {
	var role = this.get(name);
	return (role && role.getType() === Base.type.ROLE) ?
		role :
		null;
};

RBAC.prototype.getPermission = function(action, resource) {
	var name = Permission.createName(action, resource);
	var role = this.get(name);
	return (role && role.getType() === Base.type.PERMISSION) ?
		role :
		null;
};

RBAC.prototype.isAllowed = function(roleName, action, resource) {
	var item = this.getRole(roleName);
	return item ? item.isAllowed(action, resource) : false;
};