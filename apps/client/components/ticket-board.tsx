import { Ticket } from "@/types/ticket";
import { TicketCard } from "./ticket";

export function TicketBoard({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="grid md:grid-flow-col gap-x-4 overflow-x-scroll md:auto-cols-max">
      {Array.from([1, 2, 3, 4, 5, 6], (v) => (
        <div
          key={v}
          className="space-y-2 border border-t-0 border-b-0 border-gray-700 py-2"
        >
          <h1 className="text-3xl text-center">Task {v}</h1>
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
