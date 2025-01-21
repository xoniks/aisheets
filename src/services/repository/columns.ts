import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { ColumnModel } from "~/services/db/models/column";

interface Column {
  name: string;
  type: "text" | "array" | "number" | "boolean" | "object" | "prompt";
  sortable: boolean;
  output: "text" | "array" | "number" | "boolean" | "object" | null;
}

export const useColumnsLoader = routeLoader$<Column[]>(async () => {
  const columns = await ColumnModel.findAll();

  return columns.map((r) => ({
    name: r.name,
    type: r.type,
    sortable: r.sortable,
    output: r.output,
  }));
});

export const useAddColumnAction = () =>
  server$(async (column: Column) => {
    const added = await ColumnModel.create(column);

    return {
      name: added.name,
      type: added.type,
      sortable: added.sortable,
      output: added.output,
    };
  });
