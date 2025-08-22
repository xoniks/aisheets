import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
  type NonAttribute,
} from 'sequelize';

import { db } from '~/services/db';

export class DatabricksConnectionModel extends Model<
  InferAttributes<DatabricksConnectionModel>,
  InferCreationAttributes<DatabricksConnectionModel>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare name: string;
  declare host: string;
  declare httpPath: string;
  declare encryptedToken: string;
  declare defaultCatalog?: string;
  declare defaultSchema?: string;
  declare isActive: boolean;
  declare lastConnected?: Date;

  declare createdAt: NonAttribute<Date>;
  declare updatedAt: NonAttribute<Date>;
}

DatabricksConnectionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    host: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    httpPath: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'http_path',
    },
    encryptedToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'encrypted_token',
    },
    defaultCatalog: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'default_catalog',
    },
    defaultSchema: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'default_schema',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    lastConnected: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_connected',
    },
  },
  {
    sequelize: db,
    modelName: 'DatabricksConnection',
    tableName: 'databricks_connections',
  },
);