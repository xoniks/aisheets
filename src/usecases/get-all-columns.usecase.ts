import {
  useColumnsLoader,
  useColumnsStore,
  useColumnStateProvider,
} from "~/state";

export const useGetAllColumnsUseCase = () => {
  const columns = useColumnsLoader();
  useColumnStateProvider(columns);

  const { state } = useColumnsStore();

  return state;
};
