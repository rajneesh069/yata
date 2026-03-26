import { mockTickets } from "@/lib/mock/tickets";

export async function getAllTicketsForAProjectId(projectId: string) {
  await new Promise((resolve) => setTimeout(resolve, 2_000));
  return mockTickets.filter((ticket) => ticket.projectId === projectId);
}
