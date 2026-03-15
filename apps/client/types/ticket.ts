import z from "zod";

export const TicketStatusEnum = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "REVIEW_PENDING",
  "IN_REVIEW",
  "REVIEW_APPROVED",
  "REVIEW_REJECTED",
  "MERGE_APPROVED",
  "CLOSED",
]);

export const TicketType = z.object({
  id: z.uuid(),
  title: z.string().nonempty(),
  description: z.string().optional(),
  raisedById: z.uuid(),
  status: TicketStatusEnum,
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Ticket = z.infer<typeof TicketType>;
