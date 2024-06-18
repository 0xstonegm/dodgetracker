import { getLatestPlayerCount } from "../data";
import { cn } from "../lib/utils";
import { userRegionToRiotRegion } from "../regions";
import RegionPlayerCountText from "./RegionPlayerCountText";

export interface RegionPlayerCountProps
  extends React.HTMLAttributes<HTMLDivElement> {
  userRegion: string;
}

export default async function RegionPlayerCount({
  userRegion,
  className,
}: RegionPlayerCountProps) {
  const playerCounts = await getLatestPlayerCount(
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
