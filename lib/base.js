'use strict';

/**
 * @constructor
 */
function Base(rbac, name, cb) {
	var self = this;

	if(!rbac || !name) {
		return cb(new Error('One of parameters is undefined'));
	}

	this._name = name;
	this._rbac = null;

	//add to RBAC structure
	rbac.add(this, function(err, item) {
		if(err) {
			return cb(err);
		}

		self._rbac = rbac;

		cb(null, item);
	});
}

/**
 * Remove item from RBAC
 * @param  {Function} cb Callback function
 * @return {Base}      
 */
Base.prototype.remove = function(cb) {
	var self = this;

	if(!this._rbac) {
		return cb(new Error('RBAC is undefined. Is object saved?'));
	}

	//remove it from RBAC instance
	this._rbac.remove(this, function(err, removed) {
		if(err) {
			return cb(err);
		}

		if(removed) {
			self._rbac = null;	
		}
		
		cb(err, removed);
	});

	return this;
};

/**
 * Get name of actual instance
 * @return {String}  Name of instance
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
	var itemRBAC = item.getRBAC();

	return (itemRBAC && this._rbac && itemRBAC === this._rbac);
};

/**
 * Return array of permission  
 * @return {Array}    Array of permission assigned to actual instance  
 */
Base.prototype.getScope = function() {
	return [this.getName()];
};


module.exports = Base;