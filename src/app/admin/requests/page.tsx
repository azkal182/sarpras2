import Link from "next/link";
import { and, asc, desc, eq, ilike, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { divisions, events, requests } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { RequestCard } from "@/components/request-card";
import { buttonVariants } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Filters = { event?: string; status?: string; division?: string; from?: string; search?: string };
export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<Filters> }) {
  await requireAdmin();
  const params = await searchParams;
  const allEvents = await db.select().from(events).orderBy(desc(events.eventDate));
  const allDivisions = await db.select().from(divisions).orderBy(asc(divisions.name));
  const selectedEvent = allEvents.find((item) => item.id === params.event);
  const selectedDivision = allDivisions.find((item) => item.id === params.division && (!selectedEvent || item.eventId === selectedEvent.id));
  const selectedSource = allDivisions.find((item) => item.id === params.from && (!selectedEvent || item.eventId === selectedEvent.id));
  const search = params.search?.trim().slice(0, 100) || "";
  const status = params.status === "open" || params.status === "done" ? params.status : "all";
  const conditions: SQL[] = [];
  if (selectedEvent) conditions.push(eq(requests.eventId, selectedEvent.id));
  if (selectedDivision) conditions.push(eq(requests.toDivisionId, selectedDivision.id));
  if (selectedSource) conditions.push(eq(requests.fromDivisionId, selectedSource.id));
  if (search) conditions.push(ilike(requests.itemName, `%${search}%`));
  if (status === "open") conditions.push(eq(requests.isFulfilled, false));
  if (status === "done") conditions.push(eq(requests.isFulfilled, true));
  const items = await db.select().from(requests).where(conditions.length ? and(...conditions) : undefined).orderBy(asc(requests.isFulfilled), sql`${requests.deadlineOffsetDays} desc nulls last`, desc(requests.createdAt));
  const divisionNames = new Map(allDivisions.map((item) => [item.id, item.name]));
  const eventNames = new Map(allEvents.map((item) => [item.id, item]));
  const statusHref = (value: string) => {
    const query = new URLSearchParams();
    if (selectedEvent) query.set("event", selectedEvent.id);
    if (selectedDivision) query.set("division", selectedDivision.id);
    if (selectedSource) query.set("from", selectedSource.id);
    if (search) query.set("search", search);
    if (value !== "all") query.set("status", value);
    return `/admin/requests?${query}`;
  };
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <p className="retro-kicker text-orange-700">Pengawasan admin</p>
    <h1 className="retro-title mt-3 text-5xl">Semua request.</h1>
    <p className="mt-4 font-bold">Pantau kebutuhan lintas event dan divisi dari satu tempat.</p>
    <Card className="mt-7 border-3 p-5 shadow-lg"><form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
      <Label>Event<NativeSelect name="event" defaultValue={selectedEvent?.id || ""}><NativeSelectOption value="">Semua event</NativeSelectOption>{allEvents.map((event) => <NativeSelectOption key={event.id} value={event.id}>{event.name}</NativeSelectOption>)}</NativeSelect></Label>
      <Label>Divisi asal<NativeSelect name="from" defaultValue={selectedSource?.id || ""}><NativeSelectOption value="">Semua divisi</NativeSelectOption>{allDivisions.filter((division) => !selectedEvent || division.eventId === selectedEvent.id).map((division) => <NativeSelectOption key={division.id} value={division.id}>{division.name}</NativeSelectOption>)}</NativeSelect></Label>
      <Label>Divisi tujuan<NativeSelect name="division" defaultValue={selectedDivision?.id || ""}><NativeSelectOption value="">Semua divisi</NativeSelectOption>{allDivisions.filter((division) => !selectedEvent || division.eventId === selectedEvent.id).map((division) => <NativeSelectOption key={division.id} value={division.id}>{division.name}</NativeSelectOption>)}</NativeSelect></Label>
      <Label>Cari barang<Input name="search" defaultValue={search} placeholder="Nama barang" /></Label>
      {status !== "all" && <input type="hidden" name="status" value={status} />}
      <Button>Filter</Button>
    </form></Card>
    <nav aria-label="Filter status" className="mt-6 flex flex-wrap gap-2">
      {([["all", "Semua"], ["open", "Belum"], ["done", "Selesai"]] as const).map(([value, label]) => <Link key={value} aria-current={status === value ? "page" : undefined} href={statusHref(value)} className={buttonVariants({ variant: status === value ? "default" : "outline" })}>{label}</Link>)}
    </nav>
    <p className="mt-6 font-bold">{items.length} request ditemukan</p>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">{items.length ? items.map((item) => {
      const event = eventNames.get(item.eventId);
      return <div key={item.id}><p className="mb-2 text-sm font-black">{event?.name} · {divisionNames.get(item.fromDivisionId)} → {divisionNames.get(item.toDivisionId)}</p><RequestCard request={item} eventDate={event?.eventDate || ""} mode="outgoing" eventSlug={event?.slug || ""} divisionSlug="" otherName={divisionNames.get(item.toDivisionId) || "Divisi tujuan"} /></div>;
    }) : <Card className="border-3 p-6 text-center font-bold shadow-md lg:col-span-2">Belum ada request untuk filter ini.</Card>}</div>
  </main>;
}
