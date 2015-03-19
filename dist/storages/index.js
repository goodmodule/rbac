"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Permission = _interopRequire(require("../permission"));

var Role = _interopRequire(require("../role"));

var Storage = (function () {
	/**
  * Storage constructor
  * @constructor Storage
  */

	function Storage() {
		_classCallCheck(this, Storage);

		this._rbac = null;
	}

	_createClass(Storage, {
		rbac: {

			/**
    * Get instance of RBAC
    * @member Storage#rbac {RBAC|null} Instance of RBAC 
    */

			get: function () {
				return this._rbac;
			},
			set: function (rbac) {
				if (this._rbac) {
					throw new Error("RBAC is already setted");
				}

				this._rbac = rbac;
			}
		},
		add: {

			/**
    * Add permission or role
    * @method Storage#add
    * @param {Base}   item    Instance of role or permission
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function add(item, cb) {
				cb(new Error("Storage method add is not implemented"));
			}
		},
		remove: {

			/**
    * Remove permission or role
    * @method Storage#remove
    * @param {Base}   item    Instance of role or permission
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function remove(item, cb) {
				cb(new Error("Storage method remove is not implemented"));
			}
		},
		grant: {

			/**
    * Add (grant) permission or role to hierarchy of actual role
    * @method Storage#grant
    * @param  {Role}   role  Instance of role
    * @param  {Base}   child Instance of role or permission
    * @param  {Function} cb    Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function grant(role, child, cb) {
				cb(new Error("Storage method grant is not implemented"));
			}
		},
		revoke: {

			/**
    * Remove (revoke) permission or role from hierarchy of actual role
    * @method Storage#revoke
    * @param  {Role}   role  Instance of role
    * @param  {Base}   child Instance of role or permission
    * @param  {Function} cb    Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function revoke(role, child, cb) {
				cb(new Error("Storage method revoke is not implemented"));
			}
		},
		get: {

			/**
    * Get instance of permission or role by his name
    * @method Storage#get
    * @param  {String}   name Name of role or permission
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function get(name, cb) {
				cb(new Error("Storage method get is not implemented"));
			}
		},
		getRoles: {

			/**
    * Get all instances of Roles
    * @method Storage#getRoles
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function getRoles(cb) {
				cb(new Error("Storage method getRoles is not implemented"));
			}
		},
		getPermissions: {

			/**
    * Get all instances of Permissions
    * @method Storage#getPermissions
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function getPermissions(cb) {
				cb(new Error("Storage method getPermissions is not implemented"));
			}
		},
		getGrants: {

			/**
    * Get instances of Roles and Permissions assigned to role
    * @method Storage#getGrants
    * @param  {String}   role Name of role
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function getGrants(role, cb) {
				cb(new Error("Storage method getGrants is not implemented"));
			}
		},
		getRole: {

			/**
    * Get instance of role by his name
    * @method Storage#getRole
    * @param  {String}   name Name of role
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function getRole(name, cb) {
				this.get(name, function (err, item) {
					if (err || !item) {
						return cb(err, item);
					}

					if (item instanceof Role) {
						return cb(null, item);
					}

					cb(null, null);
				});

				return this;
			}
		},
		getPermission: {

			/**
    * Get instance of permission by his name
    * @method Storage#getPermission
    * @param  {String}   action   Name of action
    * @param  {String}   resource Name of resource
    * @param  {Function} cb       Callback function
    * @return {Storage}           Instance of actual storage
    */

			value: function getPermission(action, resource, cb) {
				var name = Permission.createName(action, resource);

				this.get(name, function (err, item) {
					if (err || !item) {
						return cb(err, item);
					}

					if (item instanceof Permission) {
						return cb(null, item);
					}

					cb(null, null);
				});

				return this;
			}
		},
		exists: {

			/**
    * Return true with callback if role or permission exists
    * @method Storage#exists
    * @param  {String}   name Name of role or permission
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function exists(name, cb) {
				this.get(name, function (err, item) {
					if (err) {
						return cb(err);
					}

					if (!item) {
						return cb(null, false);
					}

					return cb(null, true);
				});

				return this;
			}
		},
		existsRole: {

			/**
    * Return true with callback if role exists
    * @method Storage#existsRole
    * @param  {String}   name Name of role
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function existsRole(name, cb) {
				this.getRole(name, function (err, item) {
					if (err) {
						return cb(err);
					}

					if (!item) {
						return cb(null, false);
					}

					return cb(null, true);
				});

				return this;
			}
		},
		existsPermission: {

			/**
    * Return true with callback if permission exists
    * @method Storage#existsPermission
    * @param  {String}   name Name of permission
    * @param  {Function} cb   Callback function
    * @return {Storage}       Instance of actual storage
    */

			value: function existsPermission(action, resource, cb) {
				this.getPermission(action, resource, function (err, item) {
					if (err) {
						return cb(err);
					}

					if (!item) {
						return cb(null, false);
					}

					return cb(null, true);
				});

				return this;
			}
		}
	});

	return Storage;
})();

module.exports = Storage;