import { mockTasks } from "@/lib/mock/tasks";
import { mockTickets } from "@/lib/mock/tickets";
import { Ticket } from "@/types/ticket";

export async function getAllDataForAWorkspace(
  workspaceId: string,
): Promise<Map<string, Ticket[]>> {
  if (!workspaceId) return new Map();
  await new Promise((resolve) => setTimeout(resolve, 3_000));
  const result: Map<string, Ticket[]> = new Map<string, Ticket[]>();

  for (const task of mockTasks) {
    if (task.workspaceId !== workspaceId) continue;
    result.set(
      task.name,
      mockTickets.filter((ticket) => ticket.taskId === task.id),
    );
  }

  return result;
}
