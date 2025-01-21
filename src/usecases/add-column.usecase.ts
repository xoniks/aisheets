import { $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { useAddColumnAction, useUpdateRecordAction } from "~/services";
import { RowModel } from "~/services/db/models/row";
import { useColumnsStore, useRowsStore, type Column, type Row } from "~/state";

//TODO: Put it on background
const useStreamServer = () => {
  return server$(async function* (row: Row, column: Column) {
    const response =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magnaderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    row.data[column.name].generating = false;

    for (const letters of response) {
      row.data[column.name].value += letters;

      await RowModel.update(row, {
        where: {
          id: row.id,
        },
      });

      yield row;

      await new Promise((resolve) => setTimeout(resolve, 15));
    }
  });
};

export const useAddColumnUseCase = () => {
  const { state: rows, updateRow: update } = useRowsStore();
  const { addColumn: add } = useColumnsStore();
  const addColumn = useAddColumnAction();
  const updateRow = useUpdateRecordAction();
  const streamData = useStreamServer();

  const useUseCase = $(async (newColum: Column) => {
    const addNewColumnToRow = async (newColum: Column) => {
      for (const row of rows.value) {
        row.data[newColum.name] = {
          generating: newColum.type === "prompt",
          value: "",
        };

        update(row);
        await updateRow(row);
      }
    };

    await addNewColumnToRow(newColum);
    add(newColum);
    await addColumn(newColum);

    if (newColum.type !== "prompt") return;

    const stream = async (row: Row) => {
      const response = await streamData(row, newColum);

      for await (const value of response) {
        update(value);
      }
    };

    for (const row of rows.value) {
      stream(row);

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  });

  return useUseCase;
};
