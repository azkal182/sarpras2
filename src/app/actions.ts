"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { auth, signOut } from "@/auth";
import { divisions, events, requests } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { divisionSchema, eventSchema, requestSchema } from "@/lib/validation";

export type FormState = { message: string; errors: Record<string, string[]>; values?: Record<string, string> };
const valuesFrom = (formData: FormData) => Object.fromEntries([...formData.entries()].filter((entry): entry is [string, string] => !entry[0].startsWith("$ACTION") && typeof entry[1] === "string"));
const invalid = (error: z.ZodError, formData: FormData): FormState => ({
  message: "Periksa kembali kolom yang ditandai.",
  errors: error.flatten().fieldErrors as Record<string, string[]>,
  values: valuesFrom(formData),
});

async function assertAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
}

export async function logoutAdmin() {
  await signOut({ redirectTo: "/" });
}

export async function createRequest(eventSlug: string, divisionSlug: string, _state: FormState, formData: FormData): Promise<FormState> {
  const event = await db.query.events.findFirst({ where: and(eq(events.slug, eventSlug), eq(events.isActive, true)) });
  const source = event ? await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, event.id), eq(divisions.slug, divisionSlug)) }) : null;
  if (!event || !source) return { message: "Event atau divisi tidak aktif. Muat ulang halaman.", errors: {} };
  const parsed = requestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  const destination = await db.query.divisions.findFirst({ where: and(eq(divisions.id, parsed.data.toDivisionId), eq(divisions.eventId, event.id)) });
  if (!destination || destination.id === source.id) return { message: "Pilih divisi tujuan yang berbeda.", errors: { toDivisionId: ["Divisi tujuan tidak valid."] }, values: valuesFrom(formData) };
  await db.insert(requests).values({ eventId: event.id, fromDivisionId: source.id, toDivisionId: destination.id, itemName: parsed.data.itemName, quantity: parsed.data.quantity, location: parsed.data.location || null, deadlineOffsetDays: parsed.data.deadlineOffsetDays, note: parsed.data.note || null });
  revalidatePath(`/event/${eventSlug}/divisi/${divisionSlug}`);
  revalidatePath(`/event/${eventSlug}/divisi/${destination.slug}/masuk`);
  redirect(`/event/${eventSlug}/divisi/${divisionSlug}/diajukan?created=1`);
}

export async function toggleRequest(requestId: string, eventSlug: string, divisionSlug: string) {
  const event = await db.query.events.findFirst({ where: and(eq(events.slug, eventSlug), eq(events.isActive, true)) });
  if (!event) throw new Error("Event tidak aktif.");
  const destination = await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, event.id), eq(divisions.slug, divisionSlug)) });
  if (!destination) throw new Error("Divisi tidak ditemukan.");
  const request = await db.query.requests.findFirst({ where: and(eq(requests.id, requestId), eq(requests.eventId, event.id), eq(requests.toDivisionId, destination.id)) });
  if (!request) throw new Error("Permintaan tidak ditemukan.");
  await db.update(requests).set({
    isFulfilled: sql`not ${requests.isFulfilled}`,
    fulfilledAt: sql`case when ${requests.isFulfilled} then null else now() end`,
    updatedAt: new Date(),
  }).where(and(eq(requests.id, requestId), eq(requests.eventId, event.id), eq(requests.toDivisionId, destination.id)));
  revalidatePath(`/event/${eventSlug}/divisi/${divisionSlug}/masuk`);
  revalidatePath(`/event/${eventSlug}/divisi/${divisionSlug}`);
  const source = await db.query.divisions.findFirst({ where: eq(divisions.id, request.fromDivisionId) });
  if (source) revalidatePath(`/event/${eventSlug}/divisi/${source.slug}/diajukan`);
}

export async function updateRequest(requestId: string, eventSlug: string, divisionSlug: string, _state: FormState, formData: FormData): Promise<FormState> {
  const event = await db.query.events.findFirst({ where: and(eq(events.slug, eventSlug), eq(events.isActive, true)) });
  const source = event ? await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, event.id), eq(divisions.slug, divisionSlug)) }) : null;
  const request = event && source ? await db.query.requests.findFirst({ where: and(eq(requests.id, requestId), eq(requests.eventId, event.id), eq(requests.fromDivisionId, source.id)) }) : null;
  if (!event || !source || !request) return { message: "Permintaan tidak ditemukan atau event tidak aktif.", errors: {} };
  if (request.isFulfilled) return { message: "Permintaan yang sudah terpenuhi tidak dapat diedit.", errors: {} };
  const parsed = requestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  const destination = await db.query.divisions.findFirst({ where: and(eq(divisions.id, parsed.data.toDivisionId), eq(divisions.eventId, event.id)) });
  if (!destination || destination.id === source.id) return { message: "Pilih divisi tujuan yang berbeda.", errors: { toDivisionId: ["Divisi tujuan tidak valid."] }, values: valuesFrom(formData) };
  const previousDestination = request.toDivisionId === destination.id ? null : await db.query.divisions.findFirst({ where: eq(divisions.id, request.toDivisionId) });
  await db.update(requests).set({ toDivisionId: destination.id, itemName: parsed.data.itemName, quantity: parsed.data.quantity, location: parsed.data.location || null, deadlineOffsetDays: parsed.data.deadlineOffsetDays, note: parsed.data.note || null, updatedAt: new Date() }).where(and(eq(requests.id, requestId), eq(requests.eventId, event.id), eq(requests.fromDivisionId, source.id), eq(requests.isFulfilled, false)));
  revalidatePath(`/event/${eventSlug}/divisi/${divisionSlug}`);
  revalidatePath(`/event/${eventSlug}/divisi/${divisionSlug}/diajukan`);
  revalidatePath(`/event/${eventSlug}/divisi/${divisionSlug}/masuk`);
  revalidatePath(`/event/${eventSlug}/divisi/${destination.slug}/masuk`);
  if (previousDestination) revalidatePath(`/event/${eventSlug}/divisi/${previousDestination.slug}/masuk`);
  redirect(`/event/${eventSlug}/divisi/${divisionSlug}/diajukan?updated=1`);
}

