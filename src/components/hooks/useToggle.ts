import { $, useSignal } from "@builder.io/qwik";

export const useToggle = () => {
  const toggle = useSignal(false);

  const open = $(() => {
    toggle.value = true;
  });

  const close = $(() => {
    toggle.value = false;
  });

  return { value: toggle, open, close };
};
