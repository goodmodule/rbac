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

		schema.methods.hasRole = hasRole;
		schema.methods.setRole = setRole;
		
	}
	
	return schema;
};

/**
 * Check if user has assigned a specific permission 
 * @param  {RBAC}  rbac Instance of RBAC
 * @param  {String}   action  Name of action 
 * @param  {String}   resource  Name of resource 
 * @return {Boolean}        
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
 * Assign additional permissions to the user
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

/**
 * Check if user has assigned a specific role 
 * @param  {RBAC}  rbac Instance of RBAC
 * @param  {String}  name Name of role
 * @return {Boolean}      [description]
 */
var hasRole = exports.hasRole = function(rbac, name) {
	if(!this.role) {
		return false;
	}

	//check existance of permission
	var role = rbac.getRole(this.role);
	if(role && role.hasRole(name) === true) {
		return true;
	}

	return false;
};


var setRole = exports.setRole = function(rbac, name, cb) {
	if(this.role === name) {
		return cb(new Error('User already has assigned this role'));
	}

	//check existance of permission
	var role = rbac.getRole(name);
	if(!role) {
		return cb(new Error('Role does not exists'));	
	}

	this.role = role.getName();
	this.save(cb);
};