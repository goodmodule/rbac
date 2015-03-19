"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = _interopRequire(require("lodash"));

var _async = require("async");

var series = _async.series;
var parallel = _async.parallel;

var Role = _interopRequire(require("./role"));

var Permission = _interopRequire(require("./permission"));

var MemoryStorage = _interopRequire(require("./storages/memory"));

var RBAC = (function () {
	/**
  * RBAC constructor
  * @constructor RBAC
  * @param  {Object} options             Options for RBAC
  * @param  {Storage} [options.storage]  Storage of grants
  */

	function RBAC(options) {
		_classCallCheck(this, RBAC);

		options = options || {};
		options.storage = options.storage || new MemoryStorage();

		this._options = options;

		this.storage.rbac = this;
	}

	_createClass(RBAC, {
		options: {

			/**
    * The RBAC's options.
    * @member RBAC#options {Object}
    */

			get: function () {
				return this._options;
			}
		},
		storage: {

			/**
    * The RBAC's storage.
    * @member RBAC#storage {Storage}
    */

			get: function () {
				return this.options.storage;
			}
		},
		add: {

			/**
    * Register role or permission to actual RBAC instance
    * @method RBAC#add
    * @param  {Role|Permission}     item Instance of Base
    * @param  {Function} cb   Callback function
    * @return {RBAC}          Return actual instance
    */

			value: function add(item, cb) {
				if (!item) {
					return cb(new Error("Item is undefined"));
				}

				if (item.rbac !== this) {
					return cb(new Error("Item is associated to another RBAC instance"));
				}

				this.storage.add(item, cb);
				return this;
			}
		},
		get: {

			/**
    * Get instance of Role or Permission by his name
    * @method RBAC#get
    * @param  {String}   name  Name of item
    * @param  {Function} cb    Callback function
    * @return {RBAC}           Return instance of actual RBAC
    */

			value: function get(name, cb) {
				this.storage.get(name, cb);
				return this;
			}
		},
		remove: {

			/**
    * Remove role or permission from RBAC
    * @method RBAC#remove
    * @param  {Role|Permission} item Instance of role or permission
    * @param  {Function}        cb   Callback function
    * @return {RBAC}                 Current instance
    */

			value: function remove(item, cb) {
				if (!item) {
					return cb(new Error("Item is undefined"));
				}

				if (item.rbac !== this) {
					return cb(new Error("Item is associated to another RBAC instance"));
				}

				this.storage.remove(item, cb);
				return this;
			}
		},
		removeByName: {

			/**
    * Remove role or permission from RBAC
    * @method RBAC#removeByName
    * @param  {String}   name Name of role or permission
    * @param  {Function} cb   Callback function
    * @return {RBAC}          Current instance
    */

			value: function removeByName(name, cb) {
				this.get(name, function (err, item) {
					if (err) {
						return cb(err);
					}

					if (!item) {
						return cb(null, false);
					}

					item.remove(cb);
				});

				return this;
			}
		},
		grant: {

			/**
    * Grant permission or role to the role
    * @method RBAC#grant
    * @param  {Role}            role  Instance of the role
    * @param  {Role|Permission} child Instance of the role or permission
    * @param  {Function}        cb    Callback function
    * @return {RBAC}                  Current instance
    */

			value: function grant(role, child, cb) {
				if (!role || !child) {
					return cb(new Error("One of item is undefined"));
				}

				if (role.rbac !== this || child.rbac !== this) {
					return cb(new Error("Item is associated to another RBAC instance"));
				}

				if (!RBAC.isRole(role)) {
					return cb(new Error("Role is not instance of Role"));
				}

				this.storage.grant(role, child, cb);
				return this;
			}
		},
		revoke: {

			/**
    * Revoke permission or role from the role
    * @method RBAC#revoke
    * @param  {Role}            role   Instance of the role
    * @param  {Role|Permission} child  Instance of the role or permission
    * @param  {Function}        cb     Callback function
    * @return {RBAC}                   Current instance
    */

			value: function revoke(role, child, cb) {
				if (!role || !child) {
					return cb(new Error("One of item is undefined"));
				}

				if (role.rbac !== this || child.rbac !== this) {
					return cb(new Error("Item is associated to another RBAC instance"));
				}

				this.storage.revoke(role, child, cb);
				return this;
			}
		},
		revokeByName: {

			/**
    * Revoke permission or role from the role by names
    * @method RBAC#revokeByName
    * @param  {String}   roleName  Instance of the role
    * @param  {String}   childName Instance of the role or permission
    * @param  {Function} cb        Callback function
    * @return {RBAC}               Current instance
    */

			value: function revokeByName(roleName, childName, cb) {
				var _this = this;

				parallel({
					role: function (callback) {
						return _this.get(roleName, callback);
					},
					child: function (callback) {
						return _this.get(childName, callback);
					}
				}, function (err, results) {
					if (err) {
						return cb(err);
					}

					_this.revoke(results.role, results.child, cb);
				});

				return this;
			}
		},
		grantByName: {

			/**
    * Grant permission or role from the role by names
    * @method RBAC#grantByName
    * @param  {String}   roleName  Instance of the role
    * @param  {String}   childName Instance of the role or permission
    * @param  {Function} cb        Callback function
    * @return {RBAC}               Current instance
    */

			value: function grantByName(roleName, childName, cb) {
				var _this = this;

				parallel({
					role: function (callback) {
						return _this.get(roleName, callback);
					},
					child: function (callback) {
						return _this.get(childName, callback);
					}
				}, function (err, results) {
					if (err) {
						return cb(err);
					}

					_this.grant(results.role, results.child, cb);
				});

				return this;
			}
		},
		createRole: {

			/**
    * Create a new role assigned to actual instance of RBAC
    * @method RBAC#createRole
    * @param  {String}  roleName Name of new Role
    * @param  {Boolean} [add=true]    True if you need to add it to the storage
    * @return {Role}    Instance of the Role
    */

			value: function createRole(roleName, add, cb) {
				return new Role(this, roleName, add, cb);
			}
		},
		createPermission: {

			/**
    * Create a new permission assigned to actual instance of RBAC
    * @method RBAC#createPermission
    * @param  {String} action   Name of action
    * @param  {String} resource Name of resource
    * @param  {Boolean} [add=true]   True if you need to add it to the storage
    * @param  {Function} cb     Callback function
    * @return {Permission}      Instance of the Permission
    */

			value: function createPermission(action, resource, add, cb) {
				return new Permission(this, action, resource, add, cb);
			}
		},
		exists: {

			/**
    * Callback returns true if role or permission exists
    * @method RBAC#exists
    * @param  {String}   name  Name of item
    * @param  {Function} cb    Callback function
    * @return {RBAC}           Return instance of actual RBAC
    */

			value: function exists(name, cb) {
				this.storage.exists(name, cb);
				return this;
			}
		},
		existsRole: {

			/**
    * Callback returns true if role exists
    * @method RBAC#existsRole
    * @param  {String}   name  Name of item
    * @param  {Function} cb    Callback function
    * @return {RBAC}           Return instance of actual RBAC
    */

			value: function existsRole(name, cb) {
				this.storage.existsRole(name, cb);
				return this;
			}
		},
		existsPermission: {

			/**
    * Callback returns true if permission exists
    * @method RBAC#existsPermission
    * @param  {String}   action  Name of action
    * @param  {String}   resource  Name of resource
    * @param  {Function} cb    Callback function
    * @return {RBAC}           Return instance of actual RBAC
    */

			value: function existsPermission(action, resource, cb) {
				this.storage.existsPermission(action, resource, cb);
				return this;
			}
		},
		getRole: {

			/**
    * Return instance of Role by his name
    * @method RBAC#getRole
    * @param  {String}   name  Name of role
    * @param  {Function} cb    Callback function
    * @return {RBAC}           Return instance of actual RBAC
    */

			value: function getRole(name, cb) {
				this.storage.getRole(name, cb);
				return this;
			}
		},
		getRoles: {

			/**
    * Return all instances of Role
    * @method RBAC#getRoles
    * @param  {Function} cb    Callback function
    * @return {RBAC}           Return instance of actual RBAC
    */

			value: function getRoles(cb) {
				this.storage.getRoles(cb);
				return this;
			}
		},
		getPermission: {

			/**
    * Return instance of Permission by his name
    * @method RBAC#getPermission
    * @param  {String} action    Name of action
    * @param  {String} resource  Name of resource
    * @param  {Function} cb      Callback function
    * @return {RBAC}             Return instance of actual RBAC
    */

			value: function getPermission(action, resource, cb) {
				this.storage.getPermission(action, resource, cb);
				return this;
			}
		},
		getPermissions: {

			/**
    * Return all instances of Permission
    * @method RBAC#getPermissions
    * @param  {Function} cb    Callback function
    * @return {RBAC}           Return instance of actual RBAC
    */

			value: function getPermissions(cb) {
				this.storage.getPermissions(cb);
				return this;
			}
		},
		createPermissions: {

			/**
    * Create multiple permissions in one step
    * @method RBAC#createPermissions
    * @param  {Object}   permissions Object of permissions
    * @param  {Boolean} [add=true]   True if you need to add it to the storage
    * @param  {Function} cb          Callbck function
    * @return {RBAC}                 Instance of actual RBAC
    */

			value: function createPermissions(resources, add, cb) {
				if (typeof add === "function") {
					cb = add;
					add = true;
				}

				var tasks = {};

				if (!_.isPlainObject(resources)) {
					return cb(new Error("Resources is not a plain object"));
				}

				Object.keys(resources).forEach(function (resource) {
					resources[resource].forEach(function (action) {
						var _this = this;

						var name = Permission.createName(action, resource);
						tasks[name] = function (callback) {
							return _this.createPermission(action, resource, add, callback);
						};
					}, this);
				}, this);

				parallel(tasks, cb);
				return this;
			}
		},
		createRoles: {

			/**
    * Create multiple roles in one step assigned to actual instance of RBAC
    * @method RBAC#createRoles
    * @param  {Array}    roleNames  Array of role names
    * @param  {Boolean} [add=true]   True if you need to add it to the storage
    * @param  {Function} cb         Callback function
    * @return {RBAC}                Current instance
    */

			value: function createRoles(roleNames, add, cb) {
				if (typeof add === "function") {
					cb = add;
					add = true;
				}

				var tasks = {};

				roleNames.forEach(function (roleName) {
					var _this = this;

					tasks[roleName] = function (callback) {
						return _this.createRole(roleName, add, callback);
					};
				}, this);

				parallel(tasks, cb);
				return this;
			}
		},
		grants: {

			/**
    * Grant multiple items in one function
    * @method RBAC#grants
    * @param  {Object}   	  List of roles  
    * @param  {Function} cb  Callback function
    * @return {RBAC}         Current instance
    */

			value: function grants(roles, cb) {
				if (!_.isPlainObject(roles)) {
					return cb(new Error("Grants is not a plain object"));
				}

				var tasks = [];

				Object.keys(roles).forEach(function (role) {
					roles[role].forEach(function (grant) {
						var _this = this;

						tasks.push(function (callback) {
							return _this.grantByName(role, grant, callback);
						});
					}, this);
				}, this);

				parallel(tasks, cb);
				return this;
			}
		},
		create: {

			/**
    * Create multiple permissions and roles in one step
    * @method RBAC#create
    * @param  {Array}   roleNames       List of role names
    * @param  {Object}  permissionNames List of permission names
    * @param  {Object}  [grants]        List og grants
    * @param  {Array}   cb              Callback function
    * @return {RBAC}                    Instance of actual RBAC
    */

			value: function create(roleNames, permissionNames, grants, cb) {
				var _this = this;

				if (typeof grants === "function") {
					cb = grants;
					grants = null;
				}

				var tasks = {
					roles: function (callback) {
						return _this.createRoles(roleNames, callback);
					},
					permissions: function (callback) {
						return _this.createPermissions(permissionNames, callback);
					}
				};

				parallel(tasks, function (err, result) {
					if (err || !grants) {
						return cb(err, result);
					}

					//add grants to roles
					_this.grants(grants, function (err) {
						if (err) {
							return cb(err);
						}

						cb(null, result);
					});
				});

				return this;
			}
		},
		_traverseGrants: {

			/**
    * Traverse hierarchy of roles. 
    * Callback function returns as second parameter item from hierarchy or null if we are on the end of hierarchy.
    * @method RBAC#_traverseGrants
    * @param  {String}   roleName  Name of role
    * @param  {Function} cb        Callback function
    * @return {RBAC}               Return instance of actual RBAC
    * @private
    */

			value: function _traverseGrants(roleName, cb, next, used) {
				var _this = this;

				next = next || [roleName];
				used = used || {};

				var actualRole = next.shift();
				used[actualRole] = true;

				this.storage.getGrants(actualRole, function (err, items) {
					if (err) {
						return cb(err);
					}

					items = items || [];

					for (var i = 0; i < items.length; i++) {
						var item = items[i];
						var name = item.name;

						if (RBAC.isRole(item) && !used[name]) {
							used[name] = true;
							next.push(name);
						}

						if (cb(null, item) === false) {
							return;
						}
					}

					if (next.length === 0) {
						return cb(null, null);
					}

					_this._traverseGrants(null, cb, next, used);
				});

				return this;
			}
		},
		can: {

			/**
    * Return true if role has allowed permission
    * @method RBAC#can
    * @param  {String}  roleName Name of role
    * @param  {String}  action   Name of action
    * @param  {String}  resource Name of resource
    * @param  {Function} cb        Callback function
    * @return {RBAC}             Current instance         
    */

			value: function can(roleName, action, resource, cb) {
				this._traverseGrants(roleName, function (err, item) {
					//if there is a error
					if (err) {
						return cb(err);
					}

					//this is last item
					if (!item) {
						return cb(null, false);
					}

					if (RBAC.isPermission(item) && item.can(action, resource) === true) {
						cb(null, true);
						//end up actual traversing
						return false;
					}
				});

				return this;
			}
		},
		canAny: {

			/**
    * Check if the role has any of the given permissions.
    * @method RBAC#canAny
    * @param  {String} roleName     Name of role
    * @param  {Array}  permissions  Array (String action, String resource)
    * @param  {Function} cb        Callback function
    * @return {RBAC}                Current instance           
    */

			value: function canAny(roleName, permissions, cb) {
				//prepare the names of permissions
				var permissionNames = RBAC.getPermissionNames(permissions);

				//traverse hierarchy
				this._traverseGrants(roleName, function (err, item) {
					//if there is a error
					if (err) {
						return cb(err);
					}

					//this is last item
					if (!item) {
						return cb(null, false);
					}

					if (RBAC.isPermission(item) && permissionNames.indexOf(item.name) !== -1) {
						cb(null, true);
						//end up actual traversing
						return false;
					}
				});

				return this;
			}
		},
		canAll: {

			/**
    * Check if the model has all of the given permissions.
    * @method RBAC#canAll
    * @param  {String} roleName     Name of role
    * @param  {Array}  permissions  Array (String action, String resource)
    * @param  {Function} cb        Callback function
    * @return {RBAC}                Current instance           
    */

			value: function canAll(roleName, permissions, cb) {
				//prepare the names of permissions
				var permissionNames = RBAC.getPermissionNames(permissions);

				var founded = {};
				var foundedCount = 0;

				//traverse hierarchy
				this._traverseGrants(roleName, function (err, item) {
					//if there is a error
					if (err) {
						return cb(err);
					}

					//this is last item
					if (!item) {
						return cb(null, false);
					}

					if (RBAC.isPermission(item) && permissionNames.indexOf(item.name) !== -1 && !founded[item.name]) {
						founded[item.name] = true;
						foundedCount++;

						if (foundedCount === permissionNames.length) {
							cb(null, true);
							//end up actual traversing
							return false;
						}
					}
				});

				return this;
			}
		},
		hasRole: {

			/**
    * Return true if role has allowed permission
    * @method RBAC#hasRole
    * @param  {String}   roleName        Name of role
    * @param  {String}   roleChildName   Name of child role
    * @param  {Function} cb              Callback function
    * @return {RBAC}                     Current instance          
    */

			value: function hasRole(roleName, roleChildName, cb) {
				if (roleName === roleChildName) {
					cb(null, true);
					return this;
				}

				this._traverseGrants(roleName, function (err, item) {
					//if there is a error
					if (err) {
						return cb(err);
					}

					//this is last item
					if (!item) {
						return cb(null, false);
					}

					if (RBAC.isRole(item) && item.name === roleChildName) {
						cb(null, true);
						//end up actual traversing
						return false;
					}
				});

				return this;
			}
		},
		getScope: {

			/**
    * Return array of all permission assigned to role of RBAC
    * @method RBAC#getScope
    * @param  {String} roleName   Name of role
    * @param  {Function} cb       Callback function
    * @return {RBAC}              Current instance   
    */

			value: function getScope(roleName, cb) {
				var scope = [];

				//traverse hierarchy
				this._traverseGrants(roleName, function (err, item) {
					//if there is a error
					if (err) {
						return cb(err);
					}

					//this is last item
					if (!item) {
						return cb(null, scope);
					}

					if (RBAC.isPermission(item) && scope.indexOf(item.name) === -1) {
						scope.push(item.name);
					}
				});

				return this;
			}
		}
	}, {
		getPermissionNames: {

			/**
    * Convert Array of permissions to permission name
    * @function getPermissionNames
    * @memberof RBAC
    * @param  {Array} permissions List of array items of permission names. It contan action and resource
    * @return {Array}             List of permission names
    * @static
    */

			value: function getPermissionNames(permissions) {
				var permissionNames = [];

				for (var i = 0; i < permissions.length; i++) {
					var permission = permissions[i];
					permissionNames.push(Permission.createName(permission[0], permission[1]));
				}

				return permissionNames;
			}
		},
		isPermission: {
			value: function isPermission(item) {
				return item instanceof Permission;
			}
		},
		isRole: {
			value: function isRole(item) {
				return item instanceof Role;
			}
		}
	});

	return RBAC;
})();

module.exports = RBAC;