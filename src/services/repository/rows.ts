import { routeLoader$, server$ } from "@builder.io/qwik-city";
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

export const useRowsLoader = routeLoader$<Row[]>(async () => {
  const rows = await RowModel.findAll();

  return rows.map((r) => ({
    id: r.id,
    data: r.data,
  }));
});

export const useAddRowAction = () =>
  server$(async (row: Omit<Row, "id">) => {
    const added = await RowModel.create(row);

    return {
      id: added.id,
      data: added.data,
    };
  });
