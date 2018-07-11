import RBAC, { Permission, Mongoose, Memory, MySql } from '../src/index';
import should from 'should';
import mongoose from 'mongoose';
import Sequelize from 'sequelize';

function testRBAC(storageType,createStorage,beforeFn = ()=>{}) {

  describe(`RBAC ${storageType}`, () => {
    let rbac = null
    let response = null;
    let storage = null;

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

    beforeAll(()=>{
        let promise = beforeFn();
        if(promise && typeof(promise.then) === 'function'){
            promise.then(()=>{
                storage = createStorage();
            })
        }else{
            storage = createStorage();
        }
    });

    it('decode permission', () => {
      const decoded = Permission.decodeName('create_article');

      should(decoded).not.equal(undefined);

      decoded.action.should.equal('create');
      decoded.resource.should.equal('article');
    });

    it('should be able to create roles and permissions',async () => {
      rbac = new RBAC({ storage });
      try{
        response = await rbac.create(roles,permissionsAsObject);
       
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
      }catch(err){
        throw err
      }
    });

    it('grant permissions for admin',async () => {
      const admin = response.roles.admin;
      const deleteUser = response.permissions.delete_user;
      try{
        const granted = await admin.grant(deleteUser);
        granted.should.equal(true);
      }catch(err){
        throw err;
      }  
    });

    it('grant permissions for user',async () => {
      const user = response.roles.user;
      const createArticle = response.permissions.create_article;
      try{
        const granted = await user.grant(createArticle);
        granted.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('grant role for admin',async () => {
      const admin = response.roles.admin;
      const user = response.roles.user;
      try{
        const granted = await admin.grant(user);
        granted.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('admin can create article', async () => {
      const admin = response.roles.admin;
      try{
        const can = await admin.can('create', 'article');
        can.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('admin can delete user', async () => {
      const admin = response.roles.admin;
      try{
        const can = await admin.can('delete', 'user');
        can.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('user can not delete user',async () => {
      const user = response.roles.user;
      try{
        const can = await user.can('delete', 'article');
        can.should.equal(false);
      }catch(err){
        throw err;
      }
    });

    it('user can create article', async () => {
      const user = response.roles.user;
      try{
        const can = await user.can('create', 'article');
        can.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('user can any create article',async () => {
      const user = response.roles.user;
      try{
        const can = await user.canAny(permissions);
        can.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('user can all create article', async () => {
      const user = response.roles.user;
      try{
        const can = await user.canAll(permissions);
        can.should.equal(false);
      }catch(err){
        throw err;
      }
    });

    it('admin can all create article', async () => {
      const admin = response.roles.admin;
      try{
        const result = await rbac.grants(grants);
        const can = await admin.canAll(permissions);
        can.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('should be able to get role',async  () => {
      try{
        const admin = await rbac.getRole('admin');
        admin.name.should.equal('admin');
      }catch(err){
        throw err;
      }
    });

    it('should not be able to get permission through getRole',async () => {
      try{
        const permission = await rbac.getRole('create_article');
        should(permission).equal(null);
      }catch(err){
        throw err;
      }
    });

    it('should be able to get permission',async () => {
      try{
        const permission = await rbac.getPermission('create', 'article');
        permission.name.should.equal('create_article');
      }catch(err){
        throw err;
      }
    });

    it('should not be able to get role through getPermission', async () => {
      try{
        const admin = await rbac.getPermission('admin', '');
        should(admin).equal(null);
      }catch(err){
        throw err;
      }
    });

    it('should able to revoke permission', async () => {
      const user = response.roles.user;
      try{
        const revoked = await rbac.revokeByName('user', 'create_article');
        revoked.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('user can not create article because it is revoked',async () => {
      const user = response.roles.user;
      try{
        const can = await user.can('create', 'article');
        can.should.equal(false);
      }catch(err){
        throw err;
      }
    });

    it('should able to grant permission again',async () => {
      const user = response.roles.user;
      try{
        const granted = await rbac.grantByName('user', 'create_article');
        granted.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('user can create article because it is granted again', async () => {
      const user = response.roles.user;
      try{
        const can = await user.can('create', 'article');
        can.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('should be able to get role', async () => {
      try{
        const user = await rbac.get('user');
        user.name.should.equal('user');
      }catch(err){
        throw err;
      }
    });

    it('should be able to get permission',async () => {
      try{
        const permission = await rbac.get('create_article');
        permission.name.should.equal('create_article');
      }catch(err){
        throw err;
      }
    });

    it('should be able to remove permission', async () => {
      try{
        const removed = await rbac.remove(response.permissions.create_article);
        removed.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('should not be able to get removed permission',async  () => {
      try{
        const permission = await rbac.get('create_article');
        should(permission).equal(null);
      }catch(err){
        throw err;
      }
    });

    it('should be able to remove role', async () => {
      try{
        const removed = await  rbac.remove(response.roles.guest);
        removed.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('should not be able to get removed role',async () => {
      try{
        const role = await  rbac.get('guest');
        should(role).equal(null);
      }catch(err){
        throw err;
      }
    });

    it('should be able to remove permission by name',async () => {
      try{
        const removed = await rbac.removeByName('delete_user');
        removed.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('should not be able to get removed permission',async () => {
      try{
        const permission = await rbac.get('delete_user');
        should(permission).equal(null);
      }catch(err){
        throw err;
      }
    });

    it('should able to check existance of role', async () => {
      try{
        const exists = await rbac.exists('admin');
        exists.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('should able to check existance of non exist role',async () => {
      try{
        const exists = await rbac.exists('adminooooo');
        exists.should.equal(false);
      }catch(err){
        throw err;
      }
    });

    it('should able to check existance of role',async () => {
      try{
        const exists = await rbac.existsRole('admin');
        exists.should.equal(true);
      }catch(err){
        throw err;
      }
    });

    it('should able to check existance of permission',async () => {
      try{
        const exists = await rbac.existsPermission('update', 'article');
        exists.should.equal(true);
      }catch(err){
        throw err;
      }
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

    it('should be able to get scope for admin',async () => {
      try{
        const scope = await rbac.getScope('admin');
        scope.should.containDeep(['delete_user', 'create_article', 'update_article']);
      }catch(err){
        throw err;
      }
    });

    it('should be able to get scope for user', async () => {
      try{
        const scope = await rbac.getScope('user');
        scope.should.containDeep(['create_article', 'update_article']);
      }catch(err){
        throw err;
      }
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
      }, async (err, instance) => {
        if (err) throw err;
        try{
          const  scope = await instance.getScope('admin');
          scope.should.containDeep(['delete_user', 'update_rbac', 'create_article', 'change_password']);
          done();
        }catch(err){
          throw err;
        }
      });
    });
  });
}



function clearMySqlTables() {
    //drop all mysql table
    const sequelize = new Sequelize('mysql://root:@localhost:3306/rbac');
    const drop_tables = ['namegrant','nametypes','grants'].map(value => (
        sequelize.query(`DROP TABLE IF EXISTS ${value};`)
    ));
    return Promise.all(drop_tables).catch(err=>{
        throw err;
    });
}

testRBAC('Memory',()=>{return new Memory();});

testRBAC('Mongoose',()=>{
    return new Mongoose({
        connection: mongoose.connect('mongodb://localhost/rbac'),
    });
});


testRBAC('MySql', ()=>{
    return new MySql({
        username: 'root',
        password: ''
    });
},clearMySqlTables);