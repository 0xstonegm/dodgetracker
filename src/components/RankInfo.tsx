import Image from "next/image";
import { type Tier } from "../lib/types";
import { cn, getRankEmblem } from "../lib/utils";

export default function RankInfo(props: {
  rankTier: Tier;
  lp: number;
  disableCol?: boolean;
}) {
  return (
    <>
      <section
        className={cn(
          "flex flex-col items-center justify-center text-sm lg:flex-row lg:justify-start lg:text-base",
          {
            "flex-row": props.disableCol,
          },
        )}
      >
        <div className="relative mr-1 size-7 md:size-10">
          <Image
            src={getRankEmblem(props.rankTier)}
            alt={props.rankTier}
            fill
            quality={100}
            unoptimized
          />
        </div>
        <p className="text-nowrap">{props.lp} LP</p>
      </section>
    </>
  );
}
