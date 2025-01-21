import { useColumnsLoader } from "~/services";
import { useColumnsStore, useColumnStateProvider } from "~/state";

export const useGetAllColumnsUseCase = () => {
  const rows = useColumnsLoader();
  useColumnStateProvider(rows);
  const { state } = useColumnsStore();

  return state;
};
