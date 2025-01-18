import {
  createContextId,
  type Signal,
  useContext,
  useContextProvider,
} from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export interface Column {
  name: string;
  type: "text" | "array" | "number" | "boolean" | "object";
  generated: boolean;
  sortable: boolean;
}

const columnContext = createContextId<Signal<Column[]>>("column.context");
const useColumnStateProvider = (columns: Signal<Column[]>) => {
  useContextProvider(columnContext, columns);
};

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

export const useColumns = () => {
  const columnData = useColumnsLoader();
  useColumnStateProvider(columnData);
  const columns = useContext(columnContext);

  return columns;
};
