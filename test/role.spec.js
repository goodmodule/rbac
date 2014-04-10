//node ./node_modules/jasmine-node/lib/jasmine-node/cli.js ./test
var RBAC = require('./../lib/rbac');


//The tests
describe('RBAC', function() {
	var rbac = new RBAC();


	it('role hierarchy', function() {
		var superAdmin = rbac.createRole('superadmin');
		var admin = rbac.createRole('admin');
		var user = rbac.createRole('user');
		var guest = rbac.createRole('guest');

		var createUser = rbac.createPermission('create', 'user');
		var deleteUser = rbac.createPermission('delete', 'user');

		//assign roles
		superAdmin.grant(admin);
		admin.grant(user);
		user.grant(guest);

		//assign permissions
		admin.grant(deleteUser);
		user.grant(createUser);

		expect(admin.can('create', 'user')).toEqual(true);
		expect(user.can('delete', 'user')).toEqual(false);
	});
});