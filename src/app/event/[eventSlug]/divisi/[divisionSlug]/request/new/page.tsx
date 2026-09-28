import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { divisions, events } from "@/db/schema";
import { createRequest } from "@/app/actions";
import { RequestForm } from "@/components/request-form";
import { DivisionNavigation } from "@/components/division-navigation";
import { BackLink } from "@/components/back-link";
import { Card } from "@/components/ui/card";

export default async function NewRequestPage({ params }: { params: Promise<{ eventSlug: string; divisionSlug: string }> }) {
  const { eventSlug, divisionSlug } = await params;
  const event = await db.query.events.findFirst({ where: and(eq(events.slug, eventSlug), eq(events.isActive, true)) });
  const source = event ? await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, event.id), eq(divisions.slug, divisionSlug)) }) : null;
  if (!event || !source) notFound();
  const allDivisions = await db.select({ id: divisions.id, name: divisions.name, slug: divisions.slug }).from(divisions).where(eq(divisions.eventId, event.id)).orderBy(asc(divisions.name));
  return <main className="retro-shell min-h-screen px-4 pb-28 pt-6 sm:px-8 md:pb-8">
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/event/${eventSlug}/divisi/${divisionSlug}`}>Kembali ke {source.name}</BackLink>
      <DivisionNavigation eventSlug={eventSlug} divisionSlug={divisionSlug} divisionNames={allDivisions} />
      <p className="retro-kicker mt-8 text-orange-700">Request baru</p>
      <h1 className="retro-title mt-3 text-5xl sm:text-7xl">Butuh apa?</h1>
      <p className="mt-4 max-w-xl font-bold">Isi singkat saja. Divisi tujuan akan melihat detail ini di inbox mereka.</p>
      <Card className="mt-8 border-3 p-5 shadow-lg sm:p-7"><RequestForm action={createRequest.bind(null, eventSlug, divisionSlug)} divisions={allDivisions.filter((target) => target.id !== source.id)} /></Card>
    </div>
  </main>;
}
