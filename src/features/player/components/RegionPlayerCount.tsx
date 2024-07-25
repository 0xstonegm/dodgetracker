import { unstable_cache } from "next/cache";
import { getLatestPlayerCount } from "../../../data";
import { cn } from "../../../lib/utils";
import { userRegionToRiotRegion } from "../../../regions";
import RegionPlayerCountText from "./RegionPlayerCountText";

export interface RegionPlayerCountProps
  extends React.HTMLAttributes<HTMLDivElement> {
  userRegion: string;
}

const getCachedLatestPlayerCount = unstable_cache(
  getLatestPlayerCount,
  ["getLatestPlayerCount"],
  {
    revalidate: 60 * 60, // 1 hour
  },
);

export default async function RegionPlayerCount({
  userRegion,
  className,
}: RegionPlayerCountProps) {
  const playerCounts = await getCachedLatestPlayerCount(
    userRegionToRiotRegion(userRegion),
  );
  const totalPlayerCount =
    playerCounts.masterCount +
    playerCounts.grandmasterCount +
    playerCounts.challengerCount;

  return (
    <RegionPlayerCountText
      className={cn(className)}
      region={userRegion}
      playerCount={totalPlayerCount}
      lastUpdated={playerCounts.atTime}
    />
  );
}
