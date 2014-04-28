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

	if(!RBAC.isRole(role)) {
		return cb(new Error('Role is not instance of Role'));
	}

	this._storage.grant(role, child, cb);
	return this;
};

RBAC.prototype.grantByName = function(roleName, childName, cb) {
	var self = this;

	//get role
	this.get(roleName, function(err, role) {
		if(err) {
			return cb(err);
		}

		//get child
		self.get(childName, function(err, child) {
			if(err) {
				return cb(err);
			}

			self.grant(role, child, cb);
		});
	});

	return this;
};

/**
 * Grant multiple items in one function
 * @param  {Object}   roles [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          [description]
 */
RBAC.prototype.grants = function(roles, cb) {
	if(!_.isObject(roles)) {
		return cb(new Error('Grants is not an object'));
	}

	var tasks = [];

	for(var role in roles) {
		var grants = roles[role];

		for(var i=0; i<grants.length; i++) {
			var grant = grants[i];

			tasks.push(this.grantByName.bind(this, role, grant));
		}
	}

	async.series(tasks, cb);
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
 * @param  {String} role Name of new Role
 * @return {Role}      Instance of new Role
 */
RBAC.prototype.createRole = function(role, cb) {
	new Role(this, role, cb);
	return this;
};


/**
 * Create multiple roles in one step assigned to actual instance of RBAC
 * @param  {Array}   roles  Array of role names
 * @param  {Function} cb    [description]
 * @return {[type]}         [description]
 */
RBAC.prototype.createRoles = function(roles, cb) {
	var tasks = {};

	for(var i=0; i<roles.length; i++) {
		var role = roles[i];
		tasks[role] = this.createRole.bind(this, role);
	}

	async.series(tasks, cb);
	return this;
};

/**
 * Create a new permission assigned to actual instance of RBAC
 * @param  {String} action   Name of action
 * @param  {String} resource Name of resource
 * @param  {Function} cb     Callback function
 * @return {RBAC}            Instance of actual RBAC
 */
RBAC.prototype.createPermission = function(action, resource, cb) {
	new Permission(this, action, resource, cb);
	return this;
};

/**
 * Create multiple permissions in one step
 * @param  {[type]}   permissions [description]
 * @param  {Function} cb          [description]
 * @return {RBAC}            Instance of actual RBAC
 */
RBAC.prototype.createPermissions = function(permissions, cb) {
	var tasks = {};

	for(var i=0; i<permissions.length; i++) {
		var permission = permissions[i];
		var name = Permission.createName(permission[0], permission[1]);

		tasks[name] = this.createPermission.bind(this, permission[0], permission[1]);
	}

	async.series(tasks, cb);
	return this;
};

/**
 * Create multiple permissions and roles in one step
 * @param  {Array}   roles       [description]
 * @param  {Array}   permissions [description]
 * @param  {Array} cb          [description]
 * @return {RBAC}            Instance of actual RBAC
 */
RBAC.prototype.create = function(roles, permissions, grants, cb) {
	var self = this;

	if(typeof grants === 'function') {
		cb = grants;
		grants = null;
	}

	var tasks = {
		roles: function(callback) {
			self.createRoles(roles, callback);
		},
		permissions: function(callback) {
			self.createPermissions(permissions, callback);
		}
	};

	async.series(tasks, function(err, result) {
		if(err || !grants) {
			return cb(err, result);
		}

		//add grants to roles
		self.grants(grants, function(err, granted) {
			if(err) {
				return cb(err);
			}	

			cb(null, result);
		});
	});

	return this;
};

/**
 * Get instance of Role or Permission by his name
 * @param  {String} name  Name of item
 * @param  {Function} cb  Callback function
 * @return {RBAC}         Return instance of actual RBAC
 */
RBAC.prototype.get = function(name, cb) {
	this._storage.get(name, cb);
	return this;
};

/**
 * Return instance of Role by his name
 * @param  {String} role  Name of role
 * @param  {Function} cb  Callback function
 * @return {RBAC}         Return instance of actual RBAC
 */
RBAC.prototype.getRole = function(role, cb) {
	this._storage.getRole(role, cb);
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
 * @param  {String} action    Name of action
 * @param  {String} resource  Name of resource
 * @return {RBAC}             Return instance of actual RBAC
 */
RBAC.prototype.getPermission = function(action, resource, cb) {
	this._storage.getPermission(action, resource, cb);
	return this;
};

/**
 * Return all instances of Permission
 * @return {RBAC}  Return instance of actual RBAC
 */
RBAC.prototype.getPermissions = function(cb) {
	this._storage.getPermissions(cb);
	return this;
};

/**
 * Traverse hierarchy of roles. 
 * Callback function returns as second parameter item from hierarchy or null if we are on the end of hierarchy.
 * @param  {String}   role  Name of role
 * @param  {Function} cb    Callback function
 * @return {RBAC}           Return instance of actual RBAC
 */
RBAC.prototype._traverseGrants = function(role, cb, next, used) {
	var self = this;
	next = next || [role];
	used = used || {};

	var actualRole = next.shift();
	used[actualRole] = true;

	this._storage.getGrants(actualRole, function(err, items) {
		if(err) {
			return cb(err);
		}

		for(var i=0; i<items.length; i++) {
			var item = items[i];
			var name = item.getName();

			if(RBAC.isRole(item) && !used[name]) {
				used[name] = true;
				next.push(name);
			}

			if(cb(null, item) === false) {
				return;
			}
		}

		if(next.length === 0) {
			return cb(null, null);
		}

		self._traverseGrants(null, cb, next, used);	
	});
	
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

		if(RBAC.isPermission(item) && item.can(action, resource) === true) {
			cb(null, true);
			//end up actual traversing
			return false;
		}
	});

	return this;
};


