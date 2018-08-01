# RBAC
(Hierarchical Role Based Access Control)

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gitter chat](https://badges.gitter.im/seeden/rbac.png)](https://gitter.im/seeden/rbac)

[npm-image]: https://img.shields.io/npm/v/rbac.svg?style=flat-square
[npm-url]: https://www.npmjs.com/rbac
[travis-image]: https://img.shields.io/travis/seeden/rbac/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/seeden/rbac
[coveralls-image]: https://img.shields.io/coveralls/seeden/rbac/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/seeden/rbac?branch=master
[github-url]: https://github.com/seeden/rbac

RBAC is the authorization library for NodeJS.

:tada: We have supported DynamoDB storage now by implementation of [dynamoose](https://github.com/automategreen/dynamoose).

## Motivation

I needed hierarchical role based access control for my projects based on ExpressJS.
I had one requirement. This structure must be permanently stored in various storages.
For example in memory or Mongoose.
Because there is a lot of options for storing of data and many of them are asynchronous.
I created asynchronous API.
Please, if you found any bug or you need custom API, create an issue or pull request.

## Documentation

[Read more about API in documentation](http://seeden.github.io/rbac/RBAC.html)

# Support us

Star this project on [GitHub][github-url].

## Install

```sh
npm install rbac
```

## Usage

```js
import { RBAC } from 'rbac'; // ES5 var RBAC = require('rbac').default;
const rbac = new RBAC({
  roles: ['superadmin', 'admin', 'user', 'guest'],
  permissions: {
    user: ['create', 'delete'],
    password: ['change', 'forgot'],
    article: ['create'],
    rbac: ['update'],
  },
  grants: {
    guest: ['create_user', 'forgot_password'],
    user: ['change_password'],
    admin: ['user', 'delete_user', 'update_rbac'],
    superadmin: ['admin'],
  },
});

await rbac.init();
```

## Usage with express

```js
import express from 'express';
import { RBAC } from 'rbac';
import secure from 'rbac/controllers/express';

// your custom controller for express
function adminController(req, res, next) {
  res.send('Hello admin');
}

const app = express();
const rbac = new RBAC({
  roles: ['admin', 'user'],
});

await rbac.init();

// setup express routes
app.use('/admin', secure.hasRole(rbac, 'admin'), adminController);
```    

## Check permissions

```js
const can = await rbac.can('admin', 'create', 'article');
if (can) {
  console.log('Admin is able create article');
}

// or you can use instance of admin role
const admin = await rbac.getRole('admin');
if (!admin) {
  return console.log('Role does not exists');
}

const can = await admin.can('create', 'article');
if (can) {
  console.log('Admin is able create article');    
}
```

## Mongoose user model

Please take a look on plugin [mongoose-hrbac](http://github.com/seeden/mongoose-hrbac)

## Build documentation

```sh
npm run doc
```  

## Running Tests

```sh
npm run test
```

## Build

```sh
npm run build
```

## Credits

  - [Zlatko Fedor](http://github.com/seeden)

## License

The MIT License (MIT)

Copyright (c) 2016-2018 Zlatko Fedor zfedor@goodmodule.com
