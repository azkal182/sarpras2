import { DivisionRequestList } from "@/components/division-request-list";

export default async function OutgoingPage({ params, searchParams }: {
  params: Promise<{ eventSlug: string; divisionSlug: string }>;
  searchParams: Promise<{ status?: string; created?: string; updated?: string; deleted?: string }>;
}) {
  const { eventSlug, divisionSlug } = await params;
  const { status, created, updated, deleted } = await searchParams;
  return <DivisionRequestList eventSlug={eventSlug} divisionSlug={divisionSlug} mode="outgoing" status={status} created={created} notice={updated ? "Perubahan request berhasil disimpan." : deleted ? "Request berhasil dihapus." : undefined} />;
}
