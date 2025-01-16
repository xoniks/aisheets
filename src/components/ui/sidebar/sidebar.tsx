import { $, component$, useSignal, useStore, type QRL } from "@builder.io/qwik";
import { LuCheck } from "@qwikest/icons/lucide";
import { TbX } from "@qwikest/icons/tablericons";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Select } from "~/components/ui/select/select";

type Column = {
  name: string;
  type: "string" | "array";
  generated: boolean;
  sortable: boolean;
};

interface SidebarProps {
  open: boolean;
  editColumn: Column | null;
  onClose: QRL<() => void>;
  onCreateColumn: QRL<(column: Column) => void>;
}

export const Sidebar = component$(
  ({ open, editColumn, onClose, onCreateColumn }: SidebarProps) => {
    const types = ["string", "array"];
    const column = useSignal<Column | Partial<Column>>(
      editColumn ?? {
        generated: false,
        sortable: true,
      },
    );

    const onSave = $(() => {
      if (!column.value.name || !column.value.type) return;

      onCreateColumn(column.value as Column);
    });

    return (
      <div class="relative">
        <div
          class={`fixed right-0 top-0 h-full w-1/2 transform bg-white  text-black transition-transform duration-300 ${
            open ? "translate-x-0 border-l-8" : "translate-x-full"
          }`}
        >
          <div class="flex h-full flex-col justify-between p-4">
            <div class="h-full">
              <div class="flex items-center justify-end">
                <Button
                  size="sm"
                  class="flex w-32 items-center  space-x-4 font-light"
                  look="outline"
                  onClick$={onClose}
                >
                  <div class="flex items-center gap-1">
                    <TbX />
                    Close
                  </div>
                  <p class="font-light text-gray-400">esc</p>
                </Button>
              </div>

              <div class="flex flex-col gap-4">
                <Label for="column-name">Column name</Label>
                <Input
                  id="column-name"
                  class="h-10"
                  placeholder="Enter column name"
                  value={column.value.name}
                  onInput$={(_, e) => (column.value.name = e.value)}
                />

                <Select.Root
                  class="w-48"
                  onChange$={(e) => {
                    column.value.type = e as Column["type"];
                  }}
                >
                  <Select.Trigger class="rounded-sm bg-blue-200">
                    <Select.DisplayValue placeholder="Select an option" />
                  </Select.Trigger>
                  <Select.Popover gutter={8}>
                    {types.map((type) => (
                      <Select.Item key={type}>
                        <Select.ItemLabel>{type}</Select.ItemLabel>
                        <Select.ItemIndicator>
                          <LuCheck class="h-4 w-4" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Popover>
                </Select.Root>
              </div>
            </div>

            <div class="flex h-16 w-full items-center justify-center">
              <Button size="sm" class="w-full rounded-sm p-2" onClick$={onSave}>
                Create new column
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
