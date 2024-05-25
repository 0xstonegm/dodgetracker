import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  timezone: "Z",
  connectionLimit: 5,
});

type Drizzle = ReturnType<typeof drizzle>;
const customGlobal = globalThis as { db?: Drizzle };

const isProduction = process.env.NODE_ENV === "production";

const db: Drizzle = customGlobal.db ?? drizzle(poolConnection);
if (!isProduction) {
  customGlobal.db = db;
}

export { db };
