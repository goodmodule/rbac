import RBAC, { Storage } from '../src/index';
import should from 'should';
import mongoose from 'mongoose';

describe('RBAC mongoose', function() {
	var rbac = null
	var response = null;

	var permissions = [
		['create', 'article'], 
		['delete', 'user'],
		['update', 'article']
	];

	var roles = ['superadmin', 'admin', 'user', 'guest'];

	var grants = {
				admin: ['user', 'delete_user'],
				user: ['create_article', 'update_article']
			};

	var permissionsAsObject = {
		article: ['create', 'update'],
		user: ['delete']
	};


	it('decode permission', function() {
		var decoded = RBAC.Permission.decodeName('create_article');

		should(decoded).not.equal(undefined);

		decoded.action.should.equal('create');
		decoded.resource.should.equal('article');
	});

	it('should be able to create roles and permissions', function(done) {
		var storage = new Storage.Mongoose({
			connection: mongoose.connect('mongodb://localhost/rbac')
		});

		rbac = new RBAC({
			storage: storage
		});
		rbac.create(roles, permissionsAsObject, function(err, data) {
			if(err) throw err;

			response = data;

			should(response).not.equal(undefined);
			response.should.have.properties(['roles', 'permissions']);

			for(var i=0; i<roles.length; i++) {
				var name = roles[i];
				should(response.roles[name]).not.equal(undefined);	

				var instance = response.roles[name];
				should(instance.name).equal(name);	
			}
			
			for(var i=0; i<permissions.length; i++) {
				var permission = permissions[i];
				var name = RBAC.Permission.createName(permission[0], permission[1]);
				should(response.permissions[name]).not.equal(undefined);

				//check name
				var instance = response.permissions[name];
				should(instance.name).equal(name);		
			}

			done();
		});
	});

	it('grant permissions for admin', function(done) {
		var admin = response.roles.admin;
		var deleteUser = response.permissions.delete_user;

		admin.grant(deleteUser, function(err, granted) {
			if(err) throw err;

			granted.should.equal(true);
			done();
		});	

	});

	it('grant permissions for user', function(done) {
		var user = response.roles.user;
		var createArticle = response.permissions.create_article;

		user.grant(createArticle, function(err, granted) {
			if(err) throw err;

			granted.should.equal(true);
			done();
		});	
	});	

	it('grant role for admin', function(done) {
		var admin = response.roles.admin;
		var user = response.roles.user;

		admin.grant(user, function(err, granted) {
			if(err) throw err;
			granted.should.equal(true);
			done();			
		});	
	});	

	it('admin can create article', function(done) {
		var admin = response.roles.admin;

		admin.can('create', 'article', function(err, can) {
			if(err) throw err;
			can.should.equal(true);
			done();		
		});	
	});	
	
	it('admin can delete user', function(done) {
		var admin = response.roles.admin;

		admin.can('delete', 'user', function(err, can) {
			if(err) throw err;
			can.should.equal(true);
			done();	
		});	
	});	
	
	it('user can not delete user', function(done) {
		var user = response.roles.user;

		user.can('delete', 'user', function(err, can) {
			if(err) throw err;
			can.should.equal(false);
			done();	
		});	
	});	

	it('user can create article', function(done) {
		var user = response.roles.user;

		user.can('create', 'article', function(err, can) {
			if(err) throw err;
			can.should.equal(true);
			done();	
		});	
	});	

	it('user can any create article', function(done) {
		var user = response.roles.user;

		user.canAny(permissions, function(err, can) {
			if(err) throw err;
			can.should.equal(true);
			done();	
		});	
	});	

	it('user can all create article', function(done) {
		var user = response.roles.user;

		user.canAll(permissions, function(err, can) {
			if(err) throw err;
			can.should.equal(false);
			done();	
		});	
	});	

	it('admin can all create article', function(done) {
		var admin = response.roles.admin;

		rbac.grants(grants, function(err, result) {
			if(err) throw err;

			admin.canAll(permissions, function(err, can) {
				if(err) throw err;
				can.should.equal(true);
				done();	
			});	
		});
	});

	it('should be able to get role', function(done) {
		rbac.getRole('admin', function(err, admin) {
			if(err) throw err;
			admin.should.equal(response.roles.admin);
			done();	
		});	
	});	

	it('should not be able to get permission through getRole', function(done) {
		rbac.getRole('create_article', function(err, permission) {
			if(err) throw err;
			should(permission).equal(null);
			done();	
		});	
	});	

	it('should be able to get permission', function(done) {
		rbac.getPermission('create', 'article', function(err, permission) {
			if(err) throw err;
			permission.should.equal(response.permissions.create_article);
			done();	
		});	
	});	

	it('should not be able to get role through getPermission', function(done) {
		rbac.getPermission('admin', '',function(err, admin) {
			if(err) throw err;
			should(admin).equal(null);
			done();	
		});	
	});			

	it('should able to revoke permission', function(done) {
		var user = response.roles.user;
		rbac.revokeByName('user', 'create_article', function(err, revoked) {
			if(err) throw err;
			revoked.should.equal(true);
			done();	
		});
	});	

	it('user can not create article because it is revoked', function(done) {
		var user = response.roles.user;

		user.can('create', 'article', function(err, can) {
			if(err) throw err;
			can.should.equal(false);
			done();	
		});	
	});		

	it('should able to grant permission again', function(done) {
		var user = response.roles.user;
		rbac.grantByName('user', 'create_article', function(err, granted) {
			if(err) throw err;
			granted.should.equal(true);
			done();	
		});
	});	

	it('user can create article because it is granted again', function(done) {
		var user = response.roles.user;

		user.can('create', 'article', function(err, can) {
			if(err) throw err;
			can.should.equal(true);
			done();	
		});	
	});	

	it('should be able to get role', function(done) {
		rbac.get('user', function(err, user) {
			if(err) throw err;
			user.should.equal(response.roles.user);
			done();	
		});	
	});	

	it('should be able to get permission', function(done) {
		rbac.get('create_article', function(err, permission) {
			if(err) throw err;
			permission.should.equal(response.permissions.create_article);
			done();	
		});	
	});	

	it('should be able to remove permission', function(done) {
		rbac.remove(response.permissions.create_article, function(err, removed) {
			if(err) throw err;
			removed.should.equal(true);
			done();	
		});	
	});

	it('should not be able to get removed permission', function(done) {
		rbac.get('create_article', function(err, permission) {
			if(err) throw err;
			should(permission).equal(null);
			done();	
		});	
	});	

	it('should be able to remove role', function(done) {
		rbac.remove(response.roles.guest, function(err, removed) {
			if(err) throw err;
			removed.should.equal(true);
			done();	
		});	
	});

	it('should not be able to get removed role', function(done) {
		rbac.get('guest', function(err, role) {
			if(err) throw err;
			should(role).equal(null);
			done();	
		});	
	});	

	it('should be able to remove permission by name', function(done) {
		rbac.removeByName('delete_user', function(err, removed) {
			if(err) throw err;
			removed.should.equal(true);
			done();	
		});	
	});

	it('should not be able to get removed permission', function(done) {
		rbac.get('delete_user', function(err, permission) {
			if(err) throw err;
			should(permission).equal(null);
			done();	
		});	
	});	

	it('should able to check existance of role', function(done) {
		rbac.exists('admin', function(err, exists) {
			if(err) throw err;
			exists.should.equal(true);
			done();	
		});	
	});

	it('should able to check existance of non exist role', function(done) {
		rbac.exists('adminooooo', function(err, exists) {
			if(err) throw err;
			exists.should.equal(false);
			done();	
		});	
	});

	it('should able to check existance of role', function(done) {
		rbac.existsRole('admin', function(err, exists) {
			if(err) throw err;
			exists.should.equal(true);
			done();	
		});	
	});	


	it('should able to check existance of permission', function(done) {
		rbac.existsPermission('update', 'article', function(err, exists) {
			if(err) throw err;
			exists.should.equal(true);
			done();	
		});	
	});	

	it('should be able to create roles and permissions with constructor', function(done) {
		var localrbac = new RBAC({
			roles: roles,
			permissions : permissionsAsObject,
			grants: grants
		}, function(err, rbacInstance) {
			if(err) throw err;
			rbac = rbacInstance;
			done();
		});
	});			
});