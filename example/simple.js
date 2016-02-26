var RBAC = require('./../src/RBAC');

var rbac = new RBAC();

var roles = ['superadmin', 'admin', 'user', 'guest'];

var permissions = {
	user: ['create', 'delete'],
	password: ['change', 'forgot'],
	article: ['create'],
	rbac: ['update']
};

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
