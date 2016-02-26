import RBAC, { Permission, Mongoose, Memory } from '../src/index';
import should from 'should';
import mongoose from 'mongoose';

function testRBAC(storage, storageType) {

  describe(`RBAC ${storageType}`, () => {
    let rbac = null
    let response = null;

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
      const decoded = Permission.decodeName('create_article');

      should(decoded).not.equal(undefined);

      decoded.action.should.equal('create');
      decoded.resource.should.equal('article');
    });

    it('should be able to create roles and permissions', (done) => {
      rbac = new RBAC({ storage });

      rbac.create(roles, permissionsAsObject, (err, data) => {
        if (err) throw err;

        response = data;

        should(response).not.equal(undefined);
        response.should.have.properties(['roles', 'permissions']);

        for(let i = 0; i < roles.length; i++) {
          const name = roles[i];
          should(response.roles[name]).not.equal(undefined);

          const instance = response.roles[name];
          should(instance.name).equal(name);
        }

        for(let i = 0; i < permissions.length; i++) {
          const permission = permissions[i];
          const name = Permission.createName(permission[0], permission[1]);
          should(response.permissions[name]).not.equal(undefined);

          // check name
          const instance = response.permissions[name];
          should(instance.name).equal(name);
        }

        done();
      });
    });

    it('grant permissions for admin', (done) => {
      const admin = response.roles.admin;
      const deleteUser = response.permissions.delete_user;

      admin.grant(deleteUser, (err, granted) => {
        if (err) throw err;

        granted.should.equal(true);
        done();
      });
    });

    it('grant permissions for user', (done) => {
      const user = response.roles.user;
      const createArticle = response.permissions.create_article;

      user.grant(createArticle, (err, granted) => {
        if (err) throw err;

        granted.should.equal(true);
        done();
      });
    });

    it('grant role for admin', (done) => {
      const admin = response.roles.admin;
      const user = response.roles.user;

      admin.grant(user, (err, granted) => {
        if (err) throw err;
        granted.should.equal(true);
        done();
      });
    });

    it('admin can create article', (done) => {
      const admin = response.roles.admin;

      admin.can('create', 'article', (err, can) => {
        if (err) throw err;
        can.should.equal(true);
        done();
      });
    });

    it('admin can delete user', (done) => {
      const admin = response.roles.admin;

      admin.can('delete', 'user', (err, can) => {
        if (err) throw err;
        can.should.equal(true);
        done();
      });
    });

    it('user can not delete user', (done) => {
      const user = response.roles.user;

      user.can('delete', 'user', (err, can) => {
        if (err) throw err;
        can.should.equal(false);
        done();
      });
    });

    it('user can create article', (done) => {
      const user = response.roles.user;

      user.can('create', 'article', (err, can) => {
        if (err) throw err;
        can.should.equal(true);
        done();
      });
    });

    it('user can any create article', (done) => {
      const user = response.roles.user;

      user.canAny(permissions, (err, can) => {
        if (err) throw err;
        can.should.equal(true);
        done();
      });
    });

    it('user can all create article', (done) => {
      const user = response.roles.user;

      user.canAll(permissions, (err, can) => {
        if (err) throw err;
        can.should.equal(false);
        done();
      });
    });

    it('admin can all create article', (done) => {
      const admin = response.roles.admin;

      rbac.grants(grants, (err, result) => {
        if (err) throw err;

        admin.canAll(permissions, (err, can) => {
          if (err) throw err;
          can.should.equal(true);
          done();
        });
      });
    });

    it('should be able to get role', (done) => {
      rbac.getRole('admin', (err, admin) => {
        if (err) throw err;
        admin.name.should.equal('admin');
        done();
      });
    });

    it('should not be able to get permission through getRole', (done) => {
      rbac.getRole('create_article', (err, permission) => {
        if (err) throw err;
        should(permission).equal(null);
        done();
      });
    });

    it('should be able to get permission', (done) => {
      rbac.getPermission('create', 'article', (err, permission) => {
        if (err) throw err;
        permission.name.should.equal('create_article');
        done();
      });
    });

    it('should not be able to get role through getPermission', (done) => {
      rbac.getPermission('admin', '', (err, admin) => {
        if (err) throw err;
        should(admin).equal(null);
        done();
      });
    });

    it('should able to revoke permission', (done) => {
      const user = response.roles.user;

      rbac.revokeByName('user', 'create_article', (err, revoked) => {
        if (err) throw err;
        revoked.should.equal(true);
        done();
      });
    });

    it('user can not create article because it is revoked', (done) => {
      const user = response.roles.user;

      user.can('create', 'article', (err, can) => {
        if (err) throw err;
        can.should.equal(false);
        done();
      });
    });

    it('should able to grant permission again', (done) => {
      const user = response.roles.user;

      rbac.grantByName('user', 'create_article', (err, granted) => {
        if (err) throw err;
        granted.should.equal(true);
        done();
      });
    });

    it('user can create article because it is granted again', (done) => {
      const user = response.roles.user;

      user.can('create', 'article', (err, can) => {
        if (err) throw err;
        can.should.equal(true);
        done();
      });
    });

    it('should be able to get role', (done) => {
      rbac.get('user', (err, user) => {
        if (err) throw err;
        user.name.should.equal('user');
        done();
      });
    });

    it('should be able to get permission', (done) => {
      rbac.get('create_article', (err, permission) => {
        if (err) throw err;
        permission.name.should.equal('create_article');
        done();
      });
    });

    it('should be able to remove permission', (done) => {
      rbac.remove(response.permissions.create_article, (err, removed) => {
        if (err) throw err;
        removed.should.equal(true);
        done();
      });
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

const mongooseStorage = new Mongoose({
  connection: mongoose.connect('mongodb://localhost/rbac'),
});
testRBAC(mongooseStorage, 'Mongoose');
