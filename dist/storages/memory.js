"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Storage = _interopRequire(require("./index"));

var Permission = _interopRequire(require("../permission"));

var Role = _interopRequire(require("../role"));

var Memory = (function (_Storage) {
	function Memory() {
		_classCallCheck(this, Memory);

		this._items = {};
		_get(Object.getPrototypeOf(Memory.prototype), "constructor", this).call(this);
	}

	_inherits(Memory, _Storage);

	_createClass(Memory, {
		add: {
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
		},
		remove: {
			value: function remove(item, cb) {
				var name = item.name;
				if (!this._items[name]) {
					return cb(new Error("Item is not presented in storage"));
				}

				//revoke from all instances
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

				//delete from items
				delete this._items[name];

				cb(null, true);
				return this;
			}
		},
		grant: {
			value: (function (_grant) {
				var _grantWrapper = function grant(_x, _x2, _x3) {
					return _grant.apply(this, arguments);
				};

				_grantWrapper.toString = function () {
					return _grant.toString();
				};

				return _grantWrapper;
			})(function (role, child, cb) {
				var name = role.name;
				var childName = child.name;

				if (!this._items[name] || !this._items[childName]) {
					return cb(new Error("Role is not exist"));
				}

				if (!role instanceof Role) {
					return cb(new Error("Role is not instance of Role"));
				}

				if (name === childName) {
					return cb(new Error("You can grant yourself"));
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
			})
		},
		revoke: {
			value: function revoke(role, child, cb) {
				var name = role.name;
				var childName = child.name;

				if (!this._items[name] || !this._items[childName]) {
					return cb(new Error("Role is not exist"));
				}

				var grants = this._items[name].grants;
				for (var i = 0; i < grants.length; i++) {
					var grant = grants[i];
					if (grant === childName) {
						grants.splice(i, 1);
						return cb(null, true);
					}
				}

				cb(new Error("Item is not associated to this item"));
				return this;
			}
		},
		get: {
			value: function get(name, cb) {
				if (!name || !this._items[name]) {
					return cb(null, null);
				}

				cb(null, this._items[name].instance);
				return this;
			}
		},
		getRoles: {
			value: function getRoles(cb) {
				var items = [];

				for (var name in this._items) {
					if (!this._items.hasOwnProperty(name)) {
						continue;
					}

					var item = this._items[name].instance;

					if (item instanceof Role) {
						items.push(item);
					}
				}

				cb(null, items);
				return this;
			}
		},
		getPermissions: {
			value: function getPermissions(cb) {
				var items = [];

				for (var name in this._items) {
					if (!this._items.hasOwnProperty(name)) {
						continue;
					}

					var item = this._items[name].instance;

					if (item instanceof Permission) {
						items.push(item);
					}
				}

				cb(null, items);
				return this;
			}
		},
		getGrants: {
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
		}
	});

	return Memory;
})(Storage);

module.exports = Memory;