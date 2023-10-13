import { Permission } from './Permission';
import { RBAC } from './RBAC';
import { Role } from './Role';
import Storage from './storages';

RBAC.Role = Role;
RBAC.Permission = Permission;
RBAC.Storage = Storage;

export default RBAC;
