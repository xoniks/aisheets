import { $, useContext, useSignal, useTask$ } from "@builder.io/qwik";
import { type Status, type ID } from "~/components/hooks/modals/config";
import { modalsContext } from "~/components/hooks/modals/context";
import { wrap, type Modal } from "~/components/hooks/modals/named";

export const useModals = <N extends ID>(id: N): Modal<N> => {
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

  const modal = {
    isOpen,
    open: $(() => change("open")),
    close: $(() => change("closed")),
  };

  return wrap(id, isOpen, modal.open, modal.close);
};
