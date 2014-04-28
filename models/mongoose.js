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
var can = exports.can = function(rbac, action, resource, cb) {
	var self = this;

	//check existance of permission
	rbac.getPermission(action, resource, function(err, permission) {
		if(err) {
			return cb(err);
		}

		if(!permission) {
			return cb(null, false);
		}

		//check user additional permissions
		if(_.indexOf(self.permissions, permission.getName()) !== -1) {
			return cb(null, true);
		}

		if(!self.role) {
			return cb(null, false);	
		}

		//check permission inside user role
		rbac.can(self.role, action, resource, cb);
	});

	return this;
};

/**
 * Assign additional permissions to the user
 * @param  {String|Array}   permissions  Array of permissions or string representing of permission
 * @param  {Function} cb Callback
 */
var addPermissions = exports.addPermissions = function(permissions, cb) {
	var self = this;

	permissions = typeof permissions === 'string' ? [permissions] : permissions;

	//TODO return real object in callback 

	this.update({$addToSet: {permissions: {$each: permissions}}}, function(err, numberOfAffected) {
		if(err) {
			return cb(err);
		}

		if(!numberOfAffected) {
			return cb(new Error('Obj is undefined'));
		}

        //self.permissions = obj.permissions;
        cb(err, obj);
	});

	return this;
};

/**
 * Check if user has assigned a specific role 
 * @param  {RBAC}  rbac Instance of RBAC
 * @param  {String}  name Name of role
 * @return {Boolean}      [description]
 */
var hasRole = exports.hasRole = function(rbac, role, cb) {
	if(!this.role) {
		return cb(null, false);
	}

	//check existance of permission
	rbac.hasRole(this.role, role, cb);
	return this;
};


var setRole = exports.setRole = function(rbac, role, cb) {
	var self = this;

	if(this.role === role) {
		return cb(new Error('User already has assigned this role'));
	}

	//check existance of permission
	rbac.getRole(role, function(err, role) {
		if(err) {
			return cb(err);
		}

		if(!role) {
			return cb(new Error('Role does not exists'));		
		}

		self.role = role.getName();
		self.save(function(err, user) {
			if(err) {
				return cb(err);
			}

			cb(null, user.role === self.role);
		});
	});
};