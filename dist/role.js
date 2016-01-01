'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _permission = require('./permission');

var _permission2 = _interopRequireDefault(_permission);

var Role = (function (_Base) {
  _inherits(Role, _Base);

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

    if (typeof add === 'function') {
      cb = add;
      add = true;
    }

    if (!_permission2['default'].isValidName(name)) {
      return cb(new Error('Role has no valid name'));
    }

    _get(Object.getPrototypeOf(Role.prototype), 'constructor', this).call(this, rbac, name, add, cb);
  }

  /**
   * Add role or permission to current role
   * @method Role#grant
   * @param  {Role|Permission} item Instance of role or permission
   * @param  {Function} cb          Callback function
   * @return {Role}                 Return current instance of role
   */

  _createClass(Role, [{
    key: 'grant',
    value: function grant(item, cb) {
      this.rbac.grant(this, item, cb);
      return this;
    }

    /**
     * Remove role or permission from current role
     * @method Role#revoke
     * @param  {Role|Permission} item Instance of role or permission
     * @param  {Function} cb          Callback function
     * @return {Role}                 Return current instance of role
     */
  }, {
    key: 'revoke',
    value: function revoke(item, cb) {
      this.rbac.revoke(this, item, cb);
      return this;
    }

    /**
     * Return true if contains permission
     * @method Role#can
     * @param  {String}  action   Name of action
     * @param  {String}  resource Name of resource
     * @param  {Function} cb      Callback function
     * @return {Role}             Return current instance of role
     */
  }, {
    key: 'can',
    value: function can(action, resource, cb) {
      this.rbac.can(this.name, action, resource, cb);
      return this;
    }

    /**
     * Check if the role has any of the given permissions
     * @method Role#canAny
     * @param  {Array} permissions  List of permissions. Each has structure (String action, String resource)
     * @param  {Function} cb      Callback function
     * @return {Role}               Return current instance of role
     */
  }, {
    key: 'canAny',
    value: function canAny(permissions, cb) {
      this.rbac.canAny(this.name, permissions, cb);
      return this;
    }

    /**
     * Check if the model has all of the given permissions
     * @method Role#canAll
     * @param  {Array}  permissions List of permissions. Each has structure (String action, String resource)
     * @param  {Function} cb      Callback function
     * @return {Role}               Return current instance of role
     */
  }, {
    key: 'canAll',
    value: function canAll(permissions, cb) {
      this.rbac.canAll(this.name, permissions, cb);
      return this;
    }

    /**
     * Return true if the current role contains the specified role name
     * @method Role#hasRole
     * @param  {String} roleChildName Name of role
     * @param  {Function} cb          Callback function
     * @return {Role}                 Return current instance of role
     */
  }, {
    key: 'hasRole',
    value: function hasRole(roleChildName, cb) {
      this.rbac.hasRole(this.name, roleChildName, cb);
      return this;
    }

    /**
     * Return array of permission assigned to actual role
     * @method Role#getScope
     * @param  {Function} cb  Callback function
     * @return {Role}         Return current instance of role
     */
  }, {
    key: 'getScope',
    value: function getScope(cb) {
      this.rbac.getScope(this.name, cb);
      return this;
    }
  }]);

  return Role;
})(_base2['default']);

exports['default'] = Role;
module.exports = exports['default'];