"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions";
import { FieldError, FormMessage } from "@/components/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/slug";

const initialState: FormState = { message: "", errors: {} };
export function DivisionForm({ action, division, eventSlug }: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  division?: { name: string; slug: string };
  eventSlug: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [slug, setSlug] = useState(division?.slug || "");
  const [slugEdited, setSlugEdited] = useState(!!division);
  return <form action={formAction} className="space-y-5">
    <Label>Nama divisi<Input name="name" required defaultValue={state.values?.name ?? division?.name} onChange={(event) => { if (!slugEdited) setSlug(slugify(event.target.value)); }} placeholder="Perlengkapan" aria-invalid={!!state.errors.name} /><FieldError state={state} name="name" /></Label>
    <Label>Slug<Input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} placeholder="perlengkapan" aria-invalid={!!state.errors.slug} /><FieldError state={state} name="slug" /></Label>
    <p className="break-all text-xs font-bold text-muted-foreground">URL: /event/{eventSlug}/divisi/{slug || "slug-divisi"}</p>
    <FormMessage state={state} />
    <Button disabled={pending} size="lg" className="w-full">{pending ? "Menyimpan…" : "Simpan divisi"}</Button>
  </form>;
}
