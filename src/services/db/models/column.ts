import { isDev } from "@builder.io/qwik";
import type {
  Association,
  ForeignKey,
  HasManyCreateAssociationMixin,
  NonAttribute,
} from "sequelize";
import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import { db } from "~/services/db";
import { ColumnCellModel } from "~/services/db/models/cell";
import type { DatasetModel } from "~/services/db/models/dataset";
import { ProcessModel } from "~/services/db/models/process";

//Review the path
import { type Cell, type ColumnKind, type ColumnType } from "~/state";

export class ColumnModel extends Model<
  InferAttributes<ColumnModel>,
  InferCreationAttributes<ColumnModel>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare type: ColumnType;
  declare kind: ColumnKind;
  declare datasetId: ForeignKey<DatasetModel["id"]>;

  declare cells: NonAttribute<Cell[]>;

  declare createCell: HasManyCreateAssociationMixin<
    ColumnCellModel,
    "columnId"
  >;

  declare static associations: {
    cells: Association<ColumnModel, ColumnCellModel>;
  };
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
    kind: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datasetId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "Column",
  },
);

ColumnModel.hasMany(ColumnCellModel, {
  sourceKey: "id",
  foreignKey: "columnId",
  as: "cells",
});

ColumnModel.hasOne(ProcessModel, {
  sourceKey: "id",
});

await ColumnModel.sync({ alter: isDev });
