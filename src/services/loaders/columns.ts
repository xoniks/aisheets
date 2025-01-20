import { routeLoader$ } from "@builder.io/qwik-city";

interface Column {
  name: string;
  type: "text" | "array" | "number" | "boolean" | "object";
  generated: boolean;
  generating: boolean;
  sortable: boolean;
}

export const useColumnsLoader = routeLoader$<Column[]>(async () => {
  return Promise.resolve([
    {
      name: "expected_response",
      type: "text",
      sortable: false,
      generated: false,
      generating: false,
    },
    {
      name: "query",
      type: "text",
      sortable: true,
      generated: false,
      generating: false,
    },
    {
      name: "context",
      type: "array",
      sortable: false,
      generated: false,
      generating: false,
    },
    {
      name: "classify_query",
      type: "text",
      sortable: false,
      generated: false,
      generating: false,
    },
  ]);
});
