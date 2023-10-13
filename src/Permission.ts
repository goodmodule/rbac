import Base from './Base';
import { GRAND_DELIMITER } from './config/default';
import { RBAC } from './RBAC';
import { ActionType, DecodeNamePermissionType, DelimiterType, GrandType, ResourceType } from './types';

export class Permission extends Base {
  #action: DecodeNamePermissionType['action'];
  #resource: DecodeNamePermissionType['resource'];

  /** Compute name of permission from action and resource */
  static createName(action: ActionType, resource: ResourceType, delimiter: DelimiterType): GrandType {
    if (!delimiter) {
      throw new Error('Delimiter is not defined');
    }

    if (!action) {
      throw new Error('Action is not defined');
    }

    if (!resource) {
      throw new Error('Resource is not defined');
    }

    return `${action}${delimiter}${resource}`;
  }

  static decodeName(name: string, delimiter: DelimiterType = GRAND_DELIMITER): DecodeNamePermissionType {
    if (!delimiter) {
      throw new Error('delimiter is required');
    }

    if (!name) {
      throw new Error('Name is required');
    }

    const pos = name.indexOf(delimiter);
    if (pos === -1) {
      throw new Error('Wrong name');
    }

    return {
      action: name.slice(0, pos),
      resource: name.slice(pos + 1),
    };
  }

  /**  Permission constructor  */
  constructor(rbac: RBAC, action: ActionType, resource: ResourceType) {
    if (!action || !resource) {
      throw new Error('One of parameters is undefined');
    }

    if (
      !Permission.isValidName(action, rbac.options.delimiter) ||
      !Permission.isValidName(resource, rbac.options.delimiter)
    ) {
      throw new Error('Action or resource has no valid name');
    }

    super(rbac, Permission.createName(action, resource, rbac.options.delimiter));

    this.#action = action;
    this.#resource = resource;
  }

  /** Get action name of actual permission */
  get action(): ActionType {
    if (!this.#action) {
      const decoded = Permission.decodeName(this.name, this.rbac.options.delimiter);
      if (!decoded) {
        throw new Error('Action is null');
      }

      this.#action = decoded.action;
    }

    return this.#action;
  }

  /** Get resource name of actual permission */
  get resource(): ResourceType {
    if (!this.#resource) {
      const decoded = Permission.decodeName(this.name, this.rbac.options.delimiter);
      if (!decoded) {
        throw new Error('Resource is null');
      }

      this.#resource = decoded.resource;
    }

    return this.#resource;
  }

  /** Return true if it has same action and resource */
  can(action: ActionType, resource: ResourceType): boolean {
    return this.action === action && this.resource === resource;
  }

  /** Correct name can not contain whitespace or underscores. */
  static isValidName(name: string, delimiter: DelimiterType): boolean {
    if (!delimiter) {
      throw new Error('Delimiter is not defined');
    }

    const exp = new RegExp(`^[^${delimiter}\\s]+$`);

    return exp.test(name);
  }
}
