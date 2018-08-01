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
      expect(data).toBeDefined(undefined);

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
      expect(permission).toBe(undefined);
    });

    it('should be able to get permission', async () => {
      const permission = await rbac.getPermission('create', 'article');
      expect(permission.name).toBe('create_article');
    });

    it('should not be able to get role through getPermission', async () => {
      const admin = await rbac.getPermission('admin', '');
      expect(admin).toBe(undefined);
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

    it('should not be able to get removed permission', (done) => {
      rbac.get('create_article', (err, permission) => {
        if (err) throw err;
        should(permission).equal(null);
        done();
      });
    });

    it('should be able to remove role', (done) => {
      rbac.remove(response.roles.guest, (err, removed) => {
        if (err) throw err;
        removed.should.equal(true);
        done();
      });
    });

    it('should not be able to get removed role', (done) => {
      rbac.get('guest', (err, role) => {
        if (err) throw err;
        should(role).equal(null);
        done();
      });
    });

    it('should be able to remove permission by name', (done) => {
      rbac.removeByName('delete_user', (err, removed) => {
        if (err) throw err;
        removed.should.equal(true);
        done();
      });
    });

    it('should not be able to get removed permission', (done) => {
      rbac.get('delete_user', (err, permission) => {
        if (err) throw err;
        should(permission).equal(null);
        done();
      });
    });

    it('should able to check existance of role', (done) => {
      rbac.exists('admin', (err, exists) => {
        if (err) throw err;
        exists.should.equal(true);
        done();
      });
    });

    it('should able to check existance of non exist role', (done) => {
      rbac.exists('adminooooo', (err, exists) => {
        if (err) throw err;
        exists.should.equal(false);
        done();
      });
    });

    it('should able to check existance of role', (done) => {
      rbac.existsRole('admin', (err, exists) => {
        if (err) throw err;
        exists.should.equal(true);
        done();
      });
    });

    it('should able to check existance of permission', (done) => {
      rbac.existsPermission('update', 'article', (err, exists) => {
        if (err) throw err;
        exists.should.equal(true);
        done();
      });
    });

    it('should be able to create roles and permissions with constructor', (done) => {
      const localrbac = new RBAC({
        roles,
        permissions : permissionsAsObject,
        grants,
      }, (err, rbacInstance) => {
        if (err) throw err;
        rbac = rbacInstance;
        done();
      });
    });

    it('should be able to get scope for admin', (done) => {
      rbac.getScope('admin', (err, scope) => {
        if (err) throw err;
        scope.should.containDeep(['delete_user', 'create_article', 'update_article']);
        done();
      });
    });

    it('should be able to get scope for user', (done) => {
      rbac.getScope('user', (err, scope) => {
        if (err) throw err;
        scope.should.containDeep(['create_article', 'update_article']);
        done();
      });
    });

    it('should be able to get scope for more complex object', (done) => {
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
          admin: ['user', 'delete_user', 'update_rbac', 'create_article'],
          superadmin: ['admin'],
        },
      }, (err, instance) => {
        if (err) throw err;

        instance.getScope('admin', (err, scope) => {
          if (err) throw err;
          scope.should.containDeep(['delete_user', 'update_rbac', 'create_article', 'change_password']);
          done();
        });
      });
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
