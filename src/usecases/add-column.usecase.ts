import { $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { addColumn, getAllRows, updateRow } from "~/services";
import { useColumnsStore, useRowsStore, type Column } from "~/state";

//TODO: Put it on background
const useCreatePromptResponse = () => {
  return server$(async function* (column: Column) {
    const rows = await getAllRows();

    const response =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magnaderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    for (const row of rows) {
      row.data[column.name].generating = false;

      for (const letters of response) {
        row.data[column.name].value += letters;

        yield row;

        await new Promise((resolve) => setTimeout(resolve, 15));
      }

      updateRow(row);
    }
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
  const streamData = useCreatePromptResponse();

  const useUseCase = $(async (newColum: Column) => {
    const { rows } = await addColumnUseCaseServer(newColum);
    for (const row of rows) {
      updateRow(row);
    }

    addColumn(newColum);

    const runPromptModel = async () => {
      if (newColum.type !== "prompt") return;

      const response = await streamData(newColum);

      for await (const value of response) {
        updateRow(value);
      }
    };

    runPromptModel();
  });

  return useUseCase;
};
