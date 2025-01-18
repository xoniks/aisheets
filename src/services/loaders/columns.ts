import { routeLoader$ } from "@builder.io/qwik-city";

interface Column {
  name: string;
  type: "text" | "array" | "number" | "boolean" | "object";
  generated: boolean;
  sortable: boolean;
}

export const useColumnsLoader = routeLoader$<Column[]>(async () => {
  return Promise.resolve([
    {
      name: "expected_response",
      type: "text",
      sortable: false,
      generated: false,
    },
    {
      name: "query",
      type: "text",
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
      type: "text",
      sortable: false,
      generated: true,
    },
  ]);
});
