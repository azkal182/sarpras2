import Link from "next/link";
import { asc } from "drizzle-orm";
import { ArrowUpRight, CalendarDays, Radio } from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { formatEventDate } from "@/lib/dates";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivateEventDialog } from "@/components/activate-event-dialog";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const { created } = await searchParams;
  const items = await db.select().from(events).orderBy(asc(events.eventDate));
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="retro-kicker text-accent">Manajemen event</p><h1 className="retro-title mt-3 text-5xl">Semua event.</h1></div><Link href="/admin/events/new" className={buttonVariants({ size: "lg" })}><ArrowUpRight size={17} />Event baru</Link></div>
    {created === "1" && <p role="status" className="mt-5 border-2 border-black bg-mint p-3 font-bold">Event berhasil dibuat.</p>}
    <div className="mt-8 grid gap-5 md:grid-cols-2">{items.length ? items.map((event, index) => <Card key={event.id} className={`border-3 p-5 shadow-md ${index % 3 === 0 ? "bg-mint" : index % 3 === 1 ? "bg-primary" : "bg-sky"}`}>
      <div className="flex items-start justify-between gap-3"><div><Badge className={event.isActive ? "h-auto bg-mint text-black" : "h-auto bg-coral text-black"}><Radio size={12} />{event.isActive ? "aktif" : "arsip"}</Badge><h2 className="mt-4 text-3xl font-black leading-none">{event.name}</h2></div><span className="font-mono text-xs font-black">#{String(index + 1).padStart(2, "0")}</span></div>
      <p className="mt-4 flex items-center gap-2 font-bold"><CalendarDays size={16} />{formatEventDate(event.eventDate)}</p><p className="mt-1 font-mono text-xs font-bold">/{event.slug}</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href={`/admin/events/${event.id}`} className={buttonVariants({ variant: "outline" })}>Kelola</Link>{!event.isActive && <ActivateEventDialog eventId={event.id} eventName={event.name} />}</div>
    </Card>) : <Card className="border-3 p-6 text-center font-bold shadow-md md:col-span-2">Belum ada event. Buat event pertama untuk memulai.</Card>}</div>
  </main>;
}
