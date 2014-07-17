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

		schema.methods.addPermission = addPermission;
		schema.methods.removePermission = removePermission;

		schema.methods.hasRole = hasRole;
		schema.methods.removeRole = removeRole;
		schema.methods.setRole = setRole;

		schema.methods.getScope = getScope;

		schema.statics.removeRoleFromAllUsers = removeRoleFromAllUsers;
		schema.statics.removePermissionFromAllUsers = removePermissionFromAllUsers;
		
	}
	
	return schema;
};

var getScope = exports.getScope = function(rbac, cb) {
	var permissions = this.permissions || [];

	rbac.getScope(this.role, function(err, scope) {
		if(err) {
			return cb(err);
		}

		scope = _.union(permissions, scope);
		cb(null, scope);
	});

	return this;
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
var addPermission = exports.addPermission = function(rbac, action, resource, cb) {
	var self = this;

	rbac.getPermission(action, resource, function(err, permission) {
		if(err) {
			return cb(err);
		}	

		if(!permission) {
			return cb(null, false);
		}

		if(_.indexOf(self.permissions, permission.getName()) !== -1) {
			return cb(null, false);
		}

		self.permissions.push(permission.getName());
		self.save(function(err, user) {
			if(err) {
				return cb(err);
			}

			if(!user) {
				return cb(new Error('User is undefined'));	
			}

			cb(null, true);
		});
	});

	return this;
};


var removePermission = exports.removePermission = function(permissionName, cb) {
	var self = this;

	if(_.indexOf(this.permissions, permissionName) === -1) {
		return cb(null, false);
	}

	this.permissions = _.without(this.permissions, permissionName);
	this.save(function(err, user) {
		if(err) {
			return cb(err);
		}

		if(!user) {
			return cb(new Error('User is undefined'));
		}

		if(_.indexOf(user.permissions, permissionName) === -1) {
			return cb(null, true);
		}

		cb(null, false);
	});

	return this;
};


var removePermissionFromAllUsers = exports.removePermissionFromAllUsers = function(permissionName, cb) {
	this.update({permissions: permissionName}, {$pull: {permissions: permissionName}}, {multi: true}, function(err, num) {
		if(err) {
			return cb(err);
		}

        return cb(null, true);
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

var removeRole = exports.removeRole = function(cb) {
	var self = this;

	if(!this.role) {
		return cb(null, false);
	}

	this.role = null;
	this.save(function(err, user) {
		if(err) {
			return cb(err);
		}

		if(!user) {
			return cb(new Error('User is undefined'));
		}

		cb(null, user.role === null);
	});

	return this;
};

var removeRoleFromAllUsers = exports.removeRoleFromAllUsers = function(roleName, cb) {
	this.update({role: roleName}, {role: null}, {multi: true}, function(err, num) {
		if(err) {
			return cb(err);
		}

        return cb(null, true);
    });


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

			if(!user) {
				return cb(new Error('User is undefined'));
			}

			cb(null, user.role === self.role);
		});
	});
};