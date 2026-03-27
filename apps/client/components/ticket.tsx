"use client";

import { Ticket } from "@/types/ticket";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Dialog, DialogTrigger } from "@workspace/ui/components/dialog";
import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { MessagesSquare, Pencil, Trash2Icon } from "lucide-react";
import { TicketStatusEnum } from "@/types/enums";
import { TicketEditDialog } from "./edit-ticket";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined);
  const [openEditingForm, setOpenEditingForm] = useState<boolean>(false);

  return (
    <>
      <Dialog open={openEditingForm} onOpenChange={setOpenEditingForm}>
        <Card className="border border-t border-b rounded-none max-w-[320px] md:min-w-[400px]">
          <CardHeader className="justify-start w-full">
            <p>{ticket.title}</p>
          </CardHeader>
          <CardDescription className="flex flex-wrap gap-1 px-2">
            {ticket.tags.map((t, idx) => (
              <Badge key={`${t}-${idx}`}>{t}</Badge>
            ))}
          </CardDescription>
          <CardContent>
            <p className="line-clamp-3">{ticket.description}</p>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Select
              onValueChange={(v) => {
                if (v === ticket.status) {
                  return;
                }
                if (timeoutId.current) {
                  clearTimeout(timeoutId.current);
                }
                timeoutId.current = setTimeout(() => {
                  console.log(v);
                }, 200);
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={ticket.status
                    .split("_")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                    )
                    .join(" ")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Ticket Status</SelectLabel>
                  {TicketStatusEnum.options.map((option) => (
                    <SelectItem value={option} key={option}>
                      {option
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase(),
                        )
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button variant={"outline"} size={"icon"}>
              <MessagesSquare />
            </Button>
            <DialogTrigger asChild>
              <Button size={"icon"} variant={"outline"}>
                <Pencil />
              </Button>
            </DialogTrigger>
            <Button variant={"outline"} size={"icon"}>
              <Trash2Icon />
            </Button>
          </CardFooter>
        </Card>
        {openEditingForm && <TicketEditDialog ticket={ticket} />}
      </Dialog>
    </>
  );
}
