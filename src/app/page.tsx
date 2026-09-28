import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ArrowUpRight, CalendarDays, Settings, Sparkles } from "lucide-react";
import { db } from "@/db";
import { divisions, events } from "@/db/schema";
import { formatEventDate } from "@/lib/dates";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  const event = await db.query.events.findFirst({ where: eq(events.isActive, true) });
  const eventDivisions = event ? await db.select().from(divisions).where(eq(divisions.eventId, event.id)).orderBy(asc(divisions.name)) : [];
  return <main className="retro-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8">
    <div className="mx-auto max-w-6xl">
      <header className="retro-nav -mx-4 -mt-5 mb-8 flex items-center justify-between gap-3 px-4 py-4 sm:-mx-8 sm:-mt-8 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center border-3 border-black bg-primary shadow-md"><Sparkles size={20} /></span><span className="min-w-0"><span className="retro-kicker block">SARPRAS</span><span className="font-black">Event Request System</span></span></Link>
        <Link href="/admin/login" className={buttonVariants({ variant: "outline" })}><Settings size={16} />Admin</Link>
      </header>
      <section className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div><p className="retro-kicker text-accent">Panitia lebih siap</p><h1 className="retro-title mt-4 text-5xl sm:text-7xl">Barang event.<br /><span className="bg-primary px-2">Tanpa drama.</span></h1><p className="mt-6 max-w-xl text-lg font-bold leading-7">Ajukan kebutuhan antar divisi, pantau statusnya, dan selesaikan pekerjaan lapangan dari satu layar.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#pilih-divisi" className={buttonVariants({ size: "lg" })}>Mulai kelola <ArrowUpRight size={17} /></a><Badge variant="outline" className="h-auto px-3">Mobile first</Badge></div></div>
        {event ? <Card className="border-3 bg-coral p-5 shadow-lg sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="retro-kicker">Event aktif</p><h2 className="mt-3 text-4xl font-black leading-none sm:text-5xl">{event.name}</h2></div><Badge className="h-auto bg-mint px-3 text-black">LIVE</Badge></div><p className="mt-6 flex items-center gap-2 font-black"><CalendarDays size={18} />{formatEventDate(event.eventDate)}</p><div className="mt-8 border-t-3 border-black pt-5"><p className="retro-kicker">{eventDivisions.length} divisi siap bekerja</p><div id="pilih-divisi" className="mt-3 grid gap-3 sm:grid-cols-2">{eventDivisions.map((division) => <Link key={division.id} href={`/event/${event.slug}/divisi/${division.slug}`} className={buttonVariants({ variant: "outline", className: "h-auto min-h-14 justify-between bg-card py-3" })}>{division.name}<ArrowUpRight size={18} /></Link>)}</div></div></Card> : <Card className="border-3 bg-primary p-7 shadow-lg"><p className="retro-kicker">Status sistem</p><h2 className="mt-3 text-4xl font-black">Belum ada event aktif.</h2><p className="mt-4 font-bold">Admin dapat menyiapkan event pertama dari dashboard.</p><Link href="/admin/login" className={buttonVariants({ variant: "outline", className: "mt-7" })}>Buka dashboard <ArrowUpRight size={17} /></Link></Card>}
      </section>
      <footer className="mt-16 border-t-3 border-black pt-4 text-xs font-black uppercase tracking-wider">Sarpras Event · dibuat untuk ritme kerja panitia</footer>
    </div>
  </main>;
}
