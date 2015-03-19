"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Base = (function () {
	/**
  * Base constructor
  * @constructor Base
  * @param  {RBAC}     rbac     Instance of the RBAC
  * @param  {String}   name     Name of the grant
  * @param  {Boolean}  add      True if you need to save it to storage
  * @param  {Function} cb       Callback function after add
  */

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
    * @member Base#name {String}
    */

			get: function () {
				return this._name;
			}
		},
		rbac: {

			/**
    * Get instance of RBAC
    * @member Base#rbac {RBAC|null} Instance of RBAC 
    */

			get: function () {
				return this._rbac;
			}
		},
		remove: {

			/**
    * Remove this from RBAC (storage)
    * @method Base#remove
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