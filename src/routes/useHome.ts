import { $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { useRows, type Column, useColumns, type Row } from "~/state";

const responses = [
  {
    rowId: "1",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "2",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "3",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "4",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "5",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "6",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "7",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "8",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "9",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "10",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "11",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    rowId: "12",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

export const streamFromServer = server$(async function* (
  // Rows should comes from the db.
  rows: Row[],
  column: Column,
) {
  for (const row of rows) {
    const response = responses.find((r) => r.rowId === row.id)!;

    row.data[column.name].generating = false;
    for (const letters of response.data) {
      row.data[column.name].value += letters;

      yield row;

      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
});

export const useHome = () => {
  const columns = useColumns();
  const rows = useRows();

  const onCreateColumn = $(async (newColum: Column) => {
    columns.value = [...columns.value, newColum];
    rows.value = rows.value.map((row) => ({
      ...row,
      data: {
        ...row.data,
        [newColum.name]: {
          value: "",
          generating: true,
        },
      },
    }));

    const response = await streamFromServer(rows.value, newColum);

    for await (const value of response) {
      rows.value = rows.value.map((row) => {
        return row.id === value.id ? value : row;
      });
    }
  });

  return {
    columns,
    rows,
    onCreateColumn,
  };
};
