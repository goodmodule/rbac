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
		superAdmin.allow(admin);
		admin.allow(user);
		user.allow(guest);

		//assign permissions
		admin.allow(deleteUser);
		user.allow(createUser);

		expect(admin.isAllowed('create', 'user')).toEqual(true);
		expect(user.isAllowed('delete', 'user')).toEqual(false);
	});
});