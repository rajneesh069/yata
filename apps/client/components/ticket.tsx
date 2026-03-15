"use client";

import { Ticket } from "@/types/ticket";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Check, Pencil, Trash2Icon, XIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Field,
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

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Ticket title must be at least 5 characters.")
    .max(50, "Ticket title must be at most 50 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(1000, "Description must be at most 1000 characters."),
  tags: z.array(z.string()),
});

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const [isBeingEdited, setIsBeingEdited] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: ticket.tags,
    },
  });
  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
    toast("Submitted");
    setIsBeingEdited(false);
    form.reset();
  }

  return (
    <Dialog>
      <Card className="border border-t border-b rounded-none max-w-[450px]">
        <CardHeader className="justify-start w-full underline">
          <DialogTrigger>{ticket.title}</DialogTrigger>
        </CardHeader>
        <CardDescription className="flex flex-wrap gap-1 px-2">
          {ticket.tags.map((t, idx) => (
            <Badge key={`${t}-${idx}`}>{t}</Badge>
          ))}
        </CardDescription>
        <CardContent>
          <p className="line-clamp-3">{ticket.description}</p>
        </CardContent>
      </Card>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        {isBeingEdited ? (
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
              <DialogHeader>
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
                          Tag Input
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
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                    </InputGroup>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        ) : (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle>{ticket.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-1">
                {ticket.tags.map((t) => (
                  <Badge key={nanoid()}>{t}</Badge>
                ))}
              </DialogDescription>
            </DialogHeader>
            <p>{ticket.description}</p>
          </>
        )}
        <DialogFooter>
          {isBeingEdited && (
            <Button type="submit" form="yata-task-editing-form">
              <Check />
            </Button>
          )}

          {isBeingEdited && (
            <Button onClick={() => setIsBeingEdited(false)}>
              <XIcon />
            </Button>
          )}

          {!isBeingEdited && (
            <Button
              onClick={() => {
                form.reset();
                setIsBeingEdited((prev) => !prev);
              }}
            >
              <Pencil />
            </Button>
          )}
          <Button>
            <Trash2Icon />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
