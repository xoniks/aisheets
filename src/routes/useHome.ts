import { $ } from "@builder.io/qwik";
import { useRows, type Column, useColumns } from "~/state";

export const useHome = () => {
  const columns = useColumns();
  const rows = useRows();

  const onCreateColumn = $((newColum: Column) => {
    columns.value = [...columns.value, newColum];
  });

  return {
    columns,
    rows,
    onCreateColumn,
  };
};
