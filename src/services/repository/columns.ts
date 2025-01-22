import { type InferCreationAttributes } from "sequelize";
import { ColumnModel } from "~/services/db/models/column";
import { ColumnCellModel } from "~/services/db/models/cell";
import { type Column } from "~/state";

export const getAllColumns = async (): Promise<Column[]> => {
  const columns = await ColumnModel.findAll();
  const cells = await ColumnCellModel.findAll();

  return columns.map((column) => ({
    id: column.id,
    name: column.name,
    type: column.type,
    kind: column.kind,
    cells: cells
      .filter((cell) => cell.columnId === column.id)
      .map((cell) => ({
        id: cell.id,
        idx: cell.rowIdx,
        value: cell.value,
        error: cell.error,
      })),
  }));
};

export const addColumn = async (
  column: Omit<InferCreationAttributes<ColumnModel>, "id">,
) => {
  const added = await ColumnModel.create(column);

  return {
    id: added.id as string,
    name: added.name,
    type: added.type,
    kind: added.kind,
  };
};
