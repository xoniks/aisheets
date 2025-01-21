import {
  $,
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";

export interface Row {
  id: string;
  data: {
    [key: string]: {
      value: string;
      generating?: boolean;
    };
  };
}

const rowContext = createContextId<Signal<Row[]>>("rows.context");
export const useRowsStateProvider = (rows: Signal<Row[]>) => {
  useContextProvider(rowContext, rows);
};

export const useRowsStore = () => {
  const rows = useContext(rowContext);

  return {
    state: rows,
    replace: $((replaced: Row[]) => {
      rows.value = [...replaced];
    }),
    addRow: $((newbie: Row) => {
      rows.value = [...rows.value, newbie];
    }),
    updateRow: $((updated: Row) => {
      rows.value = [
        ...rows.value.map((c) => (c.id === updated.id ? updated : c)),
      ];
    }),
    deleteRow: $((deleted: Row) => {
      rows.value = rows.value.filter((c) => c.id !== deleted.id);
    }),
  };
};
