import { isDev } from "@builder.io/qwik";
import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import { db } from "~/services/db";

export class ColumnCellModel extends Model<
  InferAttributes<ColumnCellModel>,
  InferCreationAttributes<ColumnCellModel>
> {
  declare id: CreationOptional<string>;
  declare columnId: string;
  declare rowIdx: number;
  declare value: string;
  declare error?: string;
}

ColumnCellModel.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    columnId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    rowIdx: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    error: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "Cell",
  },
);

await ColumnCellModel.sync({ alter: isDev });
