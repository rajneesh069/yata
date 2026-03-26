import z from "zod";

export const ProjectType = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  scopeId: z.uuid(),
  scope: z.enum(["PERSONAL", "ORG"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectType>;
