import { z } from "zod";
import { getCurrentSeason, seasons } from "./seasons";

export enum Tier {
  MASTER = "MASTER",
  GRANDMASTER = "GRANDMASTER",
  CHALLENGER = "CHALLENGER",
}

const currentSeason = getCurrentSeason();
export const LeaderboardSearchParamsSchema = z.object({
  page: z.coerce.number().optional().default(1).catch(1),
  season: z
    .enum(seasons.map((season) => season.value) as [string, ...string[]])
    .optional()
    .default(currentSeason)
    .catch(currentSeason),
});
