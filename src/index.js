import RBAC from './rbac';
import Role from './role';
import Permission from './permission';
import Storage from './storages/index';
import MongooseStorage from './storages/mongoose';

Storage.Mongoose = MongooseStorage;

RBAC.Role = Role;
RBAC.Permission = Permission;
RBAC.Storage = Storage;

export default RBAC;
