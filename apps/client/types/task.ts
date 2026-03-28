import z from "zod";
import { ScopeEnum } from "./enums";

export const TaskSchema = z.object({
  workspaceId: z.uuid(),
  ownerId: z.uuid(),
  scope: ScopeEnum,
  name: z.string().nonempty(), // has to be unique within a workspace,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof TaskSchema>;
