import { $, useContext, useSignal, useTask$ } from "@builder.io/qwik";
import {
  type ID,
  modalsContext,
  type Status,
} from "~/components/hooks/modals/context";

export const useModals = (id: ID) => {
  const isOpen = useSignal(false);
  const modals = useContext(modalsContext);

  const change = $((status: Status) => {
    isOpen.value = status === "open";
    modals.value = {
      ...modals.value,
      [id]: status,
    };
  });

  useTask$(({ track }) => {
    track(() => modals.value[id]);

    isOpen.value = modals.value[id] === "open";
  });

  useTask$(({ track }) => {
    const newValue = track(() => isOpen.value);

    if (newValue) {
      change("open");
    } else {
      change("closed");
    }
  });

  return {
    isOpen,
    open: $(() => change("open")),
    close: $(() => change("closed")),
  };
};
