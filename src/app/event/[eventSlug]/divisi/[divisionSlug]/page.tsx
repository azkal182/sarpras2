import Link from "next/link";
import { and, asc, count, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CalendarDays, Plus } from "lucide-react";
import { db } from "@/db";
import { divisions, events, requests } from "@/db/schema";
import { formatEventDate } from "@/lib/dates";
import { DivisionNavigation } from "@/components/division-navigation";
import { RequestCard } from "@/components/request-card";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/back-link";

export default async function DivisionPage({ params }: { params: Promise<{ eventSlug: string; divisionSlug: string }> }) {
  const { eventSlug, divisionSlug } = await params;
  const event = await db.query.events.findFirst({ where: eq(events.slug, eventSlug) });
  const division = event ? await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, event.id), eq(divisions.slug, divisionSlug)) }) : null;
  if (!event || !division) notFound();
  const allDivisions = await db.select().from(divisions).where(eq(divisions.eventId, event.id)).orderBy(asc(divisions.name));
  const names = new Map(allDivisions.map((item) => [item.id, item.name]));
  const [incoming] = await db.select({ total: count() }).from(requests).where(and(eq(requests.eventId, event.id), eq(requests.toDivisionId, division.id), eq(requests.isFulfilled, false)));
  const [outgoing] = await db.select({ total: count() }).from(requests).where(and(eq(requests.eventId, event.id), eq(requests.fromDivisionId, division.id), eq(requests.isFulfilled, false)));
  const attention = await db.select().from(requests).where(and(eq(requests.eventId, event.id), eq(requests.toDivisionId, division.id), eq(requests.isFulfilled, false))).orderBy(sql`${requests.deadlineOffsetDays} desc nulls last`, asc(requests.createdAt)).limit(3);
  return <main className="retro-shell min-h-screen px-4 pb-28 pt-5 sm:px-8 md:pb-8">
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <BackLink href={`/event/${eventSlug}`}>{event.name}</BackLink>
        <Badge className={event.isActive ? "bg-mint text-black" : "bg-coral text-black"}>{event.isActive ? "Event aktif" : "Arsip · baca saja"}</Badge>
      </header>
      <DivisionNavigation eventSlug={eventSlug} divisionSlug={divisionSlug} divisionNames={allDivisions} active="home" />
      <section className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="retro-kicker text-accent">Ruang kerja divisi</p><h1 className="retro-title mt-3 text-5xl sm:text-7xl">{division.name}</h1><p className="mt-4 flex items-center gap-2 font-bold"><CalendarDays size={17} />{event.name} · {formatEventDate(event.eventDate)}</p></div>
        {event.isActive && <Link href={`/event/${eventSlug}/divisi/${divisionSlug}/request/new`} className={buttonVariants({ size: "lg" })}><Plus size={18} />Ajukan kebutuhan</Link>}
      </section>
      <section aria-label="Ringkasan request belum terpenuhi" className="mt-9 grid gap-4 sm:grid-cols-2">
        <Link href={`/event/${eventSlug}/divisi/${divisionSlug}/masuk`} className="block"><Card className="h-full border-3 bg-mint p-5 shadow-md"><p className="retro-kicker">Masuk · belum terpenuhi</p><p className="mt-3 text-5xl font-black">{incoming.total}</p><p className="mt-2 font-bold">Permintaan untuk divisi ini</p></Card></Link>
        <Link href={`/event/${eventSlug}/divisi/${divisionSlug}/diajukan`} className="block"><Card className="h-full border-3 bg-sky p-5 shadow-md"><p className="retro-kicker">Diajukan · belum terpenuhi</p><p className="mt-3 text-5xl font-black">{outgoing.total}</p><p className="mt-2 font-bold">Kebutuhan yang diajukan divisi ini</p></Card></Link>
      </section>
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="retro-kicker text-accent">Prioritas</p><h2 className="retro-title mt-2 text-3xl">Perlu perhatian</h2></div><Link href={`/event/${eventSlug}/divisi/${divisionSlug}/masuk`} className={buttonVariants({ variant: "outline" })}>Lihat semua</Link></div>
        <div className="mt-4 grid gap-4">{attention.length ? attention.map((item) => <RequestCard key={item.id} request={item} eventDate={event.eventDate} mode="incoming" eventSlug={eventSlug} divisionSlug={divisionSlug} otherName={names.get(item.fromDivisionId) || "Divisi lain"} readOnly={!event.isActive} />) : <Card className="border-3 p-5 font-bold shadow-md">Tidak ada permintaan yang menunggu.</Card>}</div>
      </section>
    </div>
  </main>;
}
