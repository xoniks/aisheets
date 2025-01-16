import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/ui/button/button";
import { Breadcrumb } from "~/components/ui/breadcrumb/breadcrumb";
import { TbPlus } from "@qwikest/icons/tablericons";

export const NavBar = component$(() => {
  return (
    <nav class="p-4">
      <div class="container mx-auto flex items-center justify-between">
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="/">Annotation</Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>

        <Button size="sm" class="flex items-center gap-1">
          <TbPlus />
          Create dataset
        </Button>
      </div>
    </nav>
  );
});
