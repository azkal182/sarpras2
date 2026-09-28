import { DivisionRequestList } from "@/components/division-request-list";

export default async function IncomingPage({ params, searchParams }: {
  params: Promise<{ eventSlug: string; divisionSlug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { eventSlug, divisionSlug } = await params;
  const { status } = await searchParams;
  return <DivisionRequestList eventSlug={eventSlug} divisionSlug={divisionSlug} mode="incoming" status={status} />;
}
