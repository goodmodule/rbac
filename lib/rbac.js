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

/**
 * RBAC
 * @constructor
 */
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

RBAC.prototype.removeByName = function(name, cb) {
	this.get(name, function(err, item) {
		if(err) {
			return cb(err);
		}

		if(!item) {
			cb(null, false);
		}

		item.remove(cb);
	});

	return this;
};


RBAC.prototype.grant = function(role, child, cb) {
	if(!role || !child) {
		return cb(new Error('One of item is undefined'));	
	}

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

		if(!role) {
			return cb(new Error('Role is undefined'));
		}

		//get child
		self.get(childName, function(err, child) {
			if(err) {
				return cb(err);
			}

			if(!child) {
				return cb(new Error('Child is undefined'));
			}

			self.grant(role, child, cb);
		});
	});

	return this;
};

/**
 * Grant multiple items in one function
 * @param  {Object|Array}   List of roles  
 * @param  {Function} cb     Callback function
 * @return {RBAC}            Current instance
 */
RBAC.prototype.grants = function(roleNames, cb) {
	if(!_.isObject(roleNames)) {
		return cb(new Error('Grants is not an object'));
	}

	var tasks = [];

	for(var role in roleNames) {
		var grants = roleNames[role];

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

RBAC.prototype.revokeByName = function(roleName, childName, cb) {
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

			self.revoke(role, child, cb);
		});
	});

	return this;
};

/**
 * Create a new role assigned to actual instance of RBAC
 * @param  {String} roleName Name of new Role
 * @return {Role}      Instance of new Role
 */
RBAC.prototype.createRole = function(roleName, cb) {
	new Role(this, roleName, cb);
	return this;
};


/**
 * Create multiple roles in one step assigned to actual instance of RBAC
 * @param  {Array}    roleNames  Array of role names
 * @param  {Function} cb         Callback function
 * @return {RBAC}                Current instance
 */
