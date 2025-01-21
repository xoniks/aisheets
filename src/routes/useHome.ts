import { $ } from "@builder.io/qwik";
import { type Column } from "~/state";
import { useAddColumnUseCase } from "~/usecases/add-column.usecase";
import { useGetAllColumnsUseCase } from "~/usecases/get-all-columns.usecase";
import { useGetAllRowsUseCase } from "~/usecases/get-all-rows.usecase";

export const useHome = () => {
  const columns = useGetAllColumnsUseCase();
  const rows = useGetAllRowsUseCase();
  const addNewColumnUseCase = useAddColumnUseCase();

  const onCreateColumn = $(async (newColum: Column) => {
    await addNewColumnUseCase(newColum);
  });

  return {
    columns,
    rows,
    onCreateColumn,
  };
};
