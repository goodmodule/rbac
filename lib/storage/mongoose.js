'use strict';

var util = require("util");
var _ = require('underscore');
var Storage = require("./index");
var Permission = require('./../permission');
var Role = require('./../role');
var keymirror = require('keymirror');

var Type = keymirror({
	PERMISSION: null,
	ROLE: null
});

function createSchema (Schema) {
	//add properties to schema
	var schema = new Schema({
		name    : { type: String, required: true, unique: true },
		type    : { type: String, enum: _.values(Type), required: true },
		grants  : [String]
	});

	return schema;
}

function getType(item) {
	if (item instanceof  Role) {
		return Type.ROLE;
	}

	if (item instanceof Permission) {
		return Type.PERMISSION;
	}

	return null;
}

function convertToInstance(rbac, record) {
	if(!record) {
		return null;
	}

	if(record.type === Type.ROLE) {
		return new Role(rbac, record.name);
	}

	if(record.type === Type.PERMISSION) {
		var decoded = Permission.decodeName(record.name);
		if(!decoded) {
			return null;
		}

		return new Permission(rbac, decoded.action, decoded.resource);
	}

	return null;
}

var MongooseStorage = module.exports =  function(options) {
	options = options || {};

	var connection = options.connection;

	if(!connection) {
		throw new Error('Parameter connection is undefined use your current mongoose connection.');
	}

	var modelName = options.modelName || 'rbac';
	var Schema = options.Schema || connection.Schema;

	Storage.call(this);

	this.model = connection.model(modelName, createSchema(Schema));
};

util.inherits(MongooseStorage, Storage);

MongooseStorage.prototype.add = function(item, cb) {
	var data = {
		name: item.getName(),
		type: getType(item)
	};

	this.model.create(data, function(err, obj) {
		if(err) {
			return cb(err);
		}

		if(!obj) {
			return cb(new Error('Item is undefined'));
		}

		cb(null, item);
	});

	return this;
};

MongooseStorage.prototype.remove = function(item, cb) {
	var _this = this
	var name = item.getName();

	//remove from grants 
	this.model.update({ 
		grants: name 
	}, { 
		$pull: { 
			grants: name 
		} 
	}, { multi: true }, function(err) {
		if(err) {
			return cb(err);
		}

		//remove item
		_this.model.remove({ name: name }, function(err) {
			if(err) {
				return cb(err);
			}

			cb(null, true);
		});
	});

	return this;
};

MongooseStorage.prototype.grant = function(role, child, cb) {
	var name = role.getName();
	var childName = child.getName();

	if(!role instanceof Role) {
		return cb(new Error('Role is not instance of Role'));	
	}	

	if(name === childName) {
		return cb(new Error('You can grant yourself'));	
	}

	this.model.update({ name: name, type: Type.ROLE }, { $addToSet: { grants: childName } }, function(err) {
		if(err) {
			return cb(err);
		}

		cb(null, true);
	});

	return this;
};

MongooseStorage.prototype.revoke = function(role, child, cb) {
	var name = role.getName();
	var childName = child.getName();

	this.model.update({ name: name, type: Type.ROLE }, { $pull: { grants: childName } }, function(err, num) {
		if(err) {
			return cb(err);
		}

		if(num === 0) {
			return cb(new Error('Item is not associated to this item'));
		}

		return cb(null, true);
	});

	return this;
};

MongooseStorage.prototype.get = function(name, cb) {
	var rbac = this.getRBAC();

	this.model.findOne({ name: name }, function(err, record) {
		if(err) {
			return cb(err);
		}

		if(!record) {
			return cb(null, null);
		}

		cb(null, convertToInstance(rbac, record));
	});

	return this;
};

MongooseStorage.prototype.getRoles = function(cb) {
	var rbac = this.getRBAC();

	this.model.find({ type: Type.ROLE }, function(err, records) {
		if(err) {
			return cb(err);
		}

		var items = [];

		for(var i=0;i<records.length; i++) {
			items.push(convertToInstance(rbac, records[i]));
		}

		cb(null, items);
	});

	return this;
};

MongooseStorage.prototype.getPermissions = function(cb) {
	var rbac = this.getRBAC();

	this.model.find({ type: Type.PERMISSION }, function(err, records) {
		if(err) {
			return cb(err);
		}

		var items = [];

		for(var i=0;i<records.length; i++) {
			items.push(convertToInstance(rbac, records[i]));
		}

		cb(null, items);
	});

	return this;
};

MongooseStorage.prototype.getGrants = function(role, cb) {
	var _this = this;
	var rbac = this.getRBAC();

	this.model.findOne({ name: role, type: Type.ROLE}, function(err, record) {
		if(err) {
			return cb(err);
		}

		if(!record || !record.grants.length) {
			return cb(null, []);
		}

		_this.model.find({ name: record.grants }, function(err, records) {
			var grants = [];

			if(err) {
				return cb(err);
			}

			for(var i=0;i<records.length; i++) {
				grants.push(convertToInstance(rbac, records[i]));
			}

			cb(null, grants);
		});
	});

	return this;
};