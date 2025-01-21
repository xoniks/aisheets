import { $ } from "@builder.io/qwik";
import { useAddColumnAction, useAddRowAction } from "~/services";
import { type Row, useColumnsStore, useRowsStore } from "~/state";

export const useAddRowUseCase = () => {
  const addColumnAction = useAddColumnAction();
  const addRowAction = useAddRowAction();

  const { addRow } = useRowsStore();
  const { state: columns, addColumn } = useColumnsStore();

  const useUseCase = $(async (row: Omit<Row, "id">) => {
    if (columns.value.length === 0) {
      const cols = Object.keys(row.data);

      for (const col of cols) {
        const newbie = await addColumnAction({
          name: col,
          type: "text",
          output: null,
          sortable: true,
        });

        addColumn(newbie);
      }
    }

    const newbie = await addRowAction(row);
    addRow(newbie);
  });

  return useUseCase;
};