/**
 * Check if the role has any of the given permissions.
 * @param  {String} role        Name of role
 * @param  {Array} permissions  Array (of [String action, String resource])
 * @return {[type]}            
 */
RBAC.prototype.canAny = function(role, permissions, cb) {
	//prepare the names of permissions
	var permissionNames = RBAC.getPermissionNames(permissions);

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

		if(RBAC.isPermission(item) && _.indexOf(permissionNames, item.getName()) !== -1) {
			cb(null, true);
			//end up actual traversing
			return false;
		}
	});

	return this;
};

/**
 * Check if the model has all of the given permissions.
 * @param  {String} role       Name of role
 * @param  {Array} permissions Array (of [String action, String resource])
 * @return {[type]}            
 */
RBAC.prototype.canAll = function(role, permissions, cb) {
	//prepare the names of permissions
	var permissionNames = RBAC.getPermissionNames(permissions);

	var founded = {};
	var foundedCount = 0;

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

		if(RBAC.isPermission(item) && _.indexOf(permissionNames, item.getName()) !== -1 && !founded[item.getName()]) {
			founded[item.getName()]=true;
			foundedCount++;

			if(foundedCount===permissionNames.length) {
				cb(null, true);
				//end up actual traversing
				return false;			
			}
		}
	});

	return this;
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

		if(RBAC.isRole(item) && item.getName() === roleChild) {
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

		if(RBAC.isPermission(item) && _.indexOf(scope, item.getName()) === -1) {
			scope.push(item.getName());
		}
	});

	return this;
};

/**
 * Convert Array of permissions to permission name
 * @param  {Array} permissions [description]
 * @return {Array}             [description]
 */
RBAC.getPermissionNames = function(permissions) {
	var permissionNames = [];
	for(var i=0; i<permissions.length; i++) {
		var permission = permissions[i];
		permissionNames.push(Permission.createName(permission[0], permission[1]));	
	}

	return permissionNames;
};

/**
 * Convert object of permissions to array of permissions
 * @param  {Object} permissions [description]
 * @return {Array}             [description]
 */
RBAC.permissionsFromObject = RBAC.prototype.permissionsFromObject = function(permissions) {
	if(!_.isObject(permissions)) {
		throw new Error('Permissions is not an object');
	}

	var data = [];

	for(var resource in permissions) {
		var actions = permissions[resource];

		for(var i=0; i<actions.length; i++) {
			data.push([actions[i], resource]);	
		}
	}

	return data;
};

RBAC.isPermission = function(item) {
	return (item instanceof Permission)
		? true
		: false;
};

RBAC.isRole = function(item) {
	return (item instanceof Role)
		? true
		: false;
};

//assign classes for better access
RBAC.Role = RBAC.prototype.Role = Role;
RBAC.Permission = RBAC.prototype.Permission = Permission;
RBAC.Storage = RBAC.prototype.Storage = Storage;

module.exports = RBAC;