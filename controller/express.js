'use strict';

exports.isAllowed = function(rbac, action, resource) {
	var permission = rbac.getPermission(action, resource);
	if(!permission) throw new Error('Permission is undefined');

	return function(req, res, next) {
		if(req.isAllowed && req.isAllowed(permission)) {
			next();
		}

		return next(new Error('You have no permission for this action'));
	};
};

exports.hasRole = function(rbac, name) {
	var role = rbac.getRole(name);
	if(!role) throw new Error('Role is undefined');

	return function(req, res, next) {
		if(req.hasRole && req.hasRole(role)) {
			next();
		}

		return next(new Error('You have no permission for this action'));
	};
};