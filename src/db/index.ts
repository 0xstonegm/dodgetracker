import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const poolConnection = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type Drizzle = ReturnType<typeof drizzle>;
const customGlobal = globalThis as { db?: Drizzle };

const isProduction = process.env.NODE_ENV === "production";

const db: Drizzle = customGlobal.db ?? drizzle(poolConnection);
if (!isProduction) {
  customGlobal.db = db;
}

export { db };
