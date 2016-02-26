'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DELIMITER = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Base2 = require('./Base');

var _Base3 = _interopRequireDefault(_Base2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DELIMITER = exports.DELIMITER = '_';

var Permission = function (_Base) {
  _inherits(Permission, _Base);

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

    if (typeof add === 'function') {
      cb = add;
      add = true;
    }

    if (!action || !resource) {
      var _ret;

      return _ret = cb(new Error('One of parameters is undefined')), _possibleConstructorReturn(_this, _ret);
    }

    if (!Permission.isValidName(action) || !Permission.isValidName(resource)) {
      var _ret2;

      return _ret2 = cb(new Error('Action or resource has no valid name')), _possibleConstructorReturn(_this, _ret2);
    }

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Permission).call(this, rbac, Permission.createName(action, resource), add, cb));
  }

  /**
   * Get action name of actual permission
   * @member Permission#action {String} Action of permission
   */


  _createClass(Permission, [{
    key: 'can',


    /**
     * Return true if has same action and resource
     * @method Permission#can
     * @param  {String}  action   Name of action
     * @param  {String}  resource Name of resource
     * @return {Boolean}
     */
    value: function can(action, resource) {
      return this.action === action && this.resource === resource;
    }

    /**
     * Compute name of permission from action and resource
     * @function createName
     * @memberof Permission
     * @param  {String} action   Name of permission
     * @param  {String} resource Resource of permission
     * @return {String}          Computed name of permission
     * @static
     */

  }, {
    key: 'action',
    get: function get() {
      if (!this._action) {
        var decoded = Permission.decodeName(this.name);
        if (!decoded) {
          throw new Error('Action is null');
        }

        this._action = decoded.action;
      }

      return this._action;
    }

    /**
     * Get resource name of actual permission
     * @member Permission#resource {String} Resource of permission
     */

  }, {
    key: 'resource',
    get: function get() {
      if (!this._resource) {
        var decoded = Permission.decodeName(this.name);
        if (!decoded) {
          throw new Error('Resource is null');
        }

        this._resource = decoded.resource;
      }

      return this._resource;
    }
  }], [{
    key: 'createName',
    value: function createName(action, resource) {
      return action + DELIMITER + resource;
    }
  }, {
    key: 'decodeName',
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

    /**
     * Correct name can contain only alphanumeric characters
     * @function isValidName
     * @memberof Permission
     * @param  {String}  name Name
     * @return {Boolean}
     * @static
     */

  }, {
    key: 'isValidName',
    value: function isValidName(name) {
      if (/^[a-zA-Z0-9]+$/.test(name)) {
        return true;
      }

      return false;
    }
  }]);

  return Permission;
}(_Base3.default);

exports.default = Permission;