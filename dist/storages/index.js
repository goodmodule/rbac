'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Permission = require('../Permission');

var _Permission2 = _interopRequireDefault(_Permission);

var _Role = require('../Role');

var _Role2 = _interopRequireDefault(_Role);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Storage = function () {
  /**
   * Storage constructor
   * @constructor Storage
   */

  function Storage() {
    _classCallCheck(this, Storage);

    this._rbac = null;
  }

  /**
   * Get instance of RBAC
   * @member Storage#rbac {RBAC|null} Instance of RBAC
   */


  _createClass(Storage, [{
    key: 'add',


    /**
     * Add permission or role
     * @method Storage#add
     * @param {Base}   item    Instance of role or permission
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */
    value: function add(item, cb) {
      cb(new Error('Storage method add is not implemented'));
    }

    /**
     * Remove permission or role
     * @method Storage#remove
     * @param {Base}   item    Instance of role or permission
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'remove',
    value: function remove(item, cb) {
      cb(new Error('Storage method remove is not implemented'));
    }

    /**
     * Add (grant) permission or role to hierarchy of actual role
     * @method Storage#grant
     * @param  {Role}   role  Instance of role
     * @param  {Base}   child Instance of role or permission
     * @param  {Function} cb    Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'grant',
    value: function grant(role, child, cb) {
      cb(new Error('Storage method grant is not implemented'));
    }

    /**
     * Remove (revoke) permission or role from hierarchy of actual role
     * @method Storage#revoke
     * @param  {Role}   role  Instance of role
     * @param  {Base}   child Instance of role or permission
     * @param  {Function} cb    Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'revoke',
    value: function revoke(role, child, cb) {
      cb(new Error('Storage method revoke is not implemented'));
    }

    /**
     * Get instance of permission or role by his name
     * @method Storage#get
     * @param  {String}   name Name of role or permission
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'get',
    value: function get(name, cb) {
      cb(new Error('Storage method get is not implemented'));
    }

    /**
     * Get all instances of Roles
     * @method Storage#getRoles
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'getRoles',
    value: function getRoles(cb) {
      cb(new Error('Storage method getRoles is not implemented'));
    }

    /**
     * Get all instances of Permissions
     * @method Storage#getPermissions
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'getPermissions',
    value: function getPermissions(cb) {
      cb(new Error('Storage method getPermissions is not implemented'));
    }

    /**
     * Get instances of Roles and Permissions assigned to role
     * @method Storage#getGrants
     * @param  {String}   role Name of role
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'getGrants',
    value: function getGrants(role, cb) {
      cb(new Error('Storage method getGrants is not implemented'));
    }

    /**
     * Get instance of role by his name
     * @method Storage#getRole
     * @param  {String}   name Name of role
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'getRole',
    value: function getRole(name, cb) {
      this.get(name, function (err, item) {
        if (err || !item) {
          return cb(err, item);
        }

        if (item instanceof _Role2.default) {
          return cb(null, item);
        }

        cb(null, null);
      });

      return this;
    }

    /**
     * Get instance of permission by his name
     * @method Storage#getPermission
     * @param  {String}   action   Name of action
     * @param  {String}   resource Name of resource
     * @param  {Function} cb       Callback function
     * @return {Storage}           Instance of actual storage
     */

  }, {
    key: 'getPermission',
    value: function getPermission(action, resource, cb) {
      var name = _Permission2.default.createName(action, resource);

      this.get(name, function (err, item) {
        if (err || !item) {
          return cb(err, item);
        }

        if (item instanceof _Permission2.default) {
          return cb(null, item);
        }

        cb(null, null);
      });

      return this;
    }

    /**
     * Return true with callback if role or permission exists
     * @method Storage#exists
     * @param  {String}   name Name of role or permission
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'exists',
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

    /**
     * Return true with callback if role exists
     * @method Storage#existsRole
     * @param  {String}   name Name of role
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'existsRole',
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

    /**
     * Return true with callback if permission exists
     * @method Storage#existsPermission
     * @param  {String}   name Name of permission
     * @param  {Function} cb   Callback function
     * @return {Storage}       Instance of actual storage
     */

  }, {
    key: 'existsPermission',
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
  }, {
    key: 'rbac',
    get: function get() {
      return this._rbac;
    },
    set: function set(rbac) {
      if (this._rbac) {
        throw new Error('RBAC is already setted');
      }

      this._rbac = rbac;
    }
  }]);

  return Storage;
}();

exports.default = Storage;