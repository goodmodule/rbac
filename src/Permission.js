// @flow
import Base from './Base';

export default class Permission extends Base {
  /**
   * Compute name of permission from action and resource
   * @function createName
   * @memberof Permission
   * @param {String} action Name of permission
   * @param {String} resource Resource of permission
   * @param {String} delimeter Delimeter
   * @return {String} Computed name of permission
   * @static
   */
  static createName(action: string, resource: string, delimeter: string): string {
    return `${action}${delimeter}${resource}`;
  }

  /**
   * Permission constructor
   * @constructor Permission
   * @extends {Base}
   * @param {RBAC} rbac Instance of the RBAC
   * @param {string} action Name of the action
   * @param {string} resource Name of the resource
   */
  constructor(rbac: RBAC, action: string, resource: string) {
    if (!action || !resource) {
      throw new Error('One of parameters is undefined');
    }

    if (!Permission.isValidName(action) || !Permission.isValidName(resource)) {
      throw new Error('Action or resource has no valid name');
    }

    super(rbac, Permission.createName(action, resource, rbac.options.delimiter));
  }

  /**
   * Get action name of actual permission
   * @member Permission#action {String} Action of permission
   */
  get action(): string {
    if (!this.#action) {
      const decoded = Permission.decodeName(this.name);
      if (!decoded) {
        throw new Error('Action is null');
      }

      this.#action = decoded.action;
    }

    return this.#action;
  }

  /**
   * Get resource name of actual permission
   * @member Permission#resource {String} Resource of permission
   */
  get resource(): string {
    if (!this.#resource) {
      const decoded = Permission.decodeName(this.name);
      if (!decoded) {
        throw new Error('Resource is null');
      }

      this.#resource = decoded.resource;
    }

    return this.#resource;
  }

  /**
   * Return true if has same action and resource
   * @method Permission#can
   * @param  {String}  action   Name of action
   * @param  {String}  resource Name of resource
   * @return {Boolean}
   */
  can(action: string, resource: string): boolean {
    return this.action === action && this.resource === resource;
  }

  decodeName(): Object {
    const { name, rbac } = this;
    const pos = name.indexOf(rbac.options.delimiter);
    if (pos === -1) {
      throw new Error('Wrong name');
    }

    return {
      action: name.substr(0, pos),
      resource: name.substr(pos + 1),
    };
  }

  /**
   * Correct name can not contain whitespace or underscores.
   * @function isValidName
   * @memberof Permission
   * @param  {String} name Name
   * @param  {String} delimiter Delimiter
   * @return {Boolean}
   * @static
   */
  static isValidName(name: string, delimiter: string): boolean {
    const exp = new RegExp(`^[^${delimiter}\\s]+$`);
    return exp.test(name);
  }
}
