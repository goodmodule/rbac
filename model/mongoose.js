'use strict';

var _ = require('underscore');

var appendTo = exports.appendTo = function(schema, addMethods) {
	schema.add({
		//role assigned to the user
		role : { type: String },
		//additional permissions assigned to the user
		permissions : { type: [String] }
	});

	if(addMethods) {
		schema.methods.can = can;
		schema.methods.addPermissions = addPermissions;
	}
	
	return schema;
};

/**
 * Check if user has assigned a specific role 
 * @param  {String}   role 
 * @param  {Function} cb Callback
 */
var can = exports.can = function(rbac, action, resource) {
	//check existance of permission
	var permission = rbac.getPermission(action, resource);
	if(!permission) {
		return false;
	}

	//check permission inside user role
	if(this.role && rbac.can(this.role, action, resource) === true) {
		return true;
	}

	//check user additional permissions
	if(_.indexOf(this.permissions, permission.getName() !== -1) {
		return true;
	}

	return false;
};

/**
 * Assign permissions to the user
 * @param  {String|Array}   permissions  Array of permissions or string representing of permission
 * @param  {Function} cb Callback
 */
var addPermissions = exports.addPermissions = function(permissions, cb) {
	var self = this;

	permissions = typeof permissions === 'string' ? [permissions] : permissions;

	this.update({$addToSet: {permissions: {$each: permissions}}}, function(err, obj) {
		if(err) return cb(err);
		if(!obj) return cb(new Error('Obj is undefined'));

        self.permissions = obj.permissions;
        cb(err, obj);
	});
};