import test from "node:test";
import assert from "node:assert/strict";
import { dateIsValid, divisionSchema, eventSchema, requestSchema } from "./validation";

const destination = "83d5b2de-c4fa-4a9c-88f5-2a6f78d6da5e";

test("event date rejects impossible calendar dates", () => {
  assert.equal(dateIsValid("2027-02-29"), false);
  assert.equal(dateIsValid("2028-02-29"), true);
  assert.equal(eventSchema.safeParse({ name: "Festival", slug: "festival", eventDate: "2027-13-01" }).success, false);
});

test("division slug only accepts URL-safe characters", () => {
  assert.equal(divisionSchema.safeParse({ name: "Divisi Acara", slug: "divisi-acara" }).success, true);
  assert.equal(divisionSchema.safeParse({ name: "Divisi Acara", slug: "Divisi Acara" }).success, false);
});

test("request enforces a positive quantity and optional deadline", () => {
  const input = { itemName: "Meja", quantity: "4", toDivisionId: destination, location: "", deadlineOffsetDays: "", note: "" };
  const valid = requestSchema.safeParse(input);
  assert.equal(valid.success, true);
  if (valid.success) assert.equal(valid.data.deadlineOffsetDays, null);
  assert.equal(requestSchema.safeParse({ ...input, quantity: "0" }).success, false);
  assert.equal(requestSchema.safeParse({ ...input, toDivisionId: "invalid" }).success, false);
  assert.equal(requestSchema.safeParse({ ...input, deadlineOffsetDays: "366" }).success, false);
});
