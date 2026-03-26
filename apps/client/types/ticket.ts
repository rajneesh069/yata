import z from "zod";
import { TicketStatusEnum } from "./enums";

export const TicketType = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  taskName: z.string().nonempty(),
  title: z.string().nonempty(),
  description: z.string().nullable(),
  raisedById: z.uuid(),
  status: TicketStatusEnum,
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Ticket = z.infer<typeof TicketType>;
