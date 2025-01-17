import { $, component$, useStore } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";

import { Commands } from "~/components/ui/commands/commands";
import { Table } from "~/components/ui/table/table";
import { AddColumn } from "~/features/add-column";

type Row = Record<string, any>;

type Column = {
  name: string;
  type: "string" | "array";
  generated: boolean;
  sortable: boolean;
};

export default component$(() => {
  const store = useStore<{
    columns: Column[];
    rows: Row[];
  }>({
    columns: [
      {
        name: "expected_response",
        type: "string",
        sortable: false,
        generated: false,
      },
      {
        name: "query",
        type: "string",
        sortable: true,
        generated: false,
      },
      {
        name: "context",
        type: "array",
        sortable: false,
        generated: false,
      },
      {
        name: "classify_query",
        type: "string",
        sortable: false,
        generated: true,
      },
    ],
    rows: [
      {
        id: 1,
        expected_response: "Expected 1",
        query: "what are points on a mortgage?",
        context:
          "Discount points, also called mortgage points or simply points, are a form of pre-paid interest available in the United States when arranging a mortgage. One point equals one percent of the loan amount. By charging a borrower points, a lender eff",
        classify_query: "finance",
      },
      {
        id: 2,
        expected_response: "Expected 2",
        query: "what are points on a mortgage?",
        context:
          "April.\n\n\n=== United States ===\n\n\n==== Federal government ====\n\nIn the United States, the federal government's fiscal year is the 12-month period beginning 1 October and ending 30 September the following year. The ident",
        classify_query: "general",
      },
    ],
  });

  const sidebar = useStore<{
    open: boolean;
    column: Column | null;
  }>({
    open: false,
    column: null,
  });

  const onAddColumn = $(() => {
    sidebar.open = true;
  });

  const onClose = $(() => {
    sidebar.open = false;
  });

  const onCreateColumn = $((newColum: Column) => {
    onClose();

    store.columns = [...store.columns, newColum];
  });

  return (
    <div class="container mx-auto p-4">
      <Commands onAddColumn={onAddColumn} />

      <Table columns={store.columns} rows={store.rows} />

      <AddColumn
        open={sidebar.open}
        onClose={onClose}
        onCreateColumn={onCreateColumn}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "ArgillaV3",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
