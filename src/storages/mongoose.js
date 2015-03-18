import _ from 'lodash';
import Storage from './index';
import Permission from '../permission';
import Role from '../role';
import keymirror from 'keymirror';

const Type = keymirror({
	PERMISSION: null,
	ROLE: null
});

function createSchema (Schema) {
	var schema = new Schema({
		name    : { type: String, required: true, unique: true },
		type    : { type: String, enum: _.values(Type), required: true },
		grants  : [String]
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
	if(!record) {
		throw new Error('Record is undefined');
	}

	if(record.type === Type.ROLE) {
		return rbac.createRole(record.name, false, function(){});
	} else if(record.type === Type.PERMISSION) {
		var decoded = Permission.decodeName(record.name);
		if(!decoded) {
			throw new Error('Bad permission name');
		}

		return rbac.createPermission(decoded.action, decoded.resource, false, function(){});
	}
		
	throw new Error('Type is undefined');
}

export default class MongooseStorage extends Storage {
	constructor(options) {
		super();

		options = options || {};

		var connection = options.connection;
		if(!connection) {
			throw new Error('Parameter connection is undefined use your current mongoose connection.');
		}

		options.modelName = options.modelName || 'rbac';
		options.Schema = options.Schema || connection.Schema;

		this._options = options;

		this._model = connection.model(options.modelName, createSchema(options.Schema));		
	}

	get model() {
		return this._model;
	}

	get options() {
		return this._options;
	}


	add (item, cb) {
		this.model.create({
			name: item.name,
			type: getType(item)
		}, function(err, obj) {
			if(err) {
				return cb(err);
			}

			if(!obj) {
				return cb(new Error('Item is undefined'));
			}

			cb(null, item);
		});

		return this;
	}

	remove (item, cb) {
		var name = item.name;

		this.model.update({ grants: name }, { 
			$pull: { 
				grants: name 
			} 
		}, { multi: true }, (err) => {
			if(err) {
				return cb(err);
			}

			this.model.remove({ name: name }, function(err) {
				if(err) {
					return cb(err);
				}

				cb(null, true);
			});
		});

		return this;
	};

	grant (role, child, cb) {
		var name = role.name;
		var childName = child.name;

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
	}

	revoke (role, child, cb) {
		var name = role.name;
		var childName = child.name;

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
	}

	get (name, cb) {
		var rbac = this.rbac;

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
	}

	getRoles (cb) {
		var rbac = this.rbac;

		this.model.find({ type: Type.ROLE }, function(err, records) {
			if(err) {
				return cb(err);
			}

			records = records.map(function(record) {
				return convertToInstance(rbac, record);
			});

			cb(null, records);
		});

		return this;
	}

	getPermissions (cb) {
		var rbac = this.rbac;

		this.model.find({ type: Type.PERMISSION }, function(err, records) {
			if(err) {
				return cb(err);
			}

			records = records.map(function(record) {
				return convertToInstance(rbac, record);
			});

			cb(null, records);
		});

		return this;
	}

	getGrants (role, cb) {
		var rbac = this.rbac;

		this.model.findOne({ name: role, type: Type.ROLE }, (err, record) => {
			if(err) {
				return cb(err);
			}

			if(!record || !record.grants.length) {
				return cb(null, []);
			}

			this.model.find({ name: record.grants }, function(err, records) {
				if(err) {
					return cb(err);
				}

				records = records.map(function(record) {
					return convertToInstance(rbac, record);
				});

				cb(null, records);
			});
		});

		return this;
	}
}