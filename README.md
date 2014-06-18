# RBAC 
(Hierarchical Role Based Access Control)

[![Quality](https://codeclimate.com/github/seeden/rbac.png)](https://codeclimate.com/github/seeden/rbac/badges)
[![Dependencies](https://david-dm.org/seeden/rbac.png)](https://david-dm.org/seeden/rbac)
[![Gitter chat](https://badges.gitter.im/seeden/rbac.png)](https://gitter.im/seeden/rbac)

RBAC is the authorization library for NodeJS. 


## Motivation

I needed hierarchical role based access control for my projects based on ExpressJS. 
I had one requirement. This structure must be permanently stored in various storages. 
For example in memory, file, Redis and Mongoose. 
Because there is a lot of options for storing of data and many of them are asynchronous. 
I created asynchronous API. 
Please, if you found any bug or you need custom API, create an issue or pull request.

## Documentation

[Link to Documentation](http://htmlpreview.github.io/?https://github.com/seeden/rbac/blob/master/documentation/index.html)


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


## Running Tests

To run the tests, install the dev dependencies and run:
    
    npm test

    
## Credits

  - [Zlatko Fedor](http://github.com/seeden)

## License

The MIT License (MIT)

Copyright (c) 2014 Zlatko Fedor zlatkofedor@cherrysro.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.