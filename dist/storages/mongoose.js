'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _permission = require('../permission');

var _permission2 = _interopRequireDefault(_permission);

var _role = require('../role');

var _role2 = _interopRequireDefault(_role);

var _keymirror = require('keymirror');

var _keymirror2 = _interopRequireDefault(_keymirror);

var Type = (0, _keymirror2['default'])({
  PERMISSION: null,
  ROLE: null
});

function createSchema(Schema) {
  var schema = new Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, 'enum': _lodash2['default'].values(Type), required: true },
    grants: [String]
  });

  return schema;
}

function getType(item) {
  if (item instanceof _role2['default']) {
    return Type.ROLE;
  } else if (item instanceof _permission2['default']) {
    return Type.PERMISSION;
  }

  return null;
}

function convertToInstance(rbac, record) {
  if (!record) {
    throw new Error('Record is undefined');
  }

  if (record.type === Type.ROLE) {
    return rbac.createRole(record.name, false, function () {});
  } else if (record.type === Type.PERMISSION) {
    var decoded = _permission2['default'].decodeName(record.name);
    if (!decoded) {
      throw new Error('Bad permission name');
    }

    return rbac.createPermission(decoded.action, decoded.resource, false, function () {});
  }

  throw new Error('Type is undefined');
}

var MongooseStorage = (function (_Storage) {
  function MongooseStorage() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, MongooseStorage);

    _get(Object.getPrototypeOf(MongooseStorage.prototype), 'constructor', this).call(this);

    var connection = options.connection;
    if (!connection) {
      throw new Error('Parameter connection is undefined use your current mongoose connection.');
    }

    options.modelName = options.modelName || 'rbac';
    options.Schema = options.Schema || connection.Schema;

    this._options = options;

    this._model = connection.model(options.modelName, createSchema(options.Schema));
  }

  _inherits(MongooseStorage, _Storage);

  _createClass(MongooseStorage, [{
    key: 'add',
    value: function add(item, cb) {
      this.model.create({
        name: item.name,
        type: getType(item)
      }, function (err, obj) {
        if (err) {
          return cb(err);
        }

        if (!obj) {
          return cb(new Error('Item is undefined'));
        }

        cb(null, item);
      });

      return this;
    }
  }, {
    key: 'remove',
    value: function remove(item, cb) {
      var _this = this;

      var name = item.name;

      this.model.update({ grants: name }, {
        $pull: {
          grants: name
        }
      }, { multi: true }, function (err) {
        if (err) {
          return cb(err);
        }

        _this.model.remove({ name: name }, function (err2) {
          if (err2) {
            return cb(err2);
          }

          cb(null, true);
        });
      });

      return this;
    }
  }, {
    key: 'grant',
    value: function grant(role, child, cb) {
      var name = role.name;
      var childName = child.name;

      if (!role instanceof _role2['default']) {
        return cb(new Error('Role is not instance of Role'));
      }

      if (name === childName) {
        return cb(new Error('You can grant yourself'));
      }

      this.model.update({ name: name, type: Type.ROLE }, { $addToSet: { grants: childName } }, function (err) {
        if (err) {
          return cb(err);
        }

        cb(null, true);
      });

      return this;
    }
  }, {
    key: 'revoke',
    value: function revoke(role, child, cb) {
      var name = role.name;
      var childName = child.name;

      this.model.update({ name: name, type: Type.ROLE }, { $pull: { grants: childName } }, function (err, num) {
        if (err) {
          return cb(err);
        }

        if (num === 0) {
          return cb(new Error('Item is not associated to this item'));
        }

        return cb(null, true);
      });

      return this;
    }
  }, {
    key: 'get',
    value: function get(name, cb) {
      var rbac = this.rbac;

      this.model.findOne({ name: name }, function (err, record) {
        if (err) {
          return cb(err);
        }

        if (!record) {
          return cb(null, null);
        }

        cb(null, convertToInstance(rbac, record));
      });

      return this;
    }
  }, {
    key: 'getRoles',
    value: function getRoles(cb) {
      var rbac = this.rbac;

      this.model.find({ type: Type.ROLE }, function (err, records) {
        if (err) {
          return cb(err);
        }

        var instances = records.map(function (r) {
          return convertToInstance(rbac, r);
        });

        cb(null, instances);
      });

      return this;
    }
  }, {
    key: 'getPermissions',
    value: function getPermissions(cb) {
      var rbac = this.rbac;

      this.model.find({ type: Type.PERMISSION }, function (err, records) {
        if (err) {
          return cb(err);
        }

        var instances = records.map(function (r) {
          return convertToInstance(rbac, r);
        });

        cb(null, instances);
      });

      return this;
    }
  }, {
    key: 'getGrants',
    value: function getGrants(role, cb) {
      var _this2 = this;

      var rbac = this.rbac;

      this.model.findOne({ name: role, type: Type.ROLE }, function (err, record) {
        if (err) {
          return cb(err);
        }

        if (!record || !record.grants.length) {
          return cb(null, []);
        }

        _this2.model.find({ name: record.grants }, function (err2, records) {
          if (err2) {
            return cb(err2);
          }

          var instances = records.map(function (r) {
            return convertToInstance(rbac, r);
          });

          cb(null, instances);
        });
      });

      return this;
    }
  }, {
    key: 'model',
    get: function get() {
      return this._model;
    }
  }, {
    key: 'options',
    get: function get() {
      return this._options;
    }
  }]);

  return MongooseStorage;
})(_index2['default']);

exports['default'] = MongooseStorage;
module.exports = exports['default'];