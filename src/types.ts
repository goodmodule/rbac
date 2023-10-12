import Base from './Base';
import { Permission } from './Permission';
import { Role } from './Role';
import { Storage } from './Storage';

export type DecodeNamePermissionType = {
  action: ActionType;
  resource: ResourceType;
};

export type PermissionParam = [DecodeNamePermissionType['action'], DecodeNamePermissionType['resource']];

export type RoleType = string; //@todo enum roles
export type ResourceType = string; //@todo enum resources
export type ActionType = string; //@todo enum actions
export type DelimiterType = string;
export type PermissionType = Record<ResourceType, ActionType[]>;
export type GrandType = Concat<[ActionType, DelimiterType, ResourceType]>;
export type GrandsType = Record<RoleType, (GrandType | RoleType)[]>;

export type RBACOptionsType = {
  permissions: PermissionType;
  delimiter: string;
  roles: RoleType[];
  grants: GrandsType;
  storage?: Storage;
};

export type RBACType = {
  permissions: Record<string, Permission>;
  roles: Record<string, Role>;
};

type HandleTraverseGrantType = (item: Base) => Promise<boolean | null>;

export interface TraverseGrantsParams {
  roleName?: RoleType;
  handle: HandleTraverseGrantType;
  next?: (RoleType | undefined)[];
  used?: Record<RoleType, boolean>;
}

type Concat<T extends string[]> = T extends [infer F extends string, ...infer R extends string[]]
  ? `${F}${Concat<R>}`
  : '';
