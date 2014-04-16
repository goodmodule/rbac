//node ./node_modules/jasmine-node/lib/jasmine-node/cli.js ./test
var RBAC = require('./../lib/rbac');

//The tests
describe('RBAC', function() {
	var rbac = new RBAC();
	var response = null;

	var roles = ['superadmin', 'admin', 'user', 'guest'];
	var permissions = [
		['create', 'article'], 
		['delete', 'user']
	];	

	it('create roles and permissions', function() {
		var created = false;

		runs(function() {
			rbac.create(roles, permissions, function(err, data) {
				if(err) throw err;
				response = data;
				created = true;
			});
		});

		waitsFor(function() {
			return created;
		}, 'The permissions and role should be created', 1000);


		runs(function() {
			//check structure
			expect(response).toBeDefined();

			expect(response.roles).toBeDefined();
			expect(response.permissions).toBeDefined();

			for(var i=0; i<roles.length; i++) {
				var name = roles[i];
				expect(response.roles[name]).toBeDefined();	

				var instance = response.roles[name];
				expect(instance.getName()).toBe(name);	
			}
			
			for(var i=0; i<permissions.length; i++) {
				var permission = permissions[i];
				var name = RBAC.Permission.createName(permission[0], permission[1]);
				expect(response.permissions[name]).toBeDefined();

				//check name
				var instance = response.permissions[name];
				expect(instance.getName()).toBe(name);		
			}
		});
	});

	it('grant permissions for admin', function() {
		var admin = response.roles.admin;
		var deleteUser = response.permissions.delete_user;

		var grant = false;

		runs(function(){
			admin.grant(deleteUser, function(err, granted) {
				if(err) throw err;
				grant = granted;
			});	
		});

		waitsFor(function() {
			return grant;
		}, 'The permissions should be granted for admin', 1000);		
		
		runs(function(){
			expect(grant).toBe(true);	
		});
	});

	it('grant permissions for user', function() {
		var user = response.roles.user;
		var createArticle = response.permissions.create_article;

		var grant = false;

		runs(function(){
			user.grant(createArticle, function(err, granted) {
				if(err) throw err;
				grant = granted;
			});	
		});

		waitsFor(function() {
			return grant;
		}, 'The permissions should be granted for user', 1000);		
		
		runs(function(){
			expect(grant).toBe(true);	
		});
	});	

	it('grant role for admin', function() {
		var admin = response.roles.admin;
		var user = response.roles.user;

		var grant = false;

		runs(function(){
			admin.grant(user, function(err, granted) {
				if(err) throw err;
				grant = granted;
			});	
		});

		waitsFor(function() {
			return grant;
		}, 'The role should be granted for admin', 1000);		
		
		runs(function(){
			expect(grant).toBe(true);	
		});



/*
		expect(admin.can('create', 'user')).toEqual(true);
		expect(user.can('delete', 'user')).toEqual(false);*/
	});	


	it('admin can create article', function() {
		var admin = response.roles.admin;
		var user = response.roles.user;

		var granted = false;

		runs(function(){
			admin.can('create', 'article', function(err, can) {
				console.log(123, can);
				if(err) throw err;
				granted = can;
			});	
		});

		waitsFor(function() {
			return granted;
		}, 'The admin should be able create article', 1000);		
		
		runs(function(){
			expect(granted).toBe(true);	
		});
	});			
});