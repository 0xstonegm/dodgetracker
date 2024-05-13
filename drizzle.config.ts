import "dotenv/config";
import { type Config } from "drizzle-kit";

export default {
  dialect: "mysql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations/",
  dbCredentials: {
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    port: parseInt(process.env.DB_PORT || "3306", 10),
    password: process.env.DB_PASS as string,
    database: process.env.DB_NAME as string,
  },
  strict: true,
  verbose: true,
} satisfies Config;
