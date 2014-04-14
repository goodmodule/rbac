'use strict';

function Base(rbac, type, name, cb) {
	if(!rbac || !type || !name) {
		throw new Error('One of parameters is undefined');
	}

	this._rbac = rbac;
	this._type = type;
	this._name = name;

	rbac.add(this, cb);
};

Base.prototype.remove = function(cb) {
	if(!this._rbac) {
		return false;
	}

	this._rbac.remove(this, cb);
	this._rbac = null;
	return true;
};

/**
 * Get type of actual instance
 * @return {Base.type} Type of instance
 */
Base.prototype.getType = function() {
	return this._type;
};

/**
 * Get name of actual instance
 * @return {String} Name of instance
 */
Base.prototype.getName = function() {
	return this._name;
};

/**
 * Get instance of RBAC
 * @return {RBAC|null} Instance of RBAC 
 */
Base.prototype.getRBAC = function() {
	return this._rbac;
};

/**
 * Return true if item and actual instance has assigned same RBAC instance
 * @param  {Base}  item [description]
 * @return {Boolean}      [description]
 */
Base.prototype.hasSameRBAC = function(item) {
	return item.getRBAC() === this._rbac;
};

/**
 * Return array of permission  
 * @return {Array}    Array of permission assigned to actual instance  
 */
Base.prototype.getScope = function() {
	return [this.getName()];
};

Base.type = {
	ROLE: 0,
	PERMISSION: 1
};

module.exports = Base;