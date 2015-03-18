"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _ = _interopRequire(require("lodash"));

var Storage = _interopRequire(require("./index"));

var Permission = _interopRequire(require("../permission"));

var Role = _interopRequire(require("../role"));

var keymirror = _interopRequire(require("keymirror"));

var Type = keymirror({
	PERMISSION: null,
	ROLE: null
});

function createSchema(Schema) {
	var schema = new Schema({
		name: { type: String, required: true, unique: true },
		type: { type: String, "enum": _.values(Type), required: true },
		grants: [String]
	});

	return schema;
}

function getType(item) {
	if (item instanceof Role) {
		return Type.ROLE;
	} else if (item instanceof Permission) {
		return Type.PERMISSION;
	}

	return null;
}

function convertToInstance(rbac, record) {
	if (!record) {
		throw new Error("Record is undefined");
	}

	if (record.type === Type.ROLE) {
		return rbac.createRole(record.name, false, function () {});
	} else if (record.type === Type.PERMISSION) {
		var decoded = Permission.decodeName(record.name);
		if (!decoded) {
			throw new Error("Bad permission name");
		}

		return rbac.createPermission(decoded.action, decoded.resource, false, function () {});
	}

	throw new Error("Type is undefined");
}

var MongooseStorage = (function (_Storage) {
	function MongooseStorage(options) {
		_classCallCheck(this, MongooseStorage);

		_get(Object.getPrototypeOf(MongooseStorage.prototype), "constructor", this).call(this);

		options = options || {};

		var connection = options.connection;
		if (!connection) {
			throw new Error("Parameter connection is undefined use your current mongoose connection.");
		}

		options.modelName = options.modelName || "rbac";
		options.Schema = options.Schema || connection.Schema;

		this._options = options;

		this._model = connection.model(options.modelName, createSchema(options.Schema));
	}

	_inherits(MongooseStorage, _Storage);

	_createClass(MongooseStorage, {
		model: {
			get: function () {
				return this._model;
			}
		},
		options: {
			get: function () {
				return this._options;
			}
		},
		add: {
			value: function add(item, cb) {
				this.model.create({
					name: item.name,
					type: getType(item)
				}, function (err, obj) {
					if (err) {
						return cb(err);
					}

					if (!obj) {
						return cb(new Error("Item is undefined"));
					}

					cb(null, item);
				});

				return this;
			}
		},
		remove: {
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

					_this.model.remove({ name: name }, function (err) {
						if (err) {
							return cb(err);
						}

						cb(null, true);
					});
				});

				return this;
			}
		},
		grant: {
			value: function grant(role, child, cb) {
				var name = role.name;
				var childName = child.name;

				if (!role instanceof Role) {
					return cb(new Error("Role is not instance of Role"));
				}

				if (name === childName) {
					return cb(new Error("You can grant yourself"));
				}

				this.model.update({ name: name, type: Type.ROLE }, { $addToSet: { grants: childName } }, function (err) {
					if (err) {
						return cb(err);
					}

					cb(null, true);
				});

				return this;
			}
		},
		revoke: {
			value: function revoke(role, child, cb) {
				var name = role.name;
				var childName = child.name;

				this.model.update({ name: name, type: Type.ROLE }, { $pull: { grants: childName } }, function (err, num) {
					if (err) {
						return cb(err);
					}

					if (num === 0) {
						return cb(new Error("Item is not associated to this item"));
					}

					return cb(null, true);
				});

				return this;
			}
		},
		get: {
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
		},
		getRoles: {
			value: function getRoles(cb) {
				var rbac = this.rbac;

				this.model.find({ type: Type.ROLE }, function (err, records) {
					if (err) {
						return cb(err);
					}

					records = records.map(function (record) {
						return convertToInstance(rbac, record);
					});

					cb(null, records);
				});

				return this;
			}
		},
		getPermissions: {
			value: function getPermissions(cb) {
				var rbac = this.rbac;

				this.model.find({ type: Type.PERMISSION }, function (err, records) {
					if (err) {
						return cb(err);
					}

					records = records.map(function (record) {
						return convertToInstance(rbac, record);
					});

					cb(null, records);
				});

				return this;
			}
		},
		getGrants: {
			value: function getGrants(role, cb) {
				var _this = this;

				var rbac = this.rbac;

				this.model.findOne({ name: role, type: Type.ROLE }, function (err, record) {
					if (err) {
						return cb(err);
					}

					if (!record || !record.grants.length) {
						return cb(null, []);
					}

					_this.model.find({ name: record.grants }, function (err, records) {
						if (err) {
							return cb(err);
						}

						records = records.map(function (record) {
							return convertToInstance(rbac, record);
						});

						cb(null, records);
					});
				});

				return this;
			}
		}
	});

	return MongooseStorage;
})(Storage);

module.exports = MongooseStorage;