import { server$ } from "@builder.io/qwik-city";
import { addColumn } from "~/services";
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

    const column = await addColumn(
      {
        name,
        type,
        kind,
      },
      process,
    );

    if (kind === "dynamic") {
      const { limit, modelName, offset, prompt } = process!;

      const data = await createDynamicData({
        prompt,
        modelName,
        limit,
        offset,
      });

      await Promise.all(
        data.map((cell, idx) =>
          column.addCell({
            idx,
            value: cell.value,
            error: cell.error,
          }),
        ),
      );

      return {
        id: column.id,
        name: column.name,
        type: column.type,
        kind: column.kind,
        cells: column.cells.map((cell) => ({
          id: cell.id,
          idx: cell.idx,
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
