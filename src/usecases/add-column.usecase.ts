import { server$ } from "@builder.io/qwik-city";
import { addColumn } from "~/services";
import { addCell } from "~/services/repository/cell";
import { type CreateColumn, type Column } from "~/state";

interface DynamicData {
  modelName: string;
  prompt: string;
  limit: number;
  offset: number;
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
    const { name, type, kind, process } = newColum;

    const column = await addColumn({
      name,
      type,
      kind,
    });

    const cells = [];

    if (kind === "dynamic") {
      const { limit, modelName, offset, prompt } = process!;

      const data = await createDynamicData({
        prompt,
        modelName,
        limit,
        offset,
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
        type: column.type,
        kind: column.kind,
        cells: cells.map((cell) => ({
          id: cell.id,
          idx: cell.rowIdx,
          value: cell.value,
          error: cell.error,
        })),
        process: {
          modelName,
          prompt,
          offset,
          limit,
        },
      };
    }

    throw new Error("Not implemented static column creation");
  });
