"use client";

import { Ticket, TicketStatusEnum } from "@/types/ticket";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Check, MessagesSquare, Pencil, Trash2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputGroup,
  InputGroupTextarea,
} from "@workspace/ui/components/input-group";

import { TagInput } from "@workspace/ui/components/tag-input";

import * as z from "zod";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useRef, useState } from "react";

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()),
});

const isTouchOnly =
  typeof window !== "undefined" &&
  !window?.matchMedia("(pointer: fine)")?.matches;

const isMac = /Mac/i.test(navigator.userAgent ?? navigator.platform);

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined);
  const [openEditingForm, setOpenEditingForm] = useState<boolean>(false);

  return (
    <>
      <Dialog open={openEditingForm} onOpenChange={setOpenEditingForm}>
        <Card className="border border-t border-b rounded-none sm:max-w-[450px]">
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

function TicketEditDialog({ ticket }: { ticket: Ticket }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: ticket.tags,
    },
  });
  function onSubmit(data: z.infer<typeof formSchema>) {
    const patchedData: z.infer<typeof formSchema> = {
      title: data.title || ticket.title,
      description: data.description || ticket.description,
      tags: data.tags.length > 0 ? data.tags : ticket.tags,
    };
    console.log(patchedData);
    toast("Submitted");
    form.reset();
  }
  return (
    <DialogContent
      className="md:min-w-[calc(100vw-20px)] h-[calc(100vh-20px)]"
      onInteractOutside={(e) => e.preventDefault()}
      onCloseAutoFocus={() => {
        form.reset();
      }}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }
        }}
        id="yata-task-editing-form"
      >
        <FieldGroup>
          <DialogHeader className="space-y-2">
            <DialogTitle>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="yata-task-editing-form-title">
                      Title
                    </FieldLabel>
                    <Input
                      {...field}
                      id="yata-task-editing-form-title"
                      aria-invalid={fieldState.invalid}
                      placeholder={ticket.title}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </DialogTitle>
            <DialogDescription asChild>
              <Controller
                name="tags"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="yata-task-editing-form-tag-input">
                      Tags
                    </FieldLabel>
                    <TagInput
                      {...field}
                      id={"yata-task-editing-form-tag-input"}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </DialogDescription>
          </DialogHeader>
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="yata-task-editing-form-description">
                  Description
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="yata-task-editing-form-description"
                    placeholder={String(ticket.description)}
                    rows={6}
                    className="h-[50vh] md:h-[55vh] min-w-[80vw] resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                </InputGroup>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <FieldDescription>
                  {!isTouchOnly && (
                    <span className="justify-start">
                      Press {isMac ? "⌘" : "Ctrl"}+Enter to submit.
                    </span>
                  )}
                </FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <DialogFooter className="py-2 md:py-1">
        <Button type="submit" form="yata-task-editing-form">
          <Check />
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
