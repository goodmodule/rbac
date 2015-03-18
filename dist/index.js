"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var RBAC = _interopRequire(require("./rbac"));

var Role = _interopRequire(require("./role"));

var Permission = _interopRequire(require("./permission"));

var Storage = _interopRequire(require("./storages/index"));

var MongooseStorage = _interopRequire(require("./storages/mongoose"));

Storage.Mongoose = MongooseStorage;

RBAC.Role = Role;
RBAC.Permission = Permission;
RBAC.Storage = Storage;

module.exports = RBAC;