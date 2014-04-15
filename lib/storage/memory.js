'use strict';

var util = require("util"),
	Storage = require("./index");

function Memory() {
	this._items = {};

	Storage.call(this);
}

util.inherits(Memory, Storage);

/**
 * Add new Permission/Role to RBAC
 * @param {[type]}   item [description]
 * @param {Function} cb   [description]
 */
Memory.prototype.add = function(item, cb) {
	var name = item.getName();
	if(this._items[name]) {
		return cb(new Error('Item is already in storage'));
	}

	this._items[name] = {
		item: item,
		grants: []
	};

	cb(null, item);
};

Memory.prototype.remove = function(item, cb) {
	//add autorevoke
	cb(new Error('Storage method remove is not implemented'));
};

Memory.prototype.grant = function(role, child, cb) {
	var name = role.getName();
	var childName = child.getName();

	if(!this._items[name] || !this._items[childName]) {
		return cb(new Error('Role is not exist'));
	}

	var data = this._items[name];
	for(var i=0; i<data.grants.length; i++) {
		var grant = data.grants[i];
		if(grant.getName() === childName) {
			return cb(new Error('Item is already granted'));
		}
	}

	data.grant.push(child);
	cb(null, true);
};

Memory.prototype.revoke = function(role, child, cb) {
	var name = role.getName();
	var childName = child.getName();

	if(!this._items[name] || !this._items[childName]) {
		return cb(new Error('Role is not exist'));
	}

	var data = this._items[name];
	for(var i=0; i<data.grants.length; i++) {
		var grant = data.grants[i];
		if(grant.getName() === childName) {
			//TODO remove from this position
			return cb(null, true);
		}
	}


	cb(new Error('Item is not associated to this item'));
};

Memory.prototype.get = function(name, cb) {
	if(!this._items[name]) {
		return cb(null, null);
	}

	return cb(null, this._items[name].item);
};

Memory.prototype.getGrants = function(role, cb) {
	if(!this._items[name]) {
		return cb(null, null);
	}

	return cb(null, this._items[name].grants);
};

module.exports = Memory;