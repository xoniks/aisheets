import { isDev } from "@builder.io/qwik";
import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import { db } from "~/services/db";

export class RowModel extends Model<
  InferAttributes<RowModel>,
  InferCreationAttributes<RowModel>
> {
  declare id: CreationOptional<string>;
  declare data: {
    [key: string]: {
      value: string;
      generating?: boolean;
    };
  };
}

RowModel.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "Row",
  },
);

await RowModel.sync({ alter: isDev });
