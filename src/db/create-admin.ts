import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import { admins } from "./schema";

const name = (process.env.ADMIN_NAME || "Administrator").trim();
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";

async function main() {
  if (!email) throw new Error("ADMIN_EMAIL harus diisi.");
  if (!email.includes("@")) throw new Error("ADMIN_EMAIL tidak valid.");
  if (password.length < 6) throw new Error("ADMIN_PASSWORD minimal 12 karakter.");
  if (name.length < 2) throw new Error("ADMIN_NAME minimal 2 karakter.");

  const existing = await db.query.admins.findFirst({ where: eq(admins.email, email) });
  if (existing) throw new Error(`Admin dengan email ${email} sudah terdaftar. Tidak ada perubahan dilakukan.`);

  await db.insert(admins).values({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  console.log(`Admin production berhasil dibuat: ${email}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(() => pool.end());
