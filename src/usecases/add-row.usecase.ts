import { $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { addColumn, addRow, getAllColumns } from "~/services";
import { type Column, type Row, useColumnsStore, useRowsStore } from "~/state";

export const addRowServerUseCase = server$(async (row: Omit<Row, "id">) => {
  const columns = await getAllColumns();

  const newColumns: Column[] = [];

  if (columns.length === 0) {
    const cols = Object.keys(row.data);

    for (const col of cols) {
      const newbie = await addColumn({
        name: col,
        type: "text",
        output: null,
        sortable: true,
      });

      newColumns.push(newbie);
    }
  } else {
    row.data = {
      ...columns.reduce((acc, column) => {
        acc[column.name] = {
          generating: column.type === "prompt",
          value: "",
        };

        return acc;
      }, {} as any),
      ...row.data,
    };
  }

  const newRow = await addRow(row);

  return {
    newColumns,
    newRow,
  };
});

export const useAddRowUseCase = () => {
  const { addRow } = useRowsStore();
  const { addColumn: addColumnStore } = useColumnsStore();

  const useUseCase = $(async (row: Omit<Row, "id">) => {
    const { newColumns, newRow } = await addRowServerUseCase(row);

    for (const col of newColumns) {
      addColumnStore(col);
    }

    addRow(newRow);
  });

  return useUseCase;
};
