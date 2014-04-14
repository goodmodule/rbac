'use strict';

var Role = require('./role'),
	Permission = require('./permission'),
	Base = require('./base');

function Storage() {
	this._items = {};
}

Storage.prototype.add = function(item, cb) {
	var name = item.getName();

	if(this._items[name]) {
		return cb(new Error('Item with this name already exists'));
	}

	this._items[name] = {
		item: item,
		grant: {}
	};

	cb(null, item);
};

Storage.prototype.remove = function(item, cb) {
	var name = item.getName();

	if(!this._items[name]) {
		return cb(new Error('Item is unregistered'));
	}

	delete this._items[name];

	cb(null, true);
};

Storage.prototype.grant = function(parent, child, cb) {
	cb(null, true);
};

Storage.prototype.revoke = function(parent, child, cb) {
	cb(null, true);
};

Storage.prototype.get = function(name, cb) {
	cb(null, this._items[name] ? this._items[name].item : null);
};

Storage.prototype.getItems = function(cb) {
	cb(null, this._items)
};