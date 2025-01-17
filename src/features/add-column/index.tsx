import { $, component$, type QRL, useSignal, useTask$ } from "@builder.io/qwik";

import { Sidebar } from "~/components/ui/sidebar/sidebar";

import { LuCheck } from "@qwikest/icons/lucide";
import { TbX } from "@qwikest/icons/tablericons";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Select } from "~/components/ui/select/select";

type Column = {
  name: string;
  type: "text" | "array" | "number" | "boolean" | "object";
  generated: boolean;
  sortable: boolean;
};

interface SidebarProps {
  open: boolean;
  type: Column["type"];
  onClose: QRL<() => void>;
  onCreateColumn: QRL<(column: Column) => void>;
}

export const AddColumn = component$<SidebarProps>(
  ({ open, onClose, onCreateColumn, type }) => {
    const types = ["text", "array", "number", "boolean", "object"];
    const newType = useSignal<Column["type"]>(type);
    const name = useSignal<Column["name"]>("");

    useTask$(({ track }) => {
      track(() => type);

      newType.value = type;
      name.value = "";
    });

    const onSave = $(() => {
      if (!name.value) return;

      const column = {
        name: name.value,
        type: newType.value,
        generated: false,
        sortable: false,
      };

      onClose();
      onCreateColumn(column);
    });

    return (
      <Sidebar open={open}>
        <div class="flex h-full flex-col justify-between p-4">
          <div class="h-full">
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <Label for="column-name">Column name</Label>

                <Button size="sm" look="ghost" onClick$={onClose}>
                  <TbX />
                </Button>
              </div>
              <Input
                id="column-name"
                class="h-10"
                placeholder="Enter column name"
                bind:value={name}
              />

              <Select.Root class="h-10 w-48" bind:value={newType}>
                <Select.Trigger class="h-10 rounded-sm bg-blue-200">
                  <Select.DisplayValue />
                </Select.Trigger>
                <Select.Popover>
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
      </Sidebar>
    );
  },
);
