import { component$, Slot } from "@builder.io/qwik";

interface SidebarProps {
  open: boolean;
}

export const Sidebar = component$<SidebarProps>(({ open }) => {
  return (
    <div class="relative">
      <div
        class={`fixed right-0 top-0 h-full w-1/2 transform bg-white text-black transition-transform duration-300 ${
          open ? "translate-x-0 border-l-8" : "translate-x-full"
        }`}
      >
        <Slot />
      </div>
    </div>
  );
});
