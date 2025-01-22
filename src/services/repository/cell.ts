import { type InferCreationAttributes } from "sequelize";
import { ColumnCellModel } from "~/services/db/models/cell";

export const addCell = async (
  cell: Omit<InferCreationAttributes<ColumnCellModel>, "id">,
) => {
  const added = await ColumnCellModel.create(cell);

  return {
    id: added.id,
    rowIdx: added.rowIdx,
    columnId: added.columnId,
    value: added.value,
    error: added.error,
  };
};
