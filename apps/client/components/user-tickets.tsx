import { mockTickets } from "@/lib/mock/tickets";
import { TicketBoard } from "./ticket-board";

export function UserTickets({ userId }: { userId: string }) {
  console.log({ userId });
  return (
    <div>
      <TicketBoard tickets={mockTickets} />
    </div>
  );
}
