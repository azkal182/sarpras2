import Link from "next/link";
import { MapPin, MessageSquare, PackageCheck, Pencil } from "lucide-react";
import { deleteRequest, toggleRequest } from "@/app/actions";
import { deadlineLabel } from "@/lib/dates";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { RequestDeleteButton } from "@/components/request-delete-button";

export function RequestCard({ request, eventDate, mode, eventSlug, divisionSlug, otherName, readOnly = false }: {
  request: { id: string; itemName: string; quantity: number; location: string | null; deadlineOffsetDays: number | null; note: string | null; isFulfilled: boolean; createdAt?: Date };
  eventDate: string;
  mode: "incoming" | "outgoing";
  eventSlug: string;
  divisionSlug: string;
  otherName: string;
  readOnly?: boolean;
}) {
  return <Card className="min-w-0 border-3 p-4 shadow-md sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="break-words text-xl font-black">{request.itemName}</p><p className="mt-1 text-sm font-bold">{mode === "incoming" ? `Dari ${otherName}` : `Minta ke ${otherName}`} · Jumlah {request.quantity}</p></div><StatusBadge fulfilled={request.isFulfilled} /></div>
    <div className="mt-4 grid gap-2 text-sm font-bold sm:grid-cols-2">
      {request.deadlineOffsetDays !== null && <span>{deadlineLabel(eventDate, request.deadlineOffsetDays)}</span>}
      {request.location && <span className="inline-flex items-center gap-1"><MapPin size={14} />{request.location}</span>}
      {request.note && <span className="inline-flex items-start gap-1 break-words sm:col-span-2"><MessageSquare className="shrink-0" size={14} />{request.note}</span>}
    </div>
    {request.createdAt && <p className="mt-4 text-xs font-bold text-muted-foreground">Diajukan {request.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" })}</p>}
    {mode === "incoming" && !readOnly && <form action={toggleRequest.bind(null, request.id, eventSlug, divisionSlug)}><Button variant={request.isFulfilled ? "outline" : "default"} className="mt-4 w-full sm:w-auto"><PackageCheck size={16} />{request.isFulfilled ? "Tandai belum terpenuhi" : "Tandai terpenuhi"}</Button></form>}
    {mode === "outgoing" && divisionSlug && !readOnly && !request.isFulfilled && <div className="mt-4 flex flex-wrap gap-2"><Link href={`/event/${eventSlug}/divisi/${divisionSlug}/request/${request.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}><Pencil size={14} />Edit</Link><RequestDeleteButton action={deleteRequest.bind(null, request.id, eventSlug, divisionSlug)} /></div>}
  </Card>;
}
