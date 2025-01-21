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
  declare type: "text" | "array" | "number" | "boolean" | "object" | "prompt";
  declare sortable: boolean;
  declare output: "text" | "array" | "number" | "boolean" | "object" | null;
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
      type: DataTypes.ENUM(
        "text",
        "array",
        "number",
        "boolean",
        "object",
        "prompt",
      ),
      allowNull: false,
    },
    sortable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    output: {
      type: DataTypes.ENUM("text", "array", "number", "boolean", "object"),
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "Column",
  },
);

await ColumnModel.sync({ alter: isDev });
