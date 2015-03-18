"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @constructor
 */

var Base = (function () {
	function Base(rbac, name, add, cb) {
		var _this = this;

		_classCallCheck(this, Base);

		if (!rbac || !name || typeof cb !== "function") {
			return cb(new Error("One of parameters is undefined"));
		}

		this._name = name;
		this._rbac = rbac;

		if (!add) {
			return cb(null, this);
		}

		rbac.add(this, function (err) {
			return cb(err, _this);
		});
	}

	_createClass(Base, {
		name: {

			/**
    * Get name of actual instance
    * @return {String}  Name of instance
    */

			get: function () {
				return this._name;
			}
		},
		rbac: {

			/**
    * Get instance of RBAC
    * @return {RBAC|null} Instance of RBAC 
    */

			get: function () {
				return this._rbac;
			}
		},
		remove: {

			/**
    * Remove item from RBAC
    * @param  {Function} cb Callback function
    * @return {Base}      
    */

			value: function remove(cb) {
				this.rbac.remove(this, cb);
				return this;
			}
		}
	});

	return Base;
})();

module.exports = Base;