'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _permission = require('../permission');

var _permission2 = _interopRequireDefault(_permission);

var _role = require('../role');

var _role2 = _interopRequireDefault(_role);

var Memory = (function (_Storage) {
  _inherits(Memory, _Storage);

  function Memory() {
    _classCallCheck(this, Memory);

    _get(Object.getPrototypeOf(Memory.prototype), 'constructor', this).call(this);

    this._items = {};
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

      if (!role instanceof _role2['default']) {
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

      for (var _name in this._items) {
        if (!this._items.hasOwnProperty(_name)) {
          continue;
        }

        var item = this._items[_name].instance;

        if (item instanceof _role2['default']) {
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

      for (var _name2 in this._items) {
        if (!this._items.hasOwnProperty(_name2)) {
          continue;
        }

        var item = this._items[_name2].instance;

        if (item instanceof _permission2['default']) {
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
})(_index2['default']);

exports['default'] = Memory;
module.exports = exports['default'];