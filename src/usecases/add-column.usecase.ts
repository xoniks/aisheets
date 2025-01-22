import { server$ } from "@builder.io/qwik-city";
import { addColumn } from "~/services";
import { addCell } from "~/services/repository/cell";
import { type CreateColumn, type Column } from "~/state";

interface DynamicData {
  modelName: string;
  prompt: string;
  rows: number;
}

interface DynamicDataResponse {
  value: string;
  error?: string;
}

export const createDynamicData = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dynamic: DynamicData,
): Promise<DynamicDataResponse[]> => {
  return Promise.resolve([
    {
      value:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore",
    },
    {
      value:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore",
    },
  ]);
};

export const useAddColumnUseCase = () =>
  server$(async (newColum: CreateColumn): Promise<Column> => {
    const { name, type, prompt, modelName, rowsGenerated } = newColum;

    const column = await addColumn({
      name,
      type,
    });

    const cells = [];

    const data = await createDynamicData({
      prompt,
      modelName,
      rows: rowsGenerated,
    });

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const cell = await addCell({
        columnId: column.id,
        error: row.error,
        rowIdx: i,
        value: row.value,
      });

      cells.push(cell);
    }

    return {
      id: column.id,
      name: column.name,
      type: column.type as Column["type"],
      cells: cells.map((cell) => ({
        id: cell.id,
        idx: cell.rowIdx,
        value: cell.value,
        error: cell.error,
      })),
      process: {
        modelName,
        prompt,
      },
    };
  });
