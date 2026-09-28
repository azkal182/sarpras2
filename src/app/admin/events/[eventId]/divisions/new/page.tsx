import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { createDivision } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { DivisionForm } from "@/components/division-form";
import { Card } from "@/components/ui/card";
import { db } from "@/db";
import { events } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function NewDivisionPage({ params }: { params: Promise<{ eventId: string }> }) {
  await requireAdmin();
  const { eventId } = await params;
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) notFound();
  return <main className="mx-auto max-w-xl px-5 py-10">
    <BackLink href={`/admin/events/${eventId}`}>Kembali ke {event.name}</BackLink>
    <h1 className="retro-title mt-7 text-5xl">Tambah divisi</h1>
    <Card className="mt-7 border-3 p-6 shadow-lg"><DivisionForm eventSlug={event.slug} action={createDivision.bind(null, eventId)} /></Card>
  </main>;
}
