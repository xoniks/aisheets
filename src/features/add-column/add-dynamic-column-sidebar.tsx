import { $, component$, type QRL, useSignal, useTask$ } from "@builder.io/qwik";

import { LuCheck } from "@qwikest/icons/lucide";
import { TbX } from "@qwikest/icons/tablericons";
import { Sidebar, Button, Input, Label, Select, Textarea } from "~/components";

import { type Column } from "~/state";
import { useModals } from "~/components/hooks/modals/use-modals";

interface SidebarProps {
  type: Column["type"];
  onCreateColumn: QRL<(column: Column) => void>;
}

export const AddDynamicColumnSidebar = component$<SidebarProps>(
  ({ onCreateColumn, type }) => {
    const { isOpenAddDynamicColumnSidebar, closeAddDynamicColumnSidebar } =
      useModals("addDynamicColumnSidebar");

    const outputType = ["text", "array", "number", "boolean", "object"];
    const newOutputType = useSignal<NonNullable<Column["output"]>>("text");
    const name = useSignal<Column["name"]>("");
    const rowsGenerated = useSignal("100");

    useTask$(({ track }) => {
      track(() => type);

      newOutputType.value = "text";
      name.value = "";
    });

    const onSave = $(() => {
      if (!name.value) return;

      const column: Column = {
        name: name.value,
        type: "prompt",
        output: newOutputType.value,
        sortable: false,
      };

      closeAddDynamicColumnSidebar();
      onCreateColumn(column);
    });

    return (
      <Sidebar bind:show={isOpenAddDynamicColumnSidebar}>
        <div class="flex h-full flex-col justify-between p-4">
          <div class="h-full">
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <Label for="column-name">Column name</Label>

                <Button
                  size="sm"
                  look="ghost"
                  onClick$={closeAddDynamicColumnSidebar}
                >
                  <TbX />
                </Button>
              </div>
              <Input
                id="column-name"
                class="h-10"
                placeholder="Enter column name"
                bind:value={name}
              />

              <Label for="column-output-type">Output type</Label>
              <Select.Root id="column-output-type" bind:value={newOutputType}>
                <Select.Trigger>
                  <Select.DisplayValue />
                </Select.Trigger>
                <Select.Popover>
                  {outputType.map((type) => (
                    <Select.Item key={type}>
                      <Select.ItemLabel>{type}</Select.ItemLabel>
                      <Select.ItemIndicator>
                        <LuCheck class="h-4 w-4" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Popover>
              </Select.Root>

              <Label for="column-prompt">Prompt template</Label>
              <Textarea id="column-prompt" />

              <Label for="column-rows">Rows generated</Label>
              <Input
                id="column-rows"
                type="number"
                class="h-10"
                bind:value={rowsGenerated}
              />
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
