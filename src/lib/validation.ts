import { z } from "zod";
import { slugPattern } from "@/lib/slug";

export function dateIsValid(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const eventSchema = z.object({
  name: z.string().trim().min(2, "Nama event minimal 2 karakter."),
  slug: z.string().trim().min(2, "Slug minimal 2 karakter.").regex(slugPattern, "Gunakan huruf kecil, angka, dan tanda hubung."),
  eventDate: z.string().refine(dateIsValid, "Tanggal event tidak valid."),
});

export const divisionSchema = z.object({
  name: z.string().trim().min(2, "Nama divisi minimal 2 karakter."),
  slug: z.string().trim().min(2, "Slug minimal 2 karakter.").regex(slugPattern, "Gunakan huruf kecil, angka, dan tanda hubung."),
});

export const requestSchema = z.object({
  itemName: z.string().trim().min(1, "Nama barang wajib diisi."),
  quantity: z.coerce.number().int().positive("Jumlah harus lebih dari 0."),
  toDivisionId: z.string().uuid("Pilih divisi tujuan."),
  location: z.string().trim().optional(),
  deadlineOffsetDays: z.preprocess((value) => value === "" ? null : value, z.coerce.number().int().min(0).max(365).nullable()),
  note: z.string().trim().optional(),
});
