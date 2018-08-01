import { RBAC, Permission, Memory/*, Mongoose, Dynamoose, MySql */ } from '../src/index';
import should from 'should';
// import mongoose from 'mongoose';
// import dynamoose from 'dynamoose';

function testRBAC(storage, storageType) {
  describe(`RBAC ${storageType}`, () => {
    let rbac;
    let response;

    const permissions = [
      ['create', 'article'],
      ['delete', 'user'],
      ['update', 'article'],
    ];

    const roles = ['superadmin', 'admin', 'user', 'guest'];

    const grants = {
      admin: ['user', 'delete_user'],
      user: ['create_article', 'update_article'],
    };

    const permissionsAsObject = {
      article: ['create', 'update'],
      user: ['delete'],
    };

    it('decode permission', () => {
      const decoded = Permission.decodeName('create_article', '_');

      expect(decoded).toBeDefined();

      expect(decoded.action).toBe('create');
      expect(decoded.resource).toBe('article');
    });

    it('should be able to create roles and permissions', async () => {
      rbac = new RBAC({ storage });
      const data = await rbac.create(roles, permissionsAsObject);
      expect(data).toBeDefined();

      response = data;
      response.should.have.properties(['roles', 'permissions']);

      for (let i = 0; i < roles.length; i += 1) {
        const name = roles[i];
        expect(response.roles[name]).toBeDefined();

        const instance = response.roles[name];
        expect(instance.name).toBe(name);
      }

      for (let i = 0; i < permissions.length; i += 1) {
        const permission = permissions[i];
        const name = Permission.createName(permission[0], permission[1], '_');
        expect(response.permissions[name]).toBeDefined();

        // check name
        const instance = response.permissions[name];
        expect(instance.name).toBe(name);
      }
    });

    it('grant permissions for admin', async () => {
      const { admin } = response.roles;
      const deleteUser = response.permissions.delete_user;

      const granted = await admin.grant(deleteUser);
      expect(granted).toBe(true);
    });

    it('grant permissions for user', async () => {
      const { user } = response.roles;
      const createArticle = response.permissions.create_article;
      await user.grant(createArticle);
    });

    it('grant role for admin', async () => {
      const { admin, user } = response.roles;

      await admin.grant(user);
    });

    it('admin can create article', async () => {
      const { admin } = response.roles;

      const can = await admin.can('create', 'article');
      expect(can).toBe(true);
    });

    it('admin can delete user', async () => {
      const { admin } = response.roles;

      const can = await admin.can('delete', 'user');
      expect(can).toBe(true);
    });

    it('user can not delete user', async () => {
      const { user } = response.roles;

      const can = await user.can('delete', 'user');
      expect(can).toBe(false);
    });

    it('user can create article', async () => {
      const { user } = response.roles;

      const can = await user.can('create', 'article');
      expect(can).toBe(true);
    });

    it('user can any create article', async () => {
      const { user } = response.roles;

      const can = await user.canAny(permissions);
      expect(can).toBe(true);
    });

    it('user can all create article', async () => {
      const { user } = response.roles;

      const can = await user.canAll(permissions);
      expect(can).toBe(false);
    });

    it('admin can all create article', async () => {
      const { admin } = response.roles;

      await rbac.grants(grants);
      const can = await admin.canAll(permissions);
      expect(can).toBe(true);
    });

    it('should be able to get role', async () => {
      const admin = await rbac.getRole('admin');
      expect(admin.name).toBe('admin');
    });

    it('should not be able to get permission through getRole', async () => {
      const permission = await rbac.getRole('create_article');
      expect(permission).toBeUndefined();
    });

    it('should be able to get permission', async () => {
      const permission = await rbac.getPermission('create', 'article');
      expect(permission.name).toBe('create_article');
    });

    it('should not be able to get role through getPermission', async () => {
      await expect(rbac.getPermission('admin', '')).rejects.toEqual(new Error('Resource is not defined'));
    });

    it('should able to revoke permission', async () => {
      const revoked = await rbac.revokeByName('user', 'create_article');
      expect(revoked).toBe(true);
    });

    it('user can not create article because it is revoked', async () => {
      const { user } = response.roles;

      const can = await user.can('create', 'article');
      expect(can).toBe(false);
    });

    it('should able to grant permission again', async () => {
      const granted = await rbac.grantByName('user', 'create_article');
      expect(granted).toBe(true);
    });

    it('user can create article because it is granted again', async () => {
      const { user } = response.roles;

      const can = await user.can('create', 'article');
      expect(can).toBe(true);
    });

    it('should be able to get role', async () => {
      const user = await rbac.get('user');
      expect(user.name).toBe('user');
    });

    it('should be able to get permission', async () => {
      const permission = await rbac.get('create_article');
      expect(permission.name).toBe('create_article');
    });

    it('should be able to remove permission', async () => {
      const removed = await rbac.remove(response.permissions.create_article);
      expect(removed).toBe(true);
    });

    it('should not be able to get removed permission', async () => {
      const permission = await rbac.get('create_article');
      expect(permission).toBeUndefined();
    });

    it('should be able to remove role', async () => {
      const removed = await rbac.remove(response.roles.guest);
      expect(removed).toBe(true);
    });

    it('should not be able to get removed role', async () => {
      const role = await rbac.get('guest');
      expect(role).toBeUndefined();
    });

    it('should be able to remove permission by name', async () => {
      const removed = await rbac.removeByName('delete_user');
      expect(removed).toBe(true);
    });

    it('should not be able to get removed permission', async () => {
      const permission = await rbac.get('delete_user');
      expect(permission).toBeUndefined();
    });

    it('should able to check existance of role', async () => {
      const exists = await rbac.exists('admin');
      expect(exists).toBe(true);
    });

    it('should able to check existance of non exist role', async () => {
      const exists = await rbac.exists('adminooooo');
      expect(exists).toBe(false);
    });

    it('should able to check existance of role', async () => {
      const exists = await rbac.existsRole('admin');
      expect(exists).toBe(true);
    });

    it('should able to check existance of permission', async () => {
      const exists = await rbac.existsPermission('update', 'article');
      expect(exists).toBe(true);
    });

    it('should be able to create roles and permissions with constructor', async () => {
      const localrbac = new RBAC({
        roles,
        permissions: permissionsAsObject,
        grants,
      });

      await localrbac.init();

      rbac = localrbac;

      expect(localrbac).toBeDefined();
    });

    it('should be able to get scope for admin', async () => {
      const scope = await rbac.getScope('admin');
      scope.should.containDeep(['delete_user', 'create_article', 'update_article']);
    });

    it('should be able to get scope for user', async () => {
      const scope = await rbac.getScope('user');
      scope.should.containDeep(['create_article', 'update_article']);
    });

    it('should be able to get scope for more complex object', async () => {
      const localRBAC = new RBAC({
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
          admin: ['user', 'delete_user', 'update_rbac', 'create_article'],
          superadmin: ['admin'],
        },
      });

      await localRBAC.init();

      const scope = await localRBAC.getScope('admin');
      scope.should.containDeep(['delete_user', 'update_rbac', 'create_article', 'change_password']);
    });
  });
}

testRBAC(new Memory(), 'Memory');
/*
const mongooseStorage = new Mongoose({
  connection: mongoose.connect('mongodb://localhost/rbac'),
});

testRBAC(mongooseStorage, 'Mongoose');


const mysqlStorage = new MySql({
  username: 'root',
  password: ''
});

testRBAC(mysqlStorage, 'MySql');
*/
// dynamoose.AWS.config.update({
//   accessKeyId: 'AKID',
//   secretAccessKey: 'SECRET',
//   region: 'us-west-2',
// });
//
// dynamoose.local();
//
// const dynamooseStorage = new Dynamoose({
//   connection: dynamoose,
// });
//
// testRBAC(dynamooseStorage, 'Dynamoose');
