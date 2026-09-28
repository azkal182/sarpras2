import { boolean, check, date, index, integer, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(), passwordHash: text("password_hash").notNull(), ...timestamps,
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(), name: text("name").notNull(), slug: text("slug").notNull().unique(), eventDate: date("event_date").notNull(), isActive: boolean("is_active").notNull().default(false), ...timestamps,
}, (table) => [index("events_active_idx").on(table.isActive), uniqueIndex("events_only_one_active_idx").on(table.isActive).where(sql`${table.isActive} = true`)]);

export const divisions = pgTable("divisions", {
  id: uuid("id").defaultRandom().primaryKey(), eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }), name: text("name").notNull(), slug: text("slug").notNull(), ...timestamps,
}, (table) => [unique("divisions_event_slug_unique").on(table.eventId, table.slug), index("divisions_event_idx").on(table.eventId)]);

export const requests = pgTable("requests", {
  id: uuid("id").defaultRandom().primaryKey(), eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }), fromDivisionId: uuid("from_division_id").notNull().references(() => divisions.id), toDivisionId: uuid("to_division_id").notNull().references(() => divisions.id), itemName: text("item_name").notNull(), quantity: integer("quantity").notNull(), location: text("location"), deadlineOffsetDays: integer("deadline_offset_days"), note: text("note"), isFulfilled: boolean("is_fulfilled").notNull().default(false), fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }), ...timestamps,
}, (table) => [
  check("requests_quantity_positive", sql`${table.quantity} > 0`),
  check("requests_deadline_range", sql`${table.deadlineOffsetDays} is null or ${table.deadlineOffsetDays} between 0 and 365`),
  check("requests_different_divisions", sql`${table.fromDivisionId} <> ${table.toDivisionId}`),
  index("requests_event_idx").on(table.eventId), index("requests_from_division_idx").on(table.fromDivisionId), index("requests_to_division_idx").on(table.toDivisionId), index("requests_status_idx").on(table.isFulfilled),
]);

export type Admin = typeof admins.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Division = typeof divisions.$inferSelect;
export type Request = typeof requests.$inferSelect;