RBAC.prototype.createRoles = function(roleNames, cb) {
	var tasks = {};

	for(var i=0; i<roleNames.length; i++) {
		var roleName = roleNames[i];
		tasks[roleName] = this.createRole.bind(this, roleName);
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
 * @param  {Object}   permissions Object of permissions
 * @param  {Function} cb          Callbck function
 * @return {RBAC}                 Instance of actual RBAC
 */
RBAC.prototype.createPermissions = function(permissionNames, cb) {
	var tasks = {};

	//if(!_.isArray(permissions) && _.isObject(permissions)) {
		permissionNames = RBAC.permissionsFromObject(permissionNames);	
	//}

	for(var i=0; i<permissionNames.length; i++) {
		var permission = permissionNames[i];
		var name = Permission.createName(permission[0], permission[1]);

		tasks[name] = this.createPermission.bind(this, permission[0], permission[1]);
	}

	async.series(tasks, cb);
	return this;
};

/**
 * Create multiple permissions and roles in one step
 * @param  {Array}   roleNames       List of role names
 * @param  {Object}  permissionNames List of permission names
 * @param  {Object}  grants          List og grants
 * @param  {Array}   cb              Callback function
 * @return {RBAC}                    Instance of actual RBAC
 */
RBAC.prototype.create = function(roleNames, permissionNames, grants, cb) {
	var self = this;

	if(typeof grants === 'function') {
		cb = grants;
		grants = null;
	}

	var tasks = {
		roles: function(callback) {
			self.createRoles(roleNames, callback);
		},
		permissions: function(callback) {
			self.createPermissions(permissionNames, callback);
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
 * Return true if role or permission exists
 * @param  {String}   name  Name of item
 * @param  {Function} cb    Callback function
 * @return {RBAC}           Return instance of actual RBAC
 */
RBAC.prototype.exists = function(name, cb) {
	this._storage.exists(name, cb);
	return this;
};

RBAC.prototype.existsRole = function(name, cb) {
	this._storage.existsRole(name, cb);
	return this;
};

RBAC.prototype.existsPermission = function(name, cb) {
	this._storage.existsPermission(name, cb);
	return this;
};


/**
 * Get instance of Role or Permission by his name
 * @param  {String}   name  Name of item
 * @param  {Function} cb    Callback function
 * @return {RBAC}           Return instance of actual RBAC
 */
RBAC.prototype.get = function(name, cb) {
	this._storage.get(name, cb);
	return this;
};

/**
 * Return instance of Role by his name
 * @param  {String}   name  Name of role
 * @param  {Function} cb    Callback function
 * @return {RBAC}           Return instance of actual RBAC
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
 * @param  {String}   roleName  Name of role
 * @param  {Function} cb        Callback function
 * @return {RBAC}               Return instance of actual RBAC
 * @private
 */
RBAC.prototype._traverseGrants = function(roleName, cb, next, used) {
	var self = this;
	next = next || [roleName];
	used = used || {};

	var actualRole = next.shift();
	used[actualRole] = true;

	this._storage.getGrants(actualRole, function(err, items) {
		if(err) {
			return cb(err);
		}

		items = items || [];

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
 * @param  {String}  roleName Name of role
 * @param  {String}  action   Name of action
 * @param  {String}  resource Name of resource
 * @return {RBAC}             Current instance         
 */
RBAC.prototype.can = function(roleName, action, resource, cb) {
	this._traverseGrants(roleName, function(err, item) {
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
 * @param  {String} roleName     Name of role
 * @param  {Array}  permissions  Array (String action, String resource)
 * @return {RBAC}                Current instance           
 */
RBAC.prototype.canAny = function(roleName, permissions, cb) {
	//prepare the names of permissions
	var permissionNames = RBAC.getPermissionNames(permissions);

	//traverse hierarchy
	this._traverseGrants(roleName, function(err, item) {
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
 * @param  {String} roleName     Name of role
 * @param  {Array}  permissions  Array (String action, String resource)
 * @return {RBAC}                Current instance           
 */
RBAC.prototype.canAll = function(roleName, permissions, cb) {
	//prepare the names of permissions
	var permissionNames = RBAC.getPermissionNames(permissions);

	var founded = {};
	var foundedCount = 0;

	//traverse hierarchy
	this._traverseGrants(roleName, function(err, item) {
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
 * @param  {String}   roleName        Name of role
 * @param  {String}   roleChildName   Name of child role
 * @param  {Function} cb              Name of resource
 * @return {RBAC}                     Current instance          
 */
RBAC.prototype.hasRole = function(roleName, roleChildName, cb) {
	if(roleName === roleChildName) {
		cb(null, true);
		return this;
	}

	this._traverseGrants(roleName, function(err, item) {
		//if there is a error
		if(err) {
			return cb(err);
		}

		//this is last item
		if(!item) {
			return cb(null, false);
		}

		if(RBAC.isRole(item) && item.getName() === roleChildName) {
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
RBAC.prototype.getScope = function(roleName, cb) {
	var scope = [];

	//traverse hierarchy
	this._traverseGrants(roleName, function(err, item) {
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
 * @param  {Array} permissions List of array items of permission names. It contan action and resource
 * @return {Array}             List of permission names
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
 * @param  {Object} permissions Object of permissions
 * @return {Array}             List of permisssions. Each contains action and resource
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

RBAC.isPermission = RBAC.prototype.isPermission = function(item) {
	return (item instanceof Permission)
		? true
		: false;
};

RBAC.isRole = RBAC.prototype.isRole = function(item) {
	return (item instanceof Role)
		? true
		: false;
};

//assign classes for better access
RBAC.Role = RBAC.prototype.Role = Role;
RBAC.Permission = RBAC.prototype.Permission = Permission;
RBAC.Storage = RBAC.prototype.Storage = Storage;

module.exports = RBAC;