'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _Permission = require('../Permission');

var _Permission2 = _interopRequireDefault(_Permission);

var _Role = require('../Role');

var _Role2 = _interopRequireDefault(_Role);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Memory = function (_Storage) {
  _inherits(Memory, _Storage);

  function Memory() {
    _classCallCheck(this, Memory);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Memory).call(this));

    _this._items = {};
    return _this;
  }

  _createClass(Memory, [{
    key: 'add',
    value: function add(item, cb) {
      var name = item.name;
      if (this._items[name]) {
        return cb(null, this._items[name].item);
      }

      this._items[name] = {
        instance: item,
        grants: []
      };

      cb(null, item);
      return this;
    }
  }, {
    key: 'remove',
    value: function remove(item, cb) {
      var name = item.name;
      if (!this._items[name]) {
        return cb(new Error('Item is not presented in storage'));
      }

      // revoke from all instances
      for (var index in this._items) {
        if (!this._items.hasOwnProperty(index)) {
          continue;
        }

        var grants = this._items[index].grants;

        for (var i = 0; i < grants.length; i++) {
          if (grants[i] === name) {
            grants.splice(i, 1);
            break;
          }
        }
      }

      // delete from items
      delete this._items[name];

      cb(null, true);
      return this;
    }
  }, {
    key: 'grant',
    value: function grant(role, child, cb) {
      var name = role.name;
      var childName = child.name;

      if (!this._items[name] || !this._items[childName]) {
        return cb(new Error('Role is not exist'));
      }

      if (!role instanceof _Role2.default) {
        return cb(new Error('Role is not instance of Role'));
      }

      if (name === childName) {
        return cb(new Error('You can grant yourself'));
      }

      var grants = this._items[name].grants;
      for (var i = 0; i < grants.length; i++) {
        var grant = grants[i];

        if (grant === childName) {
          return cb(null, true);
        }
      }

      grants.push(childName);
      cb(null, true);
      return this;
    }
  }, {
    key: 'revoke',
    value: function revoke(role, child, cb) {
      var name = role.name;
      var childName = child.name;

      if (!this._items[name] || !this._items[childName]) {
        return cb(new Error('Role is not exist'));
      }

      var grants = this._items[name].grants;
      for (var i = 0; i < grants.length; i++) {
        var grant = grants[i];

        if (grant === childName) {
          grants.splice(i, 1);
          return cb(null, true);
        }
      }

      cb(new Error('Item is not associated to this item'));
      return this;
    }
  }, {
    key: 'get',
    value: function get(name, cb) {
      if (!name || !this._items[name]) {
        return cb(null, null);
      }

      cb(null, this._items[name].instance);
      return this;
    }
  }, {
    key: 'getRoles',
    value: function getRoles(cb) {
      var items = [];

      for (var name in this._items) {
        if (!this._items.hasOwnProperty(name)) {
          continue;
        }

        var item = this._items[name].instance;

        if (item instanceof _Role2.default) {
          items.push(item);
        }
      }

      cb(null, items);
      return this;
    }
  }, {
    key: 'getPermissions',
    value: function getPermissions(cb) {
      var items = [];

      for (var name in this._items) {
        if (!this._items.hasOwnProperty(name)) {
          continue;
        }

        var item = this._items[name].instance;

        if (item instanceof _Permission2.default) {
          items.push(item);
        }
      }

      cb(null, items);
      return this;
    }
  }, {
    key: 'getGrants',
    value: function getGrants(role, cb) {
      if (!role || !this._items[role]) {
        return cb(null, null);
      }

      var roleGrants = this._items[role].grants;

      var grants = [];
      for (var i = 0; i < roleGrants.length; i++) {
        var grantName = roleGrants[i];
        var grant = this._items[grantName];
        if (!grant) {
          continue;
        }

        grants.push(grant.instance);
      }

      cb(null, grants);
      return this;
    }
  }]);

  return Memory;
}(_index2.default);

exports.default = Memory;