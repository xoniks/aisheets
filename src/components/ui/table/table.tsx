import { $, component$, useStore } from "@builder.io/qwik";
import { TbAlignJustified, TbBrackets } from "@qwikest/icons/tablericons";

type Row = Record<string, any>;

type Column = {
  name: string;
  type: "string" | "array";
  generated: boolean;
  sortable: boolean;
};

interface Props {
  columns: Column[];
  rows: Row[];
}

const Icons: Record<Column["type"], any> = {
  string: TbAlignJustified,
  array: TbBrackets,
};
const ColumnIcon = component$<{ type: Column["type"] }>((props) => {
  const Icon = Icons[props.type];

  return <Icon />;
});

export const Table = component$<Props>(({ columns, rows }) => {
  const state = useStore<{
    selectedColumns: Record<string, number[] | undefined>;
    selectedRows: number[];
    columnWidths: Record<string, number>;
  }>({
    selectedColumns: {},
    selectedRows: [],
    columnWidths: {
      expected_response: 200,
      query: 200,
      context: 300,
      classify_query: 200,
    },
  });

  const toggleSelectAll = $(() => {
    if (rows.length === state.selectedRows.length) {
      state.selectedRows = [];
    } else {
      state.selectedRows = rows.map((row) => row.id);
    }
  });

  const toggleSelectRow = $((row: Row) => {
    if (state.selectedRows.includes(row.id)) {
      state.selectedRows = state.selectedRows.filter((id) => id !== row.id);
    } else {
      state.selectedRows = [...state.selectedRows, row.id];
    }
  });

  const selectColumn = $((row: Row, columnIndex: number) => {
    state.selectedColumns = {};

    state.selectedColumns[row.id] = [columnIndex];
  });

  const handleResize = $((columnName: string, newWidth: number) => {
    state.columnWidths[columnName] = newWidth;
  });

  return (
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white text-sm">
        <thead>
          <tr>
            <th class="w-0 border bg-gray-50 px-2 py-2 text-center hover:bg-sky-100">
              <input
                type="checkbox"
                checked={rows.length === state.selectedRows.length}
                onChange$={toggleSelectAll}
              />
            </th>
            {columns.map((column, index) => (
              <th
                key={index}
                class="border bg-gray-50  text-left font-light hover:bg-purple-50"
                style={{ width: `${state.columnWidths[column.name]}px` }}
              >
                <div class="flex flex-row items-center justify-between">
                  <div class="flex w-full items-center gap-1 px-2">
                    <ColumnIcon type={column.type} />
                    {column.name}
                  </div>
                  <div
                    class="h-8  w-2 cursor-col-resize"
                    onMouseDown$={(e) => {
                      const startX = e.clientX;
                      const startWidth = state.columnWidths[column.name];
                      const onMouseMove = (moveEvent: MouseEvent) => {
                        const newWidth =
                          startWidth + (moveEvent.clientX - startX);
                        handleResize(column.name, newWidth);
                      };
                      const onMouseUp = () => {
                        document.removeEventListener("mousemove", onMouseMove);
                        document.removeEventListener("mouseup", onMouseUp);
                      };
                      document.addEventListener("mousemove", onMouseMove);
                      document.addEventListener("mouseup", onMouseUp);
                    }}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} class="hover:bg-gray-100">
              <td class="border px-2 py-2 text-center">
                <input
                  type="checkbox"
                  checked={state.selectedRows.includes(row.id)}
                  onChange$={() => toggleSelectRow(row)}
                />
              </td>
              {columns.map((column, index) => (
                <td
                  key={index}
                  class={`cursor-pointer text-wrap border px-2 ${state.selectedColumns[row.id]?.includes(index) ? "border-2 border-blue-500" : ""}`}
                  onClick$={() => selectColumn(row, index)}
                >
                  {row[column.name]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
