'use strict';

var util = require("util"),
	Base = require("./base");

var Role = module.exports = function Role(rbac, name) {
	this._allow = {};

	Base.call(this, rbac, Base.type.ROLE, name);
};

util.inherits(Role, Base);


Role.prototype.allow = function(item) {
	if(!this.hasSameRBAC(item)) throw new Error('Item is from different instance of RBAC');

	this._allow[item.getName()] = item;
	return this;
};

/**
 * Return true if contains permission
 * @param  {String}  action   [description]
 * @param  {String}  resource [description]
 * @return {Boolean}          [description]
 */
Role.prototype.isAllowed = function(action, resource) {
	for(var index in this._allow) {
		var item = this._allow[index];
		if(item.isAllowed(action, resource) === true) {
			return true;
		}
	}

	return false;
};

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