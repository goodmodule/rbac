'use strict';

var WebError = require('web-error');

/**
 * Return middleware function for permission check
 * @param  {RBAC}    rbac              Instance of RBAC
 * @param  {String}  action            Name of action
 * @param  {String}  resource          Name of resource
 * @param  {String}  redirect          Url where is user redirected when he has no permissions
 * @param  {Number}  redirectStatus    Status code of redirect action
 * @return {Function}                  Middleware function
 */
exports.can = function(rbac, action, resource, redirect, redirectStatus) {
  redirectStatus = redirectStatus || 302;

  return function(req, res, next) {
    if(!req.user) {
      return next(new WebError(401));
    }

    req.user.can(rbac, action, resource, function(err, can) {
      if(err) {
        return next(err);
      }

      if(!can) {
        if(redirect) {
          return res.redirect(redirectStatus, redirect);
        }

        return next(new WebError(401));
      }

      next();
    });
  };
};

/**
 * Return middleware function for permission check
 * @param  {RBAC}  rbac                Instance of RBAC
 * @param  {String}  name              Name of role
 * @param  {String}  redirect          Url where is user redirected when he has no permissions
 * @param  {Number}  redirectStatus    Status code of redirect action
 * @return {Function}                  Middleware function
 */
exports.hasRole = function(rbac, name, redirect, redirectStatus) {
  redirectStatus = redirectStatus || 302;

  return function(req, res, next) {
    if(!req.user) {
      return next(new WebError(401));
    }

    req.user.hasRole(rbac, name, function(err, has) {
      if(err) {
        return next(err);
      }

      if(!has) {
        if(redirect) {
          return res.redirect(redirectStatus, redirect);
        }

        return next(new WebError(401));
      }

      next();
    });
  };
};
