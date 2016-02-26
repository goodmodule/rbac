'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Base = function () {
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

    if (!rbac || !name || typeof cb !== 'function') {
      return cb(new Error('One of parameters is undefined'));
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

  /**
   * Get name of actual instance
   * @member Base#name {String}
   */


  _createClass(Base, [{
    key: 'remove',


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
  }, {
    key: 'name',
    get: function get() {
      return this._name;
    }

    /**
     * Get instance of RBAC
     * @member Base#rbac {RBAC|null} Instance of RBAC
     */

  }, {
    key: 'rbac',
    get: function get() {
      return this._rbac;
    }
  }]);

  return Base;
}();

exports.default = Base;