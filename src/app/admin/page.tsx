import Link from "next/link";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { ArrowUpRight, CalendarDays, ClipboardList, Layers3 } from "lucide-react";
import { db } from "@/db";
import { divisions, events, requests } from "@/db/schema";
import { formatEventDate } from "@/lib/dates";
import { requireAdmin } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminPage() {
  await requireAdmin();
  const allEvents = await db.select().from(events).orderBy(asc(events.eventDate));
  const active = allEvents.find((event) => event.isActive);
  const allDivisions = await db.select().from(divisions);
  const [{ total: requestCount }] = active ? await db.select({ total: count() }).from(requests).where(eq(requests.eventId, active.id)) : [{ total: 0 }];
  const [{ total: fulfilledCount }] = active ? await db.select({ total: count() }).from(requests).where(and(eq(requests.eventId, active.id), eq(requests.isFulfilled, true))) : [{ total: 0 }];
  const recent = active ? await db.select().from(requests).where(eq(requests.eventId, active.id)).orderBy(desc(requests.createdAt)).limit(5) : [];
  const divisionNames = new Map(allDivisions.map((division) => [division.id, division.name]));
  const activeDivisionCount = allDivisions.filter((division) => division.eventId === active?.id).length;
  const progress = requestCount ? Math.round(fulfilledCount / requestCount * 100) : 0;
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="retro-kicker text-orange-700">Command center</p><h1 className="retro-title mt-3 text-5xl sm:text-7xl">Halo, admin.</h1><p className="mt-4 max-w-xl font-bold">Pantau event, divisi, dan kebutuhan panitia dari satu tempat.</p></div>
      <Link href="/admin/events/new" className={buttonVariants({ size: "lg" })}><ArrowUpRight size={17} />Event baru</Link>
    </div>
    <section aria-label="Ringkasan" className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="border-3 bg-mint p-5 shadow-md"><Layers3 size={22} /><span className="retro-kicker">Event</span><strong className="text-4xl font-black">{allEvents.length}</strong></Card>
      <Card className="border-3 bg-sky p-5 shadow-md"><ClipboardList size={22} /><span className="retro-kicker">Divisi event aktif</span><strong className="text-4xl font-black">{activeDivisionCount}</strong></Card>
      <Card className="border-3 bg-white p-5 shadow-md"><ClipboardList size={22} /><span className="retro-kicker">Kebutuhan</span><strong className="text-4xl font-black">{requestCount}</strong></Card>
      <Card className="border-3 bg-coral p-5 shadow-md"><ClipboardList size={22} /><span className="retro-kicker">Belum terpenuhi</span><strong className="text-4xl font-black">{requestCount - fulfilledCount}</strong></Card>
      <Card className="border-3 bg-yellow-300 p-5 shadow-md"><ClipboardList size={22} /><span className="retro-kicker">Terpenuhi</span><strong className="text-4xl font-black">{fulfilledCount}</strong></Card>
    </section>
    <Card className="mt-8 border-3 bg-yellow-300 p-6 shadow-lg sm:p-8">
      <p className="retro-kicker">Event aktif sekarang</p><h2 className="mt-3 text-4xl font-black">{active?.name || "Belum ada event aktif"}</h2>
      {active && <p className="mt-2 flex items-center gap-2 font-bold"><CalendarDays size={17} />{formatEventDate(active.eventDate)}</p>}
      <div className="mt-5"><div className="flex justify-between gap-2 font-bold"><span>Progres request event aktif</span><span>{progress}%</span></div><div className="mt-2 h-5 border-2 border-black bg-white"><div className="h-full bg-mint" style={{ width: `${progress}%` }} /></div></div>
      <div className="mt-6 flex flex-wrap gap-2"><Link href="/admin/events" className={buttonVariants({ variant: "outline" })}>Kelola event <ArrowUpRight size={16} /></Link>{active && <><Link href={`/admin/events/${active.id}`} className={buttonVariants({ variant: "outline" })}>Kelola divisi</Link><Link href={`/admin/requests?event=${active.id}`} className={buttonVariants({ variant: "outline" })}>Lihat kebutuhan</Link></>}</div>
    </Card>
    <section className="mt-9">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="retro-title text-3xl">Request terbaru</h2><Link href="/admin/requests" className={buttonVariants({ variant: "outline" })}>Lihat semua</Link></div>
      <div className="mt-4 grid gap-3">{recent.length ? recent.map((item) => <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-3 p-4 shadow-md"><div><p className="text-lg font-black">{item.itemName} · {item.quantity}</p><p className="text-sm font-bold">{divisionNames.get(item.fromDivisionId)} → {divisionNames.get(item.toDivisionId)}</p></div><StatusBadge fulfilled={item.isFulfilled} /></Card>) : <Card className="border-3 p-5 font-bold shadow-md">Belum ada request.</Card>}</div>
    </section>
    <section className="mt-9"><h2 className="retro-title text-3xl">Event historis</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{allEvents.filter((event) => !event.isActive).slice(-4).reverse().map((event) => <Link key={event.id} href={`/admin/events/${event.id}`}><Card className="h-full border-3 p-4 shadow-md"><p className="text-lg font-black">{event.name}</p><p className="font-bold">{formatEventDate(event.eventDate)}</p></Card></Link>)}{allEvents.every((event) => event.isActive) && <Card className="border-3 p-4 font-bold shadow-md">Belum ada event historis.</Card>}</div></section>
  </main>;
}
