"use client";
import { useActionState } from "react";
import { Send } from "lucide-react";
import type { FormState } from "@/app/actions";
import { FieldError, FormMessage } from "@/components/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
const initialState: FormState = { message: "", errors: {} };
export function RequestForm({ action, divisions }: { action: (state: FormState, data: FormData) => Promise<FormState>; divisions: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2">
    <Label className="sm:col-span-2">Barang<Input name="itemName" required defaultValue={state.values?.itemName} placeholder="Contoh: Meja" aria-invalid={!!state.errors.itemName} /><FieldError state={state} name="itemName" /></Label>
    <Label>Jumlah<Input name="quantity" type="number" min="1" inputMode="numeric" required defaultValue={state.values?.quantity} placeholder="10" aria-invalid={!!state.errors.quantity} /><FieldError state={state} name="quantity" /></Label>
    <Label>Minta ke<NativeSelect name="toDivisionId" required defaultValue={state.values?.toDivisionId} aria-invalid={!!state.errors.toDivisionId}><NativeSelectOption value="">Pilih divisi</NativeSelectOption>{divisions.map((division) => <NativeSelectOption key={division.id} value={division.id}>{division.name}</NativeSelectOption>)}</NativeSelect><FieldError state={state} name="toDivisionId" /></Label>
    <Label className="sm:col-span-2">Lokasi (opsional)<Input name="location" defaultValue={state.values?.location} placeholder="Area Registrasi" /></Label>
    <Label>Deadline<NativeSelect name="deadlineOffsetDays" defaultValue={state.values?.deadlineOffsetDays}><NativeSelectOption value="">Tidak ada deadline</NativeSelectOption>{[0,1,3,7,14,30].map((day) => <NativeSelectOption key={day} value={day}>{day === 0 ? "Hari H" : `H-${day}`}</NativeSelectOption>)}</NativeSelect></Label>
    <Label>Catatan (opsional)<Textarea name="note" className="min-h-24" defaultValue={state.values?.note} placeholder="Keterangan tambahan" /></Label>
  </div><FormMessage state={state} /><Button disabled={pending} size="lg" className="w-full">{pending ? "Mengirim…" : "Ajukan permintaan"}<Send size={16} /></Button></form>;
}
