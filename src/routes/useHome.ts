import { $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { useRows, type Column, useColumns, type Row } from "~/state";

const responses = [
  {
    rowId: "1",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi .",
  },
  {
    rowId: "2",
    data: "Lorem ipsum dit anim id est laborum.",
  },
  {
    rowId: "3",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ulat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    rowId: "4",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliqtat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    rowId: "5",
    data: "Lorem ipsum dolor sit amisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    rowId: "6",
    data: "Lorem ipsum dolor sit Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    rowId: "7",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco la in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    rowId: "8",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et doloreat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    rowId: "9",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    rowId: "10",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquiccaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    rowId: "11",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magnaderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    rowId: "12",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco latate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

export const streamFromServer = server$(async function* (
  // Rows should comes from the db.
  row: Row,
  column: Column,
) {
  const response = responses.find((r) => r.rowId === row.id)!;

  row.data[column.name].generating = false;

  for (const letters of response.data) {
    row.data[column.name].value += letters;

    yield row;

    await new Promise((resolve) => setTimeout(resolve, 15));
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
        },
      },
    }));

    if (newColum.type !== "prompt") return;

    const stream = async (row: Row) => {
      const response = await streamFromServer(row, newColum);

      for await (const value of response) {
        rows.value = rows.value.map((row) => {
          return row.id === value.id ? value : row;
        });
      }
    };

    for (const row of rows.value) {
      stream(row);

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  });

  return {
    columns,
    rows,
    onCreateColumn,
  };
};
