import { routeLoader$ } from "@builder.io/qwik-city";

interface Column {
  name: string;
  type: "text" | "array" | "number" | "boolean" | "object" | "prompt";
  sortable: boolean;
  output: "text" | "array" | "number" | "boolean" | "object" | null;
}

export const useColumnsLoader = routeLoader$<Column[]>(() => {
  return Promise.resolve([
    {
      name: "expected_response",
      type: "text",
      sortable: false,
      output: null,
    },
    {
      name: "query",
      type: "text",
      sortable: true,
      output: null,
    },
    {
      name: "context",
      type: "array",
      sortable: false,
      output: null,
    },
    {
      name: "classify_query",
      type: "text",
      sortable: false,
      output: null,
    },
  ]);
});
