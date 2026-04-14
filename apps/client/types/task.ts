import z from "zod";

export const TaskSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  name: z.string().nonempty(), // has to be unique within a workspace,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof TaskSchema>;
