import Image from "next/image";
import { getRankEmblem, profileIconUrl } from "../data";
import { Tier } from "../types";

export default async function ProfileCard(props: {
  profileIconId: number;
  summonerLevel: number;
  gameName: string;
  tagLine: string;
  rankTier: Tier;
  currentLp: number;
}) {
  // TODO: show more information if summoner not found

  return (
    <section>
      <section className="flex">
        <div className="relative size-20 md:size-28">
          <Image
            src={profileIconUrl(props.profileIconId)}
            alt="Profile Icon"
            className="rounded-md"
            quality={100}
            fill
            unoptimized
          />
          <div className="absolute bottom-0 flex w-full translate-y-1/3 items-center justify-center">
            <div className="rounded-xl bg-zinc-900 bg-opacity-90 p-1 px-2 text-[9px] md:text-xs">
              {props.summonerLevel}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center pl-2">
          <div className="text-lg font-bold md:text-xl">
            {props.gameName}#{props.tagLine}
          </div>
          <div className="flex items-center justify-center text-sm md:text-base">
            <div className="relative mr-2 size-8 md:size-12">
              <Image
                src={getRankEmblem(props.rankTier)}
                alt={props.rankTier}
                fill
                quality={100}
                unoptimized
              />
            </div>
            {props.currentLp}LP
          </div>
        </div>
      </section>
    </section>
  );
}
