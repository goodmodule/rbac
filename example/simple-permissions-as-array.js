var RBAC = require('./../lib/rbac');

var rbac = new RBAC();

var roles = ['superadmin', 'admin', 'user', 'guest'];

var permissions = [
	['create', 'user'],
	['delete', 'user'],

	['change', 'password'],
	['forgot', 'password'],

	['create', 'article'],

	['update', 'rbac']
];

var grants = {
	guest: ['create_user', 'forgot_password'],
	user: ['change_password'],
	admin: ['user', 'delete_user', 'update_rbac'],
	superadmin: ['admin']
};

rbac.create(roles, permissions, grants, function(err, data) {
	if(err) {
		throw err;
	}
});  