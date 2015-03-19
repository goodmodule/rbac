"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
	value: true
});

var Base = _interopRequire(require("./base"));

var DELIMITER = "_";

exports.DELIMITER = DELIMITER;

var Permission = (function (_Base) {
	/**
  * Permission constructor
  * @constructor Permission
  * @extends {Base}
  * @param  {RBAC}     rbac       Instance of the RBAC
  * @param  {String}   action     Name of the action
  * @param  {String}   resource   Name of the resource
  * @param  {Boolean}  [add=true] True if you need to save it to storage
  * @param  {Function} cb         Callback function after add
  */

	function Permission(rbac, action, resource, add, cb) {
		_classCallCheck(this, Permission);

		if (typeof add === "function") {
			cb = add;
			add = true;
		}

		if (!action || !resource) {
			return cb(new Error("One of parameters is undefined"));
		}

		if (!Permission.isValidName(action) || !Permission.isValidName(resource)) {
			return cb(new Error("Action or resource has no valid name"));
		}

		this._action = action;
		this._resource = resource;

		_get(Object.getPrototypeOf(Permission.prototype), "constructor", this).call(this, rbac, Permission.createName(action, resource), add, cb);
	}

	_inherits(Permission, _Base);

	_createClass(Permission, {
		action: {

			/**
    * Get action name of actual permission
    * @member Permission#action {String} Action of permission
    */

			get: function () {
				return this._action;
			}
		},
		resource: {

			/**
    * Get resource name of actual permission
    * @member Permission#resource {String} Resource of permission
    */

			get: function () {
				return this._resource;
			}
		},
		can: {

			/**
    * Return true if has same action and resource
    * @method Permission#can
    * @param  {String}  action   Name of action
    * @param  {String}  resource Name of resource
    * @return {Boolean}          
    */

			value: function can(action, resource) {
				return this._action === action && this._resource === resource;
			}
		}
	}, {
		createName: {

			/**
    * Compute name of permission from action and resource
    * @function createName
    * @memberof Permission
    * @param  {String} action   Name of permission
    * @param  {String} resource Resource of permission
    * @return {String}          Computed name of permission
    * @static
    */

			value: function createName(action, resource) {
				return action + DELIMITER + resource;
			}
		},
		decodeName: {
			value: function decodeName(name) {
				var pos = name.indexOf(DELIMITER);
				if (pos === -1) {
					return null;
				}

				return {
					action: name.substr(0, pos),
					resource: name.substr(pos + 1)
				};
			}
		},
		isValidName: {

			/**
    * Correct name can contain only alphanumeric characters
    * @function isValidName
    * @memberof Permission
    * @param  {String}  name Name
    * @return {Boolean}  
    * @static    
    */

			value: function isValidName(name) {
				if (/^[a-zA-Z0-9]+$/.test(name)) {
					return true;
				}

				return false;
			}
		}
	});

	return Permission;
})(Base);

exports["default"] = Permission;