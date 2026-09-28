import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowUpRight, CalendarDays, ChevronRight } from "lucide-react";
import { db } from "@/db";
import { divisions, events } from "@/db/schema";
import { formatEventDate } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default async function EventPage({ params }: { params: Promise<{ eventSlug: string }> }) {
  const { eventSlug } = await params;
  const event = await db.query.events.findFirst({ where: eq(events.slug, eventSlug) });
  if (!event) notFound();
  const items = await db.select().from(divisions).where(eq(divisions.eventId, event.id)).orderBy(asc(divisions.name));
  return <main className="retro-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8">
    <div className="mx-auto max-w-5xl">
      <Link href="/" className={buttonVariants({ variant: "outline" })}><ChevronRight className="rotate-180" size={14} />Beranda</Link>
      <section className="mt-8 grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-end">
        <div><Badge className={event.isActive ? "h-auto bg-mint px-3 text-black" : "h-auto bg-coral px-3 text-black"}>{event.isActive ? "Event aktif" : "Historis · baca saja"}</Badge><h1 className="retro-title mt-5 text-6xl sm:text-8xl">{event.name}</h1><p className="mt-5 flex items-center gap-2 font-black"><CalendarDays size={18} />{formatEventDate(event.eventDate)}</p></div>
        <Card className="border-3 bg-sky p-6 shadow-lg"><p className="retro-kicker">Pilih ruang kerja</p><p className="mt-2 text-2xl font-black">Setiap divisi bisa mengajukan dan menerima.</p><p className="mt-3 font-bold">Tidak ada peran requester/receiver yang kaku.</p></Card>
      </section>
      <section className="mt-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="retro-kicker text-orange-700">Divisi</p><h2 className="mt-2 text-3xl font-black">Mau masuk ke mana?</h2></div><Badge variant="outline" className="h-auto px-3">{items.length} pilihan</Badge></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{items.map((division, index) => <Link key={division.id} href={`/event/${eventSlug}/divisi/${division.slug}`} className="block"><Card className={`flex h-full flex-row items-center justify-between border-3 p-5 shadow-md ${index % 3 === 0 ? "bg-yellow-300" : index % 3 === 1 ? "bg-mint" : "bg-coral"}`}><span><span className="mb-2 block font-mono text-xs font-black">0{index + 1}</span><span className="text-xl font-black">{division.name}</span></span><ArrowUpRight size={22} /></Card></Link>)}</div>
      </section>
    </div>
  </main>;
}
