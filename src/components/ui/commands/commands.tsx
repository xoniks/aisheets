import { component$, type QRL } from "@builder.io/qwik";
import {
  TbBolt,
  TbColumnInsertRight,
  TbColumns3,
  TbDownload,
  TbFilter,
  TbFold,
  TbPlayerPlay,
  TbRocket,
} from "@qwikest/icons/tablericons";
import { Button } from "~/components/ui";

interface Props {
  onAddColumn: QRL<() => void>;
}

export const Commands = component$<Props>(({ onAddColumn }) => {
  return (
    <div class="flex h-12 w-full items-center justify-between border-t">
      <div class="flex space-x-2">
        <Button size="sm" look="ghost" class="flex gap-1 font-light">
          <TbColumns3 />
          Columns
        </Button>
        <Button size="sm" look="ghost" class="flex gap-1 font-light">
          <TbFold />
          Row height
        </Button>
        <Button size="sm" look="ghost" class="flex gap-1 font-light">
          <TbFilter />
          Filter
        </Button>
      </div>
      <div class="flex space-x-2">
        <Button
          size="sm"
          look="outline"
          class="flex gap-1 font-light"
          onClick$={onAddColumn}
        >
          <TbColumnInsertRight />
          Add column
        </Button>

        <Button
          size="sm"
          look="outline"
          class="flex gap-1 border-purple-300 bg-purple-100 font-light"
        >
          <TbPlayerPlay />
          Run Prompt
        </Button>

        <Button
          size="sm"
          look="outline"
          class="flex gap-1 border-green-300 bg-green-100 font-light"
        >
          <TbBolt />
          Export from HF 🤗
        </Button>

        <Button
          size="sm"
          look="outline"
          class="flex gap-1 border-blue-300 bg-blue-100 font-light"
        >
          <TbRocket />
          Export to 🤗
        </Button>

        <Button size="sm" look="ghost" class="flex gap-1 font-light">
          <TbDownload />
        </Button>
      </div>
    </div>
  );
});
