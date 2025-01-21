import { useRowsLoader } from "~/services";
import { useRowsStateProvider, useRowsStore } from "~/state";

export const useGetAllRowsUseCase = () => {
  const rows = useRowsLoader();
  useRowsStateProvider(rows);
  const { state } = useRowsStore();

  return state;
};
