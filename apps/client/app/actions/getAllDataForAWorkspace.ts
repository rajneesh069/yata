import { mockTickets } from "@/lib/mock/tickets";
import { Ticket } from "@/types/ticket";

export async function getAllDataForAWorkspace(
  workspaceId: string,
): Promise<Map<string, Ticket[]>> {
  if (!workspaceId) return new Map();
  await new Promise((resolve) => setTimeout(resolve, 3_000));
  const result: Map<string, Ticket[]> = new Map<string, Ticket[]>();

  for (const ticket of mockTickets) {
    if (ticket.workspaceId !== workspaceId) continue;
    if (!result.has(ticket.taskName)) {
      result.set(ticket.taskName, []);
    }
    result.get(ticket.taskName)?.push(ticket);
  }
  return result;
}
