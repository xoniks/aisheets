import {
  $,
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";

export interface Column {
  name: string;
  type: "text" | "array" | "number" | "boolean" | "object" | "prompt";
  sortable: boolean;
  output: "text" | "array" | "number" | "boolean" | "object" | null;
}

const columnContext = createContextId<Signal<Column[]>>("column.context");
export const useColumnStateProvider = (columns: Signal<Column[]>) => {
  useContextProvider(columnContext, columns);
};

export const useColumnsStore = () => {
  const columns = useContext(columnContext);

  return {
    state: columns,
    replaceColumn: $((replaced: Column[]) => {
      columns.value = [...replaced];
    }),
    addColumn: $((newbie: Column) => {
      columns.value = [...columns.value, newbie];
    }),
    updateColumn: $((updated: Column) => {
      columns.value = [
        ...columns.value.map((c) => (c.name === updated.name ? updated : c)),
      ];
    }),
    deleteColumn: $((deleted: Column) => {
      columns.value = columns.value.filter((c) => c.name !== deleted.name);
    }),
  };
};
