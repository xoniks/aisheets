import { server$ } from "@builder.io/qwik-city";
import { RowModel } from "~/services/db/models/row";

interface Row {
  id: string;
  data: {
    [key: string]: {
      value: string;
      generating?: boolean;
    };
  };
}

export const getAllRows = async () => {
  const rows = await RowModel.findAll();

  return rows.map((r) => ({
    id: r.id,
    data: r.data,
  }));
};

export const addRow = async (row: Omit<Row, "id">) => {
  const added = await RowModel.create(row);

  return {
    id: added.id,
    data: added.data,
  };
};

export const updateRow = async (row: Row) => {
  await RowModel.update(row, {
    where: {
      id: row.id,
    },
  });

  return row;
};
