import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { divisions, events, requests } from "@/db/schema";
import { updateRequest } from "@/app/actions";
import { RequestForm } from "@/components/request-form";
import { DivisionNavigation } from "@/components/division-navigation";
import { BackLink } from "@/components/back-link";
import { Card } from "@/components/ui/card";

export default async function EditRequestPage({ params }: { params: Promise<{ eventSlug: string; divisionSlug: string; requestId: string }> }) {
  const { eventSlug, divisionSlug, requestId } = await params;
  const event = await db.query.events.findFirst({ where: and(eq(events.slug, eventSlug), eq(events.isActive, true)) });
  const source = event ? await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, event.id), eq(divisions.slug, divisionSlug)) }) : null;
  const request = event && source ? await db.query.requests.findFirst({ where: and(eq(requests.id, requestId), eq(requests.eventId, event.id), eq(requests.fromDivisionId, source.id), eq(requests.isFulfilled, false)) }) : null;
  if (!event || !source || !request) notFound();
  const allDivisions = await db.select({ id: divisions.id, name: divisions.name, slug: divisions.slug }).from(divisions).where(eq(divisions.eventId, event.id)).orderBy(asc(divisions.name));
  return <main className="retro-shell min-h-screen px-4 pb-28 pt-6 sm:px-8 md:pb-8">
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/event/${eventSlug}/divisi/${divisionSlug}/diajukan`}>Kembali ke request</BackLink>
      <DivisionNavigation eventSlug={eventSlug} divisionSlug={divisionSlug} divisionNames={allDivisions} active="outgoing" />
      <p className="retro-kicker mt-8 text-accent">Edit request</p>
      <h1 className="retro-title mt-3 text-5xl sm:text-7xl">Perbarui kebutuhan.</h1>
      <p className="mt-4 max-w-xl font-bold">Perubahan akan langsung terlihat oleh divisi tujuan.</p>
      <Card className="mt-8 border-3 p-5 shadow-lg sm:p-7"><RequestForm action={updateRequest.bind(null, requestId, eventSlug, divisionSlug)} divisions={allDivisions.filter((target) => target.id !== source.id)} request={request} submitLabel="Simpan perubahan" /></Card>
    </div>
  </main>;
}
