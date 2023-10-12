RBAC
----
> (Hierarchical Role Based Access Control)

hierarchical RBAC is the authorization library.

## Motivation

`ts` library for general use RBAC conception

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

## Running Tests

```sh
npm run test
```

## Build

```sh
npm run build
```
