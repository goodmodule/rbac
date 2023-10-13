import { Model, Schema as MongooseSchema } from 'mongoose';
import type { Connection } from 'mongoose';

import Base from '../Base';
import { Permission } from '../Permission';
import { RBAC } from '../RBAC';
import { Role } from '../Role';
import { RoleType } from '../types';
import Storage from './index';

enum TypeEnum {
  PERMISSION = 'PERMISSION',
  ROLE = 'ROLE',
}

type OptionsType = {
  connection?: Connection;
  modelName?: string;
  Schema: typeof MongooseSchema<RecordType>;
};

type RecordType = { type: 'PERMISSION' | 'ROLE'; name: string; grants: string[] };

function createSchema(Schema: typeof MongooseSchema<RecordType>) {
  return new Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['PERMISSION', 'ROLE'], required: true },
    grants: [String],
  });
}

function getType(item: Base) {
  if (item instanceof Role) {
    return TypeEnum.ROLE;
  } else if (item instanceof Permission) {
    return TypeEnum.PERMISSION;
  }

  return null;
}

function convertToInstance(rbac: RBAC, record: RecordType): Promise<Role | Permission> {
  if (!record) {
    throw new Error('Record is undefined');
  }

  if (record.type === TypeEnum.ROLE) {
    return rbac.createRole(record.name, false);
  } else if (record.type === TypeEnum.PERMISSION) {
    const decoded = Permission.decodeName(record.name);

    if (!decoded) {
      throw new Error('Bad permission name');
    }

    return rbac.createPermission(decoded.action, decoded.resource, false);
  }

  throw new Error('Type is undefined');
}

export class MongooseStorage extends Storage {
  readonly #options: OptionsType;
  readonly #model: Model<RecordType>;

  constructor(options: OptionsType) {
    super();
    const { modelName = 'rbac', Schema = MongooseSchema, connection } = options;

    // const connection = options.connection;
    if (!connection) {
      throw new Error('Parameter connection is undefined use your current mongoose connection.');
    }

    this.#options = options;

    this.#model = connection.model(modelName, createSchema(Schema));
  }

  get model() {
    return this.#model;
  }

  get options() {
    return this.#options;
  }

  async add(item: Base) {
    const obj = await this.model.create({
      name: item.name,
      type: getType(item),
    });

    if (!obj) {
      throw new Error('Item is undefined');
    }

    return true;
  }

  async remove(item: Base) {
    const name = item.name;

    const { acknowledged, matchedCount } = await this.model.updateOne(
      { grants: name },
      {
        $pull: {
          grants: name,
        },
      },
      { multi: true },
    );

    if (acknowledged && matchedCount) {
      await this.model.deleteOne({ name });
    }

    return true;
  }

  async grant(role: Base, child: Base) {
    const name = role.name;
    const childName = child.name;

    // if (!role instanceof Role) {
    //   throw new Error('Role is not instance of Role');
    // }

    if (name === childName) {
      throw new Error('You can grant yourself');
    }

    await this.model.updateOne({ name: name, type: TypeEnum.ROLE }, { $addToSet: { grants: childName } });

    return true;
  }

  async revoke(role: Base, child: Base) {
    const name = role.name;
    const childName = child.name;

    const { matchedCount } = await this.model.updateOne(
      { name: name, type: TypeEnum.ROLE },
      { $pull: { grants: childName } },
    );

    if (matchedCount === 0) {
      throw new Error('Item is not associated to this item');
    }

    return true;
  }

  async get(name: string) {
    const rbac = this.rbac as RBAC;

    const record = await this.model.findOne({ name });

    if (record) {
      return convertToInstance(rbac, record);
    } else {
      return undefined;
    }
  }

  async getRoles(): Promise<Role[]> {
    const rbac = this.rbac as RBAC;

    const records = await this.model.find({ type: TypeEnum.ROLE });

    return records.map(r => convertToInstance(rbac, r) as unknown as Role);
  }

  async getPermissions(): Promise<Permission[]> {
    const rbac = this.rbac as RBAC;

    const records = await this.model.find({ type: TypeEnum.PERMISSION });

    return records.map(r => convertToInstance(rbac, r) as unknown as Permission);
  }

  async getGrants(role: RoleType): Promise<Base[]> {
    const rbac = this.rbac as RBAC;

    const record = await this.model.findOne({ name: role, type: TypeEnum.ROLE });

    if (!record || !record.grants.length) {
      return [];
    }

    const records = await this.model.find({ name: record.grants });

    return records.map(r => convertToInstance(rbac, r) as unknown as Base);
  }
}
