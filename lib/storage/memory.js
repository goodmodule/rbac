'use strict';

var util = require("util"),
	Storage = require("./index"),
	Permission = require('./../permission'),
	Role = require('./../role');

function Memory() {
	this._items = {};

	Storage.call(this);
}

util.inherits(Memory, Storage);

Memory.prototype.add = function(item, cb) {
	var name = item.getName();
	if(this._items[name]) {
		return cb(new Error('Item is already in storage'));
	}

	this._items[name] = {
		instance: item,
		grants: []
	};

	cb(null, item);
	return this;
};

Memory.prototype.remove = function(item, cb) {
	var name = item.getName();
	if(!this._items[name]) {
		return cb(new Error('Item is not presented in storage'));
	}

	//revoke from all instances
	for(var index in this._items) {
		var grants = this._items[index].grants;

		for(var i=0; i<grants.length; i++) {
			if(grants[i].getName()===name) {
				grants.splice(i, 1);
				break;
			}
		}
	}
	
	//delete from items
	delete this._items[name];
	
	cb(null, true);
	return this;
};

Memory.prototype.grant = function(role, child, cb) {
	var name = role.getName();
	var childName = child.getName();

	if(!this._items[name] || !this._items[childName]) {
		return cb(new Error('Role is not exist'));
	}

	if(!role instanceof Role) {
		return cb(new Error('Role is not instance of Role'));	
	}	

	if(name === childName) {
		return cb(new Error('You can grant yourself'));	
	}

	var grants = this._items[name].grants;
	for(var i=0; i<grants.length; i++) {
		var grant = grants[i];
		if(grant.getName() === childName) {
			return cb(new Error('Item is already granted'));
		}
	}

	grants.push(child);
	cb(null, true);
	return this;
};

Memory.prototype.revoke = function(role, child, cb) {
	var name = role.getName();
	var childName = child.getName();

	if(!this._items[name] || !this._items[childName]) {
		return cb(new Error('Role is not exist'));
	}

	var grants = this._items[name].grants;
	for(var i=0; i<grants.length; i++) {
		var grant = grants[i];
		if(grant.getName() === childName) {
			grants.splice(i, 1);
			return cb(null, true);
		}
	}

	cb(new Error('Item is not associated to this item'));
	return this;
};

Memory.prototype.get = function(name, cb) {
	if(!name || !this._items[name]) {
		return cb(null, null);
	}

	return cb(null, this._items[name].instance);
};

Memory.prototype.getRoles = function(cb) {
	var items = [];

	for(var name in this._items) {
		var item = this._items[name].instance;

		if(item instanceof Role) {
			items.push(item);
		}
	}

	cb(null, items);
	return this;
};

Memory.prototype.getPermissions = function(cb) {
	var items = [];

	for(var name in this._items) {
		var item = this._items[name].instance;

		if(item instanceof Permission) {
			items.push(item);
		}
	}

	cb(null, items);
	return this;
};

Memory.prototype.getGrants = function(role, cb) {
	if(!role || !this._items[role]) {
		return cb(null, null);
	}

	cb(null, this._items[role].grants);
	return this;
};

module.exports = Memory;