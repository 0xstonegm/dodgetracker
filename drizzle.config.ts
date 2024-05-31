import "dotenv/config";
import { type Config } from "drizzle-kit";

export default {
  dialect: "mysql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations/",
  dbCredentials: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    port: parseInt(process.env.DB_PORT ?? "3306", 10),
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
  },
  strict: true,
  verbose: true,
} satisfies Config;
