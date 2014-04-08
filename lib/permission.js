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

Permission.prototype.getAction = function() {
	return this._action;
};

Permission.prototype.getResource = function() {
	return this._resource;
};

Permission.prototype.isAllowed = function(action, resource) {
	return (this._action === action && this._resource === resource) ?
		true :
		false;
};

Permission.createName = function(action, resource) {
	return action + '_' + resource;
};