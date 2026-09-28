import { DivisionRequestList } from "@/components/division-request-list";

export default async function OutgoingPage({ params, searchParams }: {
  params: Promise<{ eventSlug: string; divisionSlug: string }>;
  searchParams: Promise<{ status?: string; created?: string }>;
}) {
  const { eventSlug, divisionSlug } = await params;
  const { status, created } = await searchParams;
  return <DivisionRequestList eventSlug={eventSlug} divisionSlug={divisionSlug} mode="outgoing" status={status} created={created} />;
}
