"use client";

import { useEffect, useState } from "react";
import { cn, timeDiffString } from "../lib/utils";

type RegionPlayerCountTextProps = {
  region: string;
  playerCount: number;
  lastUpdated: Date;
} & React.HTMLAttributes<HTMLParagraphElement>;

export default function RegionPlayerCountText({
  className,
  ...props
}: RegionPlayerCountTextProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className={cn(className)}
      title={`Last updated ${timeDiffString(props.lastUpdated)}`}
    >
      Master+ players in {props.region.toUpperCase()}: {props.playerCount}
    </p>
  );
}
