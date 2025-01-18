import { $, useContext, useSignal, useTask$ } from "@builder.io/qwik";
import { type ID, modalsContext } from "~/components/hooks/modals/context";

export const useModals = (id: ID) => {
  const isOpen = useSignal(false);
  const modals = useContext(modalsContext);

  useTask$(({ track }) => {
    track(() => modals.value[id]);

    isOpen.value = modals.value[id] === "open";
  });

  return {
    isOpen,
    open: $(() => {
      modals.value = {
        ...modals.value,
        [id]: "open",
      };
    }),
    close: $(() => {
      modals.value = {
        ...modals.value,
        [id]: "closed",
      };
    }),
  };
};
