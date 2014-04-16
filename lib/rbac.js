/************************************
 * Hierarchical RBAC
 * Role Based Access Control
************************************/
'use strict';

var _ = require('underscore'),
	async = require('async'),
	Role = require('./role'),
	Permission = require('./permission'),
	Storage = require('./storage'),
	MemoryStorage = require('./storage/memory');

function RBAC(storage) {
	this._storage = storage || new MemoryStorage();
}

/**
 * Return current storage of RBAC
 * @return {Storage} Instance of storage
 */
RBAC.prototype.getStorage = function() {
	return this._storage;
};

/**
 * Register role or permission to actual RBAC instance
 * @param  {Base} item Instance of Base
 * @return {RBAC}      Return actual instance
 */
RBAC.prototype.add = function(item, cb) {
	if(item.getRBAC()) {
		return cb(new Error('Item is already associated to another RBAC instance'));
	}

	this._storage.add(item, cb);
	return this;
};

/**
 * Remove role or permission from RBAC
 * @param  {Role|Permission} item Instance of role or permission
 * @return {RBAC}    Current instance
 */
RBAC.prototype.remove = function(item, cb) {
	if(item.getRBAC() !== this) {
		return cb(new Error('RBAC is different'));
	}

	this._storage.remove(item, cb);
	return this;
};

RBAC.prototype.grant = function(role, child, cb) {
	if(role.getRBAC() !== this || child.getRBAC() !== this) {
		return cb(new Error('RBAC is different'));
	}

	this._storage.grant(role, child, cb);
	return this;
};

RBAC.prototype.revoke = function(role, child, cb) {
	if(role.getRBAC() !== this || child.getRBAC() !== this) {
		return cb(new Error('RBAC is different'));
	}

	this._storage.revoke(role, child, cb);
	return this;
};

/**
 * Create a new role assigned to actual instance of RBAC
 * @param  {String} name Name of new Role
 * @return {Role}      Instance of new Role
 */
RBAC.prototype.createRole = function(name, cb) {
	return new Role(this, name, cb);
};


RBAC.prototype.createRoles = function(roles, cb) {
	var self = this;
	var tasks = {};

	for(var i=0; i<roles.length; i++) {
		(function(role) {
			tasks[role] = function(callback) {
				self.createRole(role, callback);
			};			
		}(roles[i]));
	}

	async.series(tasks, cb);
};

/**
 * Create a new Permission assigned to actual instance of RBAC
 * @param  {String} action   Name of action
 * @param  {String} resource Name of resource
 * @return {Permission}        Instance of new Permission
 */
RBAC.prototype.createPermission = function(action, resource, cb) {
	return new Permission(this, action, resource, cb);
};


RBAC.prototype.createPermissions = function(permissions, cb) {
	var self = this;
	var tasks = {};

	for(var i=0; i<permissions.length; i++) {
		(function(permission) {
			tasks[Permission.createName(permission[0], permission[1])] = function(callback) {
				self.createPermission(permission[0], permission[1], callback);
			};			
		}(permissions[i]));
	}

	async.series(tasks, cb);
};

RBAC.prototype.create = function(roles, permissions, cb) {
	var self = this;

	var tasks = {
		roles: function(callback) {
			self.createRoles(roles, callback);
		},
		permissions: function(callback) {
			self.createPermissions(permissions, callback);
		}
	};

	async.series(tasks, cb);
};

/**
 * Get instance of Role or Permission by his name
 * @param  {String} name 	Name of item
 * @param  {Function} cb 	Callback function
 * @return {RBAC}      		Return instance of actual RBAC
 */
RBAC.prototype.get = function(name, cb) {
	this._storage.get(name, cb);
	return this;
};

/**
 * Return instance of Role by his name
 * @param  {String} name 	Name of role
 * @param  {Function} cb 	Callback function
 * @return {RBAC}      		Return instance of actual RBAC
 */
RBAC.prototype.getRole = function(name, cb) {
	this._storage.getRole(name, cb);
	return this;
};

/**
 * Return all instances of Role
 * @return {RBAC}      Return instance of actual RBAC
 */
RBAC.prototype.getRoles = function(cb) {
	this._storage.getRoles(cb);
	return this;
};

/**
 * Return instance of Permission by his name
 * @param  {String} action 		Name of action
 * @param  {String} resource 	Name of resource
 * @return {RBAC} 				Return instance of actual RBAC
 */
