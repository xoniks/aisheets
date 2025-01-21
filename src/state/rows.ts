import {
  $,
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";
import { useAddRowAction, useRowsLoader } from "~/services";

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
const useRowsStateProvider = (rows: Signal<Row[]>) => {
  useContextProvider(rowContext, rows);
};

export const useRows = () => {
  const rowsData = useRowsLoader();
  useRowsStateProvider(rowsData);
  const rows = useContext(rowContext);

  return rows;
};

export const useAddRow = () => {
  const addRow = useAddRowAction();
  const rows = useContext(rowContext);

  return $(async (row: Omit<Row, "id">) => {
    const newbie = await addRow(row);

    rows.value = [...rows.value, newbie];
  });
};
