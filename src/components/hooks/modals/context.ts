import { createContextId, type Signal } from "@builder.io/qwik";

export type ID = "addColumnModal" | "addColumnSidebar";
export type Status = "open" | "closed";

export type Modals = Record<ID, Status>;

export const modalsContext = createContextId<Signal<Modals>>("modals.context");

export const initialState: Modals = {
  addColumnModal: "closed",
  addColumnSidebar: "closed",
};
