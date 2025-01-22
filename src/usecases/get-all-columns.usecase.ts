import { useLoadColumns } from "~/state";

export const useGetAllColumnsUseCase = () => {
  const columns = useLoadColumns();

  return columns;
};
