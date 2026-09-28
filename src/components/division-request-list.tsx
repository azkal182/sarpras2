import Link from "next/link";
import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { divisions, events, requests } from "@/db/schema";
import { DivisionNavigation } from "@/components/division-navigation";
import { RequestCard } from "@/components/request-card";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/back-link";

export async function DivisionRequestList({ eventSlug, divisionSlug, mode, status, created }: {
  eventSlug: string;
  divisionSlug: string;
  mode: "incoming" | "outgoing";
  status?: string;
  created?: string;
}) {
  const event = await db.query.events.findFirst({ where: eq(events.slug, eventSlug) });
  const division = event ? await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, event.id), eq(divisions.slug, divisionSlug)) }) : null;
  if (!event || !division) notFound();
  const allDivisions = await db.select().from(divisions).where(eq(divisions.eventId, event.id)).orderBy(asc(divisions.name));
  const names = new Map(allDivisions.map((item) => [item.id, item.name]));
  const filter = status === "open" || status === "done" ? status : "all";
  const conditions: SQL[] = [eq(requests.eventId, event.id), eq(mode === "incoming" ? requests.toDivisionId : requests.fromDivisionId, division.id)];
  if (filter === "open") conditions.push(eq(requests.isFulfilled, false));
  if (filter === "done") conditions.push(eq(requests.isFulfilled, true));
  const items = await db.select().from(requests).where(and(...conditions)).orderBy(asc(requests.isFulfilled), sql`${requests.deadlineOffsetDays} desc nulls last`, desc(requests.createdAt));
  const base = `/event/${eventSlug}/divisi/${divisionSlug}`;
  return <main className="retro-shell min-h-screen px-4 pb-28 pt-5 sm:px-8 md:pb-8">
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <BackLink href={`/event/${eventSlug}`}>{event.name}</BackLink>
        <Badge className={event.isActive ? "bg-mint text-black" : "bg-coral text-black"}>{event.isActive ? "Event aktif" : "Arsip · baca saja"}</Badge>
      </header>
      <DivisionNavigation eventSlug={eventSlug} divisionSlug={divisionSlug} divisionNames={allDivisions} active={mode} />
      <p className="retro-kicker mt-8 text-accent">{mode === "incoming" ? "Inbox divisi" : "Request divisi"}</p>
      <h1 className="retro-title mt-3 text-5xl">{mode === "incoming" ? "Permintaan masuk." : "Yang diajukan."}</h1>
      <p className="mt-4 font-bold">{mode === "incoming" ? `Kebutuhan dari divisi lain untuk dipenuhi oleh ${division.name}.` : `Semua kebutuhan yang diajukan oleh ${division.name}.`}</p>
      {!event.isActive && <Card className="mt-5 border-3 bg-coral p-4 font-bold shadow-md">Event ini telah diarsipkan. Semua request hanya dapat dibaca.</Card>}
      {created === "1" && <p role="status" className="mt-5 border-2 border-black bg-mint p-3 font-bold">Permintaan berhasil diajukan.</p>}
      <nav aria-label="Filter status" className="mt-6 flex flex-wrap gap-2">
        {([["all", "Semua"], ["open", "Belum"], ["done", "Selesai"]] as const).map(([value, label]) => <Link key={value} aria-current={filter === value ? "page" : undefined} href={`${base}/${mode === "incoming" ? "masuk" : "diajukan"}${value === "all" ? "" : `?status=${value}`}`} className={buttonVariants({ variant: filter === value ? "default" : "outline" })}>{label}</Link>)}
      </nav>
      <div className="mt-6 space-y-5">{items.length ? items.map((item) => <RequestCard key={item.id} request={item} eventDate={event.eventDate} mode={mode} eventSlug={eventSlug} divisionSlug={divisionSlug} otherName={names.get(mode === "incoming" ? item.fromDivisionId : item.toDivisionId) || "Divisi lain"} readOnly={!event.isActive} />) : <Card className="border-3 p-6 text-center font-bold shadow-md">Belum ada permintaan untuk filter ini.</Card>}</div>
    </div>
  </main>;
}
