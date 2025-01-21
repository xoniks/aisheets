import { $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { addColumn, getAllRows, updateRow } from "~/services";
import { useColumnsStore, useRowsStore, type Column, type Row } from "~/state";

//TODO: Put it on background
const useStreamServer = () => {
  return server$(async function* (row: Row, column: Column) {
    const response =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magnaderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    row.data[column.name].generating = false;

    for (const letters of response) {
      row.data[column.name].value += letters;

      yield row;

      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    updateRow(row);
  });
};

export const addColumnUseCaseServer = server$(async (newColum: Column) => {
  const rows = await getAllRows();

  addColumn(newColum);

  for (const row of rows) {
    row.data[newColum.name] = {
      generating: newColum.type === "prompt",
      value: "",
    };

    updateRow(row);
  }

  return {
    rows,
  };
});

export const useAddColumnUseCase = () => {
  const { updateRow } = useRowsStore();
  const { addColumn } = useColumnsStore();
  const streamData = useStreamServer();

  const useUseCase = $(async (newColum: Column) => {
    const { rows } = await addColumnUseCaseServer(newColum);
    for (const row of rows) {
      updateRow(row);
    }

    addColumn(newColum);

    if (newColum.type !== "prompt") return;

    const stream = async (row: Row) => {
      const response = await streamData(row, newColum);

      for await (const value of response) {
        updateRow(value);
      }
    };

    for (const row of rows) {
      stream(row);

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  });

  return useUseCase;
};
