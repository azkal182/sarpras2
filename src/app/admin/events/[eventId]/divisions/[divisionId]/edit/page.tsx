import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateDivision } from "@/app/actions";
import { DivisionForm } from "@/components/division-form";
import { db } from "@/db";
import { divisions, events } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { BackLink } from "@/components/back-link";
import { Card } from "@/components/ui/card";

export default async function EditDivisionPage({ params }: { params: Promise<{ eventId: string; divisionId: string }> }) {
  await requireAdmin();
  const { eventId, divisionId } = await params;
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  const division = await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, eventId), eq(divisions.id, divisionId)) });
  if (!event || !division) notFound();
  return <main className="mx-auto max-w-xl px-5 py-10">
    <BackLink href={`/admin/events/${eventId}`}>Kembali ke {event.name}</BackLink>
    <h1 className="retro-title mt-7 text-5xl">Edit divisi</h1>
    <p className="mt-3 font-bold">Mengubah slug akan mengubah alamat halaman divisi.</p>
    <Card className="mt-7 border-3 p-6 shadow-lg"><DivisionForm eventSlug={event.slug} action={updateDivision.bind(null, eventId, divisionId)} division={division} /></Card>
  </main>;
}
