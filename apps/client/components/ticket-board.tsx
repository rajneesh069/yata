import { Ticket } from "@/types/ticket";
import { TicketCard } from "./ticket";

export function TicketBoard({ data }: { data: Map<string, Ticket[]> }) {
  return (
    <div className="grid md:grid-flow-col gap-x-4 overflow-x-auto md:auto-cols-max h-[90vh]">
      {Array.from(data).map(([taskName, tickets]) => (
        <div
          key={taskName}
          className="space-y-2 border border-t-0 border-b-0 border-gray-700 py-2"
        >
          <h1 className="text-3xl text-center">{taskName}</h1>
          <div className="space-y-2 overflow-y-auto max-h-[75vh] md:max-h-[85vh] ">
            {tickets.map((ticket) => (
              <TicketCard ticket={ticket} key={ticket.id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
