import { $, component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";

import { Commands, Table, useToggle } from "~/components";
import { AddColumn } from "~/features";
import { useRows, type Column, useColumns } from "~/state";

export { useRowsLoader, useColumnsLoader } from "~/services";

export default component$(() => {
  const { value, open, close } = useToggle();

  const columns = useColumns();
  const rows = useRows();

  const onCreateColumn = $((newColum: Column) => {
    close();

    columns.value = [...columns.value, newColum];
  });

  return (
    <div class="mx-auto px-4 pt-2">
      <Commands onAddColumn={open} />

      <Table columns={columns.value} rows={rows.value} />

      <AddColumn open={value} onClose={close} onCreateColumn={onCreateColumn} />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Argilla - V3",
  meta: [
    {
      name: "description",
      content: "Argilla - V3",
    },
  ],
};
