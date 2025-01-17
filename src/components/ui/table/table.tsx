import {
  $,
  component$,
  type QRL,
  useSignal,
  useStore,
  useTask$,
} from "@builder.io/qwik";
import {
  TbAlignJustified,
  TbBraces,
  TbBrackets,
  TbHash,
  TbToggleLeft,
} from "@qwikest/icons/tablericons";

type Row = Record<string, any>;

type Column = {
  name: string;
  type: "text" | "array" | "number" | "boolean" | "object";
};

interface Props {
  columns: Column[];
  rows: Row[];
}

const Icons: Record<Column["type"], any> = {
  text: TbAlignJustified,
  number: TbHash,
  boolean: TbToggleLeft,
  object: TbBraces,
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
    columnWidths: columns.reduce(
      (acc, column) => {
        acc[column.name] = 750;
        return acc;
      },
      {} as Record<string, number>,
    ),
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
            <th class="max-w-8 border bg-gray-50 px-2 py-2 text-center hover:bg-sky-100">
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
                style={{
                  width: `${state.columnWidths[column.name]}px`,
                }}
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
          {rows.map((row, index) => (
            <Row
              key={row.id}
              index={index}
              row={row}
              columns={columns}
              selectedColumns={state.selectedColumns}
              selectedRows={state.selectedRows}
              toggleSelectRow={toggleSelectRow}
              selectColumn={selectColumn}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export const Row = component$<{
  row: Row;
  columns: Column[];
  index: number;
  selectedRows: number[];
  selectedColumns: Record<string, number[] | undefined>;
  toggleSelectRow: QRL<(row: Row) => void>;
  selectColumn: QRL<(row: Row, columnIndex: number) => void>;
}>(
  ({
    index,
    row,
    columns,
    selectedColumns,
    selectedRows,
    toggleSelectRow,
    selectColumn,
  }) => {
    const isSelectedRow = useSignal(false);
    const hovering = useSignal(isSelectedRow.value);

    useTask$(({ track }) => {
      const isSelected = track(() => selectedRows.includes(row.id));

      isSelectedRow.value = isSelected;
      hovering.value = isSelectedRow.value;
    });

    return (
      <tr
        class="hover:bg-gray-100"
        onMouseOver$={() => {
          hovering.value = true;
        }}
        onMouseOut$={() => {
          hovering.value = isSelectedRow.value || false;
        }}
      >
        <td class="max-w-6 border px-2 py-2 text-center">
          {hovering.value ? (
            <input
              type="checkbox"
              checked={isSelectedRow.value}
              onChange$={() => toggleSelectRow(row)}
            />
          ) : (
            <span>{index + 1}</span>
          )}
        </td>
        {columns.map((column, index) => (
          <td
            key={index}
            class={`cursor-pointer text-wrap border px-2 ${selectedColumns[row.id]?.includes(index) ? "border-2 border-blue-300" : ""}`}
            onClick$={() => selectColumn(row, index)}
          >
            {row[column.name]}
          </td>
        ))}
      </tr>
    );
  },
);
