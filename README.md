# RBAC 
(Hierarchical Role Based Access Control)

[![Quality](https://codeclimate.com/github/seeden/rbac.png)](https://codeclimate.com/github/seeden/rbac/badges)
[![Dependencies](https://david-dm.org/seeden/rbac.png)](https://david-dm.org/seeden/rbac)

RBAC is the authorization library for NodeJS. 


## Motivation

I needed hierarchical role based access control for my projects based on ExpressJS. 
I had one requirement. This structure must be permanently stored in various storages. 
For example in memory, file, Redis and Mongoose. 
Because there is a lot of options for storing of data and many of them are asynchronous. 
I created asynchronous API. 
Please, if you found any bug or you need custom API, create an issue or pull request.

## 

[Documentation](https://rawgithub.com/user/seeden/rbac/documentation/index.html)


## Install

    $ npm install rbac


## Usage

    var RBAC = require('rbac');

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


## Check permissions

    rbac.can('admin', 'create', 'article', function(err, can) {
        if(err) {
            throw err; //process error
        }
            
        if(can) {
            console.log('Admin is able create article');    
        }
    });

    //or you can use instance of admin role

    rbac.getRole('admin', function(err, admin) {
        if(err) {
            throw err; //process error
        }

        if(!admin) {
            return console.log('Role does not exists');
        }

        admin.can('create', 'article', function(err, can) {
            if(err) throw err; //process error
            
            if(can) {
                console.log('Admin is able create article');    
            }
        }); 
    });

## Api 

### Create RBAC

#### `RBAC(storage)`

Constructor of RBAC

* `storage` Instance of storage (default memory)


### Create Role

#### `createRole(role, cb) `

Create a new role assigned to actual instance of RBAC

* `role` Name of new Role
* `cb` Callback function(error, role)

#### `createRoles(roles, cb) `

Create multiple roles in one step

* `roles` Names of new roles
* `cb` Callback function(error, role)


### Create Permission

#### `createPermission(action, resource, cb) `

Create a new permission assigned to actual instance of RBAC

* `action` Name of action
* `resource` Name of resource
* `cb` Callback function(error, permission)

#### `createPermissions(permissions, cb) `

Create multiple permissions in one step

* `permissions` Array of permissions [['create', 'article'], ['delete', 'user']]
* `cb` Callback function(error, permissions)



## Running Tests

To run the tests, install the dev dependencies and run:
    
    npm test


    
## Credits

  - [Zlatko Fedor](http://github.com/seeden)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014 Zlatko Fedor [http://www.cherrysro.com/](http://www.cherrysro.com/)