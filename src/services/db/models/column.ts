import { isDev } from "@builder.io/qwik";
import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import { db } from "~/services/db";

export class ColumnModel extends Model<
  InferAttributes<ColumnModel>,
  InferCreationAttributes<ColumnModel>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare type: string;
}

ColumnModel.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "Column",
  },
);

await ColumnModel.sync({ alter: isDev });
