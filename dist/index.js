'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rbac = require('./rbac');

var _rbac2 = _interopRequireDefault(_rbac);

var _role = require('./role');

var _role2 = _interopRequireDefault(_role);

var _permission = require('./permission');

var _permission2 = _interopRequireDefault(_permission);

var _storagesIndex = require('./storages/index');

var _storagesIndex2 = _interopRequireDefault(_storagesIndex);

var _storagesMongoose = require('./storages/mongoose');

var _storagesMongoose2 = _interopRequireDefault(_storagesMongoose);

_storagesIndex2['default'].Mongoose = _storagesMongoose2['default'];

_rbac2['default'].Role = _role2['default'];
_rbac2['default'].Permission = _permission2['default'];
_rbac2['default'].Storage = _storagesIndex2['default'];

exports['default'] = _rbac2['default'];
module.exports = exports['default'];