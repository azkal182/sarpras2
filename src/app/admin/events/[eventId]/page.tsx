import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { divisions, events, requests } from "@/db/schema";
import { formatEventDate } from "@/lib/dates";
import { requireAdmin } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BackLink } from "@/components/back-link";
import { ActivateEventDialog } from "@/components/activate-event-dialog";

export default async function EventAdminPage({ params, searchParams }: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ updated?: string; divisionCreated?: string; divisionUpdated?: string }>;
}) {
  await requireAdmin();
  const { eventId } = await params;
  const notice = await searchParams;
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) notFound();
  const items = await db.select().from(divisions).where(eq(divisions.eventId, event.id)).orderBy(asc(divisions.name));
  const [{ total }] = await db.select({ total: count() }).from(requests).where(eq(requests.eventId, event.id));
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <BackLink href="/admin/events">Semua event</BackLink>
    {(notice.updated || notice.divisionCreated || notice.divisionUpdated) && <p role="status" className="mt-5 border-2 border-black bg-mint p-3 font-bold">Perubahan berhasil disimpan.</p>}
    <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="retro-kicker text-accent">{event.isActive ? "Event aktif" : "Event historis"}</p><h1 className="retro-title mt-2 text-5xl">{event.name}</h1><p className="mt-2 font-bold">{formatEventDate(event.eventDate)} · {event.slug}</p></div>
      <div className="flex flex-wrap gap-3">
        <Link href={`/admin/events/${event.id}/edit`} className={buttonVariants({ variant: "outline" })}>Edit event</Link>
        {!event.isActive && <ActivateEventDialog eventId={event.id} eventName={event.name} />}
      </div>
    </div>
    <Card className="mt-8 border-3 bg-sky p-5 shadow-md"><p className="retro-kicker">Request event</p><p className="mt-2 text-3xl font-black">{total}</p><Link href={`/admin/requests?event=${event.id}`} className={buttonVariants({ variant: "outline", className: "mt-4" })}>Lihat semua request</Link></Card>
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="retro-title text-3xl">Divisi</h2><Link href={`/admin/events/${event.id}/divisions/new`} className={buttonVariants({ variant: "outline" })}>Tambah divisi</Link></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map((division) => <Card key={division.id} size="sm" className="border-3 p-4 shadow-md"><p className="text-xl font-black">{division.name}</p><p className="mt-1 text-sm font-bold">{division.slug}</p><Link href={`/admin/events/${event.id}/divisions/${division.id}/edit`} className={buttonVariants({ variant: "outline", className: "mt-4" })}>Edit divisi</Link></Card>)}</div>
    </section>
  </main>;
}
