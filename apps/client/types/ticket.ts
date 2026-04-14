import z from "zod";
import { TicketStatusEnum } from "./enums";

export const TicketSchema = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  title: z.string().nonempty(),
  description: z.string().nullable(),
  raisedById: z.uuid(),
  status: TicketStatusEnum,
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Ticket = z.infer<typeof TicketSchema>;
