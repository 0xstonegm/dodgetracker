import { type dodgeSchema } from "@/src/lib/types";
import { type z } from "zod";

const positionBaseURL =
  "https://raw.communitydragon.org/14.14/plugins/rcp-fe-lol-career-stats/global/default";

function getFullPosition(
  position: z.infer<typeof dodgeSchema.shape.lolProsPosition>,
) {
  switch (position) {
    case "TOP":
      return "position_top";
    case "JUNGLE":
      return "position_jungle";
    case "MID":
      return "position_mid";
    case "BOT":
      return "position_bottom";
    case "SUPPORT":
      return "position_support";
    default:
      throw new Error("Invalid position");
  }
}

export function positionIconURL(
  position: z.infer<typeof dodgeSchema.shape.lolProsPosition>,
) {
  const positionIconFile = `${getFullPosition(position)}.png`;
  return `${positionBaseURL}/${positionIconFile}`;
}

export function countryFlagURL(countryCode: string) {
  return `http://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`;
}
