import z from "zod";
import { ScopeEnum } from "./enums";

export const WorkspaceType = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  scopeId: z.uuid(),
  scope: ScopeEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Workspace = z.infer<typeof WorkspaceType>;
