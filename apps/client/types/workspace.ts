import z from "zod";
import { ScopeEnum } from "./enums";

export const WorkspaceSchema = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  ownerId: z.uuid(),
  orgId: z.uuid().nullable(),
  scope: ScopeEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
