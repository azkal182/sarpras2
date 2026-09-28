"use client";
import { useActionState, useState } from "react";
import { createEvent, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, FormMessage } from "@/components/form-feedback";
import { slugify } from "@/lib/slug";

const initialState: FormState = { message: "", errors: {} };
export function EventForm({ event, action = createEvent }: {
  event?: { name: string; slug: string; eventDate: string };
  action?: (state: FormState, data: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [slug, setSlug] = useState(event?.slug || "");
  const [slugEdited, setSlugEdited] = useState(!!event);
  return <form action={formAction} className="space-y-5">
    <Label>Nama event<Input name="name" required defaultValue={state.values?.name ?? event?.name} onChange={(event) => { if (!slugEdited) setSlug(slugify(event.target.value)); }} placeholder="Wisuda 2026" aria-invalid={!!state.errors.name} /><FieldError state={state} name="name" /></Label>
    <Label>Slug<Input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} placeholder="wisuda-2026" aria-invalid={!!state.errors.slug} /><FieldError state={state} name="slug" /></Label>
    <p className="break-all text-xs font-bold text-muted-foreground">URL: /event/{slug || "slug-event"}</p>
    <Label>Tanggal event<Input name="eventDate" required type="date" defaultValue={state.values?.eventDate ?? event?.eventDate} aria-invalid={!!state.errors.eventDate} /><FieldError state={state} name="eventDate" /></Label>
    <FormMessage state={state} />
    <Button disabled={pending} size="lg" className="w-full">{pending ? "Menyimpan…" : "Simpan event"}</Button>
  </form>;
}
