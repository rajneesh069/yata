import { Ticket } from "@/types/ticket";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@workspace/ui/components/card";
import { Pencil, Trash2Icon } from "lucide-react";
import { nanoid } from "nanoid";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Card className="border border-t border-b rounded-none max-w-[450px]">
      <CardHeader>{ticket.title}</CardHeader>
      <CardDescription className="flex flex-wrap gap-1">
        {ticket.tags.map((t) => (
          <Badge key={nanoid()}>{t}</Badge>
        ))}
      </CardDescription>
      <CardContent>
        <p className="line-clamp-3">{ticket.description}</p>
      </CardContent>
      <CardAction className="w-full flex gap-2 justify-end">
        <Button>
          <Pencil />
        </Button>
        <Button>
          <Trash2Icon />
        </Button>
      </CardAction>
    </Card>
  );
}
