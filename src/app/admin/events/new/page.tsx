import { BackLink } from "@/components/back-link";
import { EventForm } from "@/components/event-form";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";

export default async function NewEventPage() {
  await requireAdmin();
  return <main className="mx-auto max-w-xl px-5 py-10">
    <BackLink href="/admin/events">Kembali ke event</BackLink>
    <h1 className="retro-title mt-7 text-5xl">Buat event</h1>
    <p className="mt-3 font-bold">Buat event lalu aktifkan saat siap digunakan panitia.</p>
    <Card className="mt-7 border-3 p-6 shadow-lg"><EventForm /></Card>
  </main>;
}
