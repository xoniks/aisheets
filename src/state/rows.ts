import {
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";
import { useRowsLoader } from "~/services";

export type Row = Record<string, any>;

const rowContext = createContextId<Signal<Row[]>>("rows.context");
const useRowsStateProvider = (rows: Signal<Row[]>) => {
  useContextProvider(rowContext, rows);
};

export const useRows = () => {
  const rowsData = useRowsLoader();
  useRowsStateProvider(rowsData);
  const rows = useContext(rowContext);

  return rows;
};
