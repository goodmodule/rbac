# RBAC 
## (Hierarchical Role Based Access Control)

[![Quality](https://codeclimate.com/github/seeden/rbac.png)](https://codeclimate.com/github/seeden/rbac/badges)
[![Dependencies](https://david-dm.org/seeden/rbac.png)](https://david-dm.org/seeden/rbac)

RBAC is the authorization library for NodeJs. 


## Motivation

I needed hierarchical role based access control for my projects based on ExpressJS. 
I had one requirement. This structure must be permanently stored in various storages. 
For example in memory, file, Redis and Mongoose. 
Because there is a lot of options for storing of data and many of them are asynchronous. 
I created asynchronous API. 
Please, if you found any bug or you need custom API, create an issue or pull request.


## Install

    $ npm install rbac


## Usage

    var RBAC = require('rbac');

    var rbac = new RBAC();

    var roles = ['superadmin', 'admin', 'user', 'guest'];
    var permissions = [
        ['create', 'article'], 
        ['delete', 'user']
    ];

    rbac.create(roles, permissions, function(err, response) {
        if(err) throw err; //process error

        //get admin role
        var admin = response.roles.admin;

        //get delete user permission
        var deleteUser = response.permissions.delete_user;

        //assign delete user permission to the admin
        admin.grant(deleteUser, function(err, granted) {
            if(err) throw err; //process error
            
            if(granted) {
                console.log('Admin can delete user');    
            }
        }); 
    });

## Check permissions

    rbac.can('admin', 'create', 'article', function(err, can) {
        if(err) throw err; //process error
            
        if(can) {
            console.log('Admin is able create article');    
        }
    });

    //or you can use instance of admin role

    rbac.getRole('admin', function(err, admin) {
        if(err) throw err; //process error

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


    
## Credits

  - [Zlatko Fedor](http://github.com/seeden)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014 Zlatko Fedor [http://www.cherrysro.com/](http://www.cherrysro.com/)