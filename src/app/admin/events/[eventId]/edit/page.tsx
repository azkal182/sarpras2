import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateEvent } from "@/app/actions";
import { EventForm } from "@/components/event-form";
import { db } from "@/db";
import { events } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { BackLink } from "@/components/back-link";
import { Card } from "@/components/ui/card";

export default async function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  await requireAdmin();
  const { eventId } = await params;
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) notFound();
  return <main className="mx-auto max-w-xl px-5 py-10">
    <BackLink href={`/admin/events/${eventId}`}>Kembali ke event</BackLink>
    <h1 className="retro-title mt-7 text-5xl">Edit event</h1>
    <p className="mt-3 font-bold">Perubahan tanggal akan memengaruhi tanggal deadline request.</p>
    <Card className="mt-7 border-3 p-6 shadow-lg"><EventForm event={event} action={updateEvent.bind(null, eventId)} /></Card>
  </main>;
}
