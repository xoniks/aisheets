import {
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";

import { useColumnsLoader } from "~/services";

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