RBAC.prototype.getPermission = function(action, resource, cb) {
	this._storage.getPermission(action, resource, cb);
	return this;
};

/**
 * Return all instances of Permission
 * @return {RBAC}      Return instance of actual RBAC
 */
RBAC.prototype.getPermissions = function(cb) {
	this._storage.getPermissions(cb);
	return this;
};

/**
 * Traverse hierarchy of roles. 
 * Callback function returns as second parameter item from hierarchy or null if we are on the end of hierarchy.
 * @param  {String}   role 	Name of role
 * @param  {Function} cb 	Callback function
 * @return {RBAC} 			Return instance of actual RBAC
 */
RBAC.prototype._traverseGrants = function(role, cb) {
	var self = this;
	var roles = [role];
	var used = {};

	while(roles.length>0) {
		var actualRole = roles.shift();
		used[actualRole] = true;

		this._storage.getGrants(actualRole, function(err, items) {
			if(err) {
				return cb(err);
			}

			for(var i=0; i<items.length; i++) {
				var item = items[i];
				var name = item.getName();

				if(item instanceof Role && !used[name]) {
					used[name] = true;
					roles.push(name);
				}

				if(cb(null, item) === false) {
					return;
				}
			}
		});
	}

	//return null at the end
	cb(null, null);
	return this;
};

/**
 * Return true if role has allowed permission
 * @param  {String}  role Name of role
 * @param  {String}  action   Name of action
 * @param  {String}  resource Name of resource
 * @return {Boolean}          
 */
RBAC.prototype.can = function(role, action, resource, cb) {
	this._traverseGrants(role, function(err, item) {
		//if there is a error
		if(err) {
			return cb(err);
		}

		//this is last item
		if(!item) {
			return cb(null, false);
		}

		if(item instanceof Permission && item.can(action, resource) === true) {
			cb(null, true);
			//end up actual traversing
			return false;
		}
	});

	return this;
};

/**
 * Check if the role has any of the given permissions.
 * @param  {String} role    [description]
 * @param  {Array} permissions  Array (of [String action, String resource])
 * @return {[type]}            
 */
RBAC.prototype.canAny = function(role, permissions) {
	//prepare the names of permissions
	var permissionNames = [];
	for(var i=0; i<permissions.length; i++) {
		var permission = permissions[i];
		permissionNames.push(Permission.createName(permission[0], permission[1]));	
	}

	//traverse hierarchy
	this._traverseGrants(role, function(err, item) {
		//if there is a error
		if(err) {
			return cb(err);
		}

		//this is last item
		if(!item) {
			return cb(null, false);
		}

		if(item instanceof Permission && _.indexOf(permissionNames, item.getName()) !== -1) {
			cb(null, true);
			//end up actual traversing
			return false;
		}
	});

	return this;
};

/**
 * Check if the model has all of the given permissions.
 * @param  {String} roleName    [description]
 * @param  {Array} permissions  Array (of [String action, String resource])
 * @return {[type]}            
 */
RBAC.prototype.canAll = function(role, permissions, cb) {
	cb(new Error('This method is not implemented'));
};

/**
 * Return true if role has allowed permission
 * @param  {String}  role Name of role
 * @param  {String}  action   Name of action
 * @param  {String}  resource Name of resource
 * @return {Boolean}          
 */
RBAC.prototype.hasRole = function(role, roleChild, cb) {
	this._traverseGrants(role, function(err, item) {
		//if there is a error
		if(err) {
			return cb(err);
		}

		//this is last item
		if(!item) {
			return cb(null, false);
		}

		if(item instanceof Role && item.getName() === roleChild) {
			cb(null, true);
			//end up actual traversing
			return false;
		}
	});

	return this;
};

/**
 * Return array of all permission assigned to role of RBAC
 * @return {Array}  Array of permission assigned to actual RBAC 
 */
RBAC.prototype.getScope = function(role, cb) {
	var scope = [];

	//traverse hierarchy
	this._traverseGrants(role, function(err, item) {
		//if there is a error
		if(err) {
			return cb(err);
		}

		//this is last item
		if(!item) {
			return cb(null, scope);
		}

		if(item instanceof Permission && _.indexOf(scope, item.getName()) === -1) {
			scope.push(item.getName());
		}
	});

	return this;
};

//assign classes for better access
RBAC.Role = Role;
RBAC.Permission = Permission;
RBAC.Storage = Storage;

module.exports = RBAC;