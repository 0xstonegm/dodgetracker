import { getLatestPlayerCount } from "../data";
import { cn, timeDiffString } from "../lib/utils";
import { userRegionToRiotRegion } from "../regions";

export interface RegionPlayerCountProps
  extends React.HTMLAttributes<HTMLDivElement> {
  userRegion: string;
}

export default async function RegionPlayerCount({
  userRegion,
  className,
  ...props
}: RegionPlayerCountProps) {
  const playerCounts = await getLatestPlayerCount(
    userRegionToRiotRegion(userRegion),
  );

  return (
    <p
      className={cn(className)}
      title={`Last updated ${timeDiffString(playerCounts.atTime)}`}
      {...props}
    >
      Master+ players in {userRegion.toUpperCase()}:{" "}
      {playerCounts.masterCount +
        playerCounts.grandmasterCount +
        playerCounts.challengerCount}
    </p>
  );
}
