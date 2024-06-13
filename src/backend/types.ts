import { type ExtractTablesWithRelations } from "drizzle-orm";
import { type MySqlTransaction } from "drizzle-orm/mysql-core";
import {
  type MySql2PreparedQueryHKT,
  type MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";

export enum Tier {
  "MASTER" = "MASTER",
  "GRANDMASTER" = "GRANDMASTER",
  "CHALLENGER" = "CHALLENGER",
}

export type Transaction = MySqlTransaction<
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
  Record<string, unknown>,
  ExtractTablesWithRelations<Record<string, unknown>>
>;
