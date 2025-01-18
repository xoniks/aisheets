import { routeLoader$ } from "@builder.io/qwik-city";

type Row = Record<string, any>;

export const useRowsLoader = routeLoader$<Row[]>(async () => {
  return Promise.resolve([
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
  ]);
});
