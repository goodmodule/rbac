import { RBACOptionsType } from '../types';

export const GRAND_DELIMITER = '_';

export const RBAC_DEFAULT_OPTIONS: RBACOptionsType = {
  permissions: {},
  roles: [],
  grants: {},
  delimiter: GRAND_DELIMITER,
};
