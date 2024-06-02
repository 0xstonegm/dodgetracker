import Image from "next/image";
import { getRankEmblem } from "../lib/utils";
import { type Tier } from "../types";

interface RankInfoProps {
  rankTier: Tier;
  lp: number;
}

export default function RankInfo({ rankTier, lp }: RankInfoProps) {
  return (
    <>
      <section className="flex flex-col items-center justify-center text-sm lg:flex-row lg:justify-start lg:text-base">
        <div className="relative mr-1 size-7 md:size-10">
          <Image
            src={getRankEmblem(rankTier)}
            alt={rankTier}
            fill
            quality={100}
            unoptimized
          />
        </div>
        <p className="text-nowrap">{lp} LP</p>
      </section>
    </>
  );
}
