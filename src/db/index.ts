import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { sarprasPool?: Pool };
function getDatabaseUrl() { const url = process.env.DATABASE_URL; if (!url) throw new Error("DATABASE_URL belum dikonfigurasi."); return url; }
const pool = globalForDb.sarprasPool ?? new Pool({
  connectionString: getDatabaseUrl(),
  max: 10,
  ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: true } : false,
});
if (process.env.NODE_ENV !== "production") globalForDb.sarprasPool = pool;
export const db = drizzle({ client: pool, schema });
export { pool };
