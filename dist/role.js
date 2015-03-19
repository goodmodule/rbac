"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Base = _interopRequire(require("./base"));

var Permission = _interopRequire(require("./permission"));

var Role = (function (_Base) {
	/**
  * Role constructor
  * @constructor Role
  * @extends {Base}
  * @param  {RBAC}     rbac       Instance of the RBAC
  * @param  {String}   name       Name of the role
  * @param  {Boolean}  [add=true] True if you need to save it to storage
  * @param  {Function} cb         Callback function after add
  */

	function Role(rbac, name, add, cb) {
		_classCallCheck(this, Role);

		if (typeof add === "function") {
			cb = add;
			add = true;
		}

		if (!Permission.isValidName(name)) {
			return cb(new Error("Role has no valid name"));
		}

		_get(Object.getPrototypeOf(Role.prototype), "constructor", this).call(this, rbac, name, add, cb);
	}

	_inherits(Role, _Base);

	_createClass(Role, {
		grant: {

			/**
    * Add role or permission to current role
    * @method Role#grant
    * @param  {Role|Permission} item	Instance of role or permission
    * @param  {Function} cb	        Callback function
    * @return {Role}                	Return current instance of role
    */

			value: function grant(item, cb) {
				this.rbac.grant(this, item, cb);
				return this;
			}
		},
		revoke: {

			/**
    * Remove role or permission from current role
    * @method Role#revoke 
    * @param  {Role|Permission} item	Instance of role or permission
    * @param  {Function} cb	        Callback function
    * @return {Role}                	Return current instance of role
    */

			value: function revoke(item, cb) {
				this.rbac.revoke(this, item, cb);
				return this;
			}
		},
		can: {

			/**
    * Return true if contains permission
    * @method Role#can 
    * @param  {String}  action  	Name of action
    * @param  {String}  resource	Name of resource
    * @param  {Function} cb	    Callback function
    * @return {Role}            	Return current instance of role          
    */

			value: function can(action, resource, cb) {
				this.rbac.can(this.name, action, resource, cb);
				return this;
			}
		},
		canAny: {

			/**
    * Check if the role has any of the given permissions
    * @method Role#canAny 
    * @param  {Array} permissions	List of permissions. Each has structure (String action, String resource)
    * @param  {Function} cb	    Callback function
    * @return {Role}             	Return current instance of role
    */

			value: function canAny(permissions, cb) {
				this.rbac.canAny(this.name, permissions, cb);
				return this;
			}
		},
		canAll: {

			/**
    * Check if the model has all of the given permissions
    * @method Role#canAll 
    * @param  {Array}  permissions	List of permissions. Each has structure (String action, String resource)
    * @param  {Function} cb	    Callback function
    * @return {Role}              	Return current instance of role            
    */

			value: function canAll(permissions, cb) {
				this.rbac.canAll(this.name, permissions, cb);
				return this;
			}
		},
		hasRole: {

			/**
    * Return true if the current role contains the specified role name
    * @method Role#hasRole 
    * @param  {String} roleChildName	Name of role
    * @param  {Function} cb	        Callback function
    * @return {Role}                	Return current instance of role
    */

			value: function hasRole(roleChildName, cb) {
				this.rbac.hasRole(this.name, roleChildName, cb);
				return this;
			}
		},
		getScope: {

			/**
    * Return array of permission assigned to actual role 
    * @method Role#getScope 
    * @param  {Function} cb	Callback function
    * @return {Role}       	Return current instance of role
    */

			value: function getScope(cb) {
				this.rbac.getScope(this.name, cb);
				return this;
			}
		}
	});

	return Role;
})(Base);

module.exports = Role;