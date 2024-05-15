import { cn, timeDiffString } from "../lib/utils";

export interface RegionPlayerCountProps
  extends React.HTMLAttributes<HTMLDivElement> {
  userRegion: string;
  totalPlayerCount: number;
  lastUpdateUtc: Date;
}

export default async function RegionPlayerCount({
  userRegion,
  totalPlayerCount,
  lastUpdateUtc,
  className,
  ...props
}: RegionPlayerCountProps) {
  return (
    <p
      className={cn(className)}
      title={`Last updated ${timeDiffString(lastUpdateUtc)}`}
      {...props}
    >
      Master+ players in {userRegion.toUpperCase()}: {totalPlayerCount}
    </p>
  );
}
