import {
  $,
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";

import { useAddColumnAction, useColumnsLoader } from "~/services";

export interface Column {
  name: string;
  type: "text" | "array" | "number" | "boolean" | "object" | "prompt";
  sortable: boolean;
  output: "text" | "array" | "number" | "boolean" | "object" | null;
}

const columnContext = createContextId<Signal<Column[]>>("column.context");
const useColumnStateProvider = (columns: Signal<Column[]>) => {
  useContextProvider(columnContext, columns);
};

export const useColumns = () => {
  const columnData = useColumnsLoader();
  useColumnStateProvider(columnData);
  const columns = useContext(columnContext);

  return columns;
};

export const useAddColumn = () => {
  const addColumn = useAddColumnAction();
  const columns = useContext(columnContext);

  return $(async (column: Column) => {
    await addColumn(column);

    columns.value = [...columns.value, column];
  });
};