export async function deleteRequest(requestId: string, eventSlug: string, divisionSlug: string) {
  const event = await db.query.events.findFirst({ where: and(eq(events.slug, eventSlug), eq(events.isActive, true)) });
  const source = event ? await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, event.id), eq(divisions.slug, divisionSlug)) }) : null;
  const request = event && source ? await db.query.requests.findFirst({ where: and(eq(requests.id, requestId), eq(requests.eventId, event.id), eq(requests.fromDivisionId, source.id)) }) : null;
  if (!event || !source || !request) throw new Error("Permintaan tidak ditemukan atau event tidak aktif.");
  if (request.isFulfilled) throw new Error("Permintaan yang sudah terpenuhi tidak dapat dihapus.");
  const destination = await db.query.divisions.findFirst({ where: eq(divisions.id, request.toDivisionId) });
  await db.delete(requests).where(and(eq(requests.id, requestId), eq(requests.eventId, event.id), eq(requests.fromDivisionId, source.id), eq(requests.isFulfilled, false)));
  revalidatePath(`/event/${eventSlug}/divisi/${divisionSlug}`);
  revalidatePath(`/event/${eventSlug}/divisi/${divisionSlug}/diajukan`);
  if (destination) revalidatePath(`/event/${eventSlug}/divisi/${destination.slug}/masuk`);
  redirect(`/event/${eventSlug}/divisi/${divisionSlug}/diajukan?deleted=1`);
}

export async function createEvent(_state: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin();
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  const slug = slugify(parsed.data.slug);
  if (await db.query.events.findFirst({ where: eq(events.slug, slug) })) return { message: "Slug sudah digunakan.", errors: { slug: ["Pilih slug lain."] }, values: valuesFrom(formData) };
  await db.insert(events).values({ ...parsed.data, slug });
  revalidatePath("/admin/events");
  redirect("/admin/events?created=1");
}

export async function updateEvent(eventId: string, _state: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin();
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) return { message: "Event tidak ditemukan.", errors: {} };
  const slug = slugify(parsed.data.slug);
  const duplicate = await db.query.events.findFirst({ where: eq(events.slug, slug) });
  if (duplicate && duplicate.id !== eventId) return { message: "Slug sudah digunakan.", errors: { slug: ["Pilih slug lain."] }, values: valuesFrom(formData) };
  await db.update(events).set({ ...parsed.data, slug, updatedAt: new Date() }).where(eq(events.id, eventId));
  revalidatePath("/");
  revalidatePath(`/event/${event.slug}`);
  revalidatePath(`/event/${slug}`);
  revalidatePath("/admin/events");
  redirect(`/admin/events/${eventId}?updated=1`);
}

export async function activateEvent(eventId: string) {
  await assertAdmin();
  await db.transaction(async (tx) => {
    const event = await tx.query.events.findFirst({ where: eq(events.id, eventId) });
    if (!event) throw new Error("Event tidak ditemukan.");
    await tx.update(events).set({ isActive: false, updatedAt: new Date() }).where(eq(events.isActive, true));
    await tx.update(events).set({ isActive: true, updatedAt: new Date() }).where(eq(events.id, eventId));
  });
  revalidatePath("/");
  revalidatePath("/admin/events");
}

export async function createDivision(eventId: string, _state: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin();
  const parsed = divisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) return { message: "Event tidak ditemukan.", errors: {} };
  const slug = slugify(parsed.data.slug);
  if (await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, eventId), eq(divisions.slug, slug)) })) return { message: "Slug sudah digunakan.", errors: { slug: ["Pilih slug lain."] }, values: valuesFrom(formData) };
  await db.insert(divisions).values({ eventId, ...parsed.data, slug });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/event/${event.slug}`);
  redirect(`/admin/events/${eventId}?divisionCreated=1`);
}

export async function updateDivision(eventId: string, divisionId: string, _state: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin();
  const parsed = divisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  const division = await db.query.divisions.findFirst({ where: and(eq(divisions.id, divisionId), eq(divisions.eventId, eventId)) });
  if (!division) return { message: "Divisi tidak ditemukan.", errors: {} };
  const slug = slugify(parsed.data.slug);
  const duplicate = await db.query.divisions.findFirst({ where: and(eq(divisions.eventId, eventId), eq(divisions.slug, slug)) });
  if (duplicate && duplicate.id !== divisionId) return { message: "Slug sudah digunakan.", errors: { slug: ["Pilih slug lain."] }, values: valuesFrom(formData) };
  await db.update(divisions).set({ ...parsed.data, slug, updatedAt: new Date() }).where(eq(divisions.id, divisionId));
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (event) {
    revalidatePath(`/event/${event.slug}`);
    revalidatePath(`/event/${event.slug}/divisi/${division.slug}`);
  }
  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/admin/events/${eventId}?divisionUpdated=1`);
}
