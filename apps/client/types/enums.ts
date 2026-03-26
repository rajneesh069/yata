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

export const ScopeEnum = z.enum(["PERSONAL", "ORG"]);
