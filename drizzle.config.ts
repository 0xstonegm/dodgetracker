import "dotenv/config";
import { type Config } from "drizzle-kit";

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations/",
  introspect: {
    casing: "camel",
  },
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public", "dodgetracker"],
  strict: true,
  verbose: true,
} satisfies Config;
