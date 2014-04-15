'use strict';

var Permission = require('./../permission'),
	Role = require('./../role');

/**
 * Constructor of storage
 */
function Storage() {
}

/**
 * Add new Permission/Role to RBAC
 * @param {[type]}   item [description]
 * @param {Function} cb   [description]
 */
Storage.prototype.add = function(item, cb) {
	cb(new Error('Storage method add is not implemented'));
};

Storage.prototype.remove = function(item, cb) {
	cb(new Error('Storage method remove is not implemented'));
};

Storage.prototype.grant = function(role, child, cb) {
	cb(new Error('Storage method grant is not implemented'));
};

Storage.prototype.revoke = function(role, child, cb) {
	cb(new Error('Storage method revoke is not implemented'));
};

Storage.prototype.get = function(name, cb) {
	cb(new Error('Storage method get is not implemented'));
};

/**
 * Get instances of Roles and Permissions assigned to role
 * @param  {String}   role Name of role
 * @param  {Function} cb   Callback function
 */
Storage.prototype.getGrants = function(role, cb) {
	cb(new Error('Storage method getGrants is not implemented'));
};

Storage.prototype.getRole = function(name, cb) {
	this.get(name, function(err, item) {
		if(err || !item) return cb(err, item);

		if(item instanceof Role) return cb(null, item);

		cb(null, null);
	});
};

Storage.prototype.getPermission = function(action, resource, cb) {
	var name = Permission.createName(action, resource);

	this.get(name, function(err, item) {
		if(err || !item) return cb(err, item);

		if(item instanceof Permission) return cb(null, item);

		cb(null, null);
	});
};

module.exports = Storage;