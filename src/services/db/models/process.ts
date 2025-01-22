import { isDev } from "@builder.io/qwik";
import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import { db } from "~/services/db";

export class ProcessModel extends Model<
  InferAttributes<ProcessModel>,
  InferCreationAttributes<ProcessModel>
> {
  declare id: CreationOptional<string>;
  declare prompt: string;
  declare offset: number;
  declare limit: number;
  declare columnId: string;
}

ProcessModel.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prompt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    offset: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    columnId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "Process",
  },
);

await ProcessModel.sync({ alter: isDev });
