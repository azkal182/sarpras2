import "dotenv/config";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db, pool } from "./index";
import { admins, divisions, events, requests } from "./schema";

const demoEvent = { name: "Festival Kampus 2026", slug: "festival-kampus-2026", eventDate: "2026-12-31" };
const demoDivisions = [
  { name: "Acara", slug: "acara" },
  { name: "Perlengkapan", slug: "perlengkapan" },
  { name: "Konsumsi", slug: "konsumsi" },
  { name: "Dokumentasi", slug: "dokumentasi" },
];

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Seed development tidak boleh dijalankan di production.");
  const name = process.env.SEED_ADMIN_NAME || "Administrator";
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) throw new Error("SEED_ADMIN_PASSWORD harus diisi untuk menjalankan seed.");
  const passwordHash = await bcrypt.hash(password, 12);

  await db.transaction(async (tx) => {
    const existingAdmin = await tx.query.admins.findFirst({ where: eq(admins.email, email) });
    if (!existingAdmin) await tx.insert(admins).values({ name, email, passwordHash });
    else if (process.env.SEED_RESET_ADMIN_PASSWORD === "true") await tx.update(admins).set({ name, passwordHash, updatedAt: new Date() }).where(eq(admins.id, existingAdmin.id));

    if (process.env.SEED_INCLUDE_DEMO !== "true") return;

    const existingEvent = await tx.query.events.findFirst({ where: eq(events.slug, demoEvent.slug) });
    await tx.update(events).set({ isActive: false, updatedAt: new Date() }).where(eq(events.isActive, true));
    const event = existingEvent
      ? (await tx.update(events).set({ ...demoEvent, isActive: true, updatedAt: new Date() }).where(eq(events.id, existingEvent.id)).returning())[0]
      : (await tx.insert(events).values({ ...demoEvent, isActive: true }).returning())[0];
    if (!event) throw new Error("Gagal membuat event demo.");

    const seededDivisions = [];
    for (const item of demoDivisions) {
      const existing = await tx.query.divisions.findFirst({ where: and(eq(divisions.eventId, event.id), eq(divisions.slug, item.slug)) });
      const division = existing
        ? (await tx.update(divisions).set({ name: item.name, updatedAt: new Date() }).where(eq(divisions.id, existing.id)).returning())[0]
        : (await tx.insert(divisions).values({ eventId: event.id, ...item }).returning())[0];
      if (division) seededDivisions.push(division);
    }

    const source = seededDivisions.find((item) => item.slug === "acara");
    const destination = seededDivisions.find((item) => item.slug === "perlengkapan");
    if (source && destination) {
      const existingRequest = await tx.query.requests.findFirst({ where: and(eq(requests.eventId, event.id), eq(requests.itemName, "Kursi lipat demo")) });
      if (!existingRequest) await tx.insert(requests).values({ eventId: event.id, fromDivisionId: source.id, toDivisionId: destination.id, itemName: "Kursi lipat demo", quantity: 40, location: "Lapangan Utama", deadlineOffsetDays: 7, note: "Contoh request development", isFulfilled: false });
    }
  });

  console.log(`Admin development tersedia: ${email}`);
  if (process.env.SEED_INCLUDE_DEMO === "true") console.log(`Demo event tersedia: ${demoEvent.slug}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
