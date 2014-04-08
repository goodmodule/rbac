'use strict';

var Base = module.exports = function Base(rbac, type, name) {
	if(!rbac || !name) throw new Error('One of parameters is undefined');

	this._rbac = rbac;
	this._name = name;
	this._type = type;

	this._rbac.register(this);
};

Base.prototype.getType = function() {
	return this._type;
};

Base.prototype.getName = function() {
	return this._name;
};

Base.prototype.getRBAC = function() {
	return this._rbac;
};

Base.prototype.hasSameRBAC = function(item) {
	return item.getRBAC() === this._rbac ? true : false;
};

Base.type = {
	ROLE: 0,
	PERMISSION: 1
};