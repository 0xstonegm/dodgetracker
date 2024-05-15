import { z } from "zod";

export enum Tier {
  MASTER = "MASTER",
  GRANDMASTER = "GRANDMASTER",
  CHALLENGER = "CHALLENGER",
}

export const LeaderboardSearchParamsSchema = z.object({
  page: z.coerce.number().optional().default(1).catch(1),
  season: z
    .enum(["s14sp1", "s14sp2"])
    .optional()
    .default("s14sp2")
    .catch("s14sp2"),
});
