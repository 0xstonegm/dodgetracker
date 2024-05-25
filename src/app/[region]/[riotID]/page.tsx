import DodgeList from "@/src/components/DodgeList";
import DodgeStats from "@/src/components/DodgeStats";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import ProfileCard from "@/src/components/ProfileCard";
import { getSummoner } from "@/src/data";
import { decodeRiotIdURIComponent } from "@/src/lib/utils";
import { supportedUserRegions } from "@/src/regions";
import { Tier } from "@/src/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// FIXME: Add metadata

export type SummonerPageProps = {
  params: {
    region: string;
    riotID: string;
  };
  searchParams: {
    page?: string;
  };
};

export async function generateMetadata({
  params,
}: SummonerPageProps): Promise<Metadata> {
  const [gameName, tagLine] = decodeRiotIdURIComponent(params.riotID);

  return {
    title: `${gameName}#${tagLine} (${params.region.toUpperCase()}) - Dodge History`,
    description: `Dodge history of ${gameName}#${tagLine} (${params.region.toUpperCase()}) in League of Legends`,
  };
}

export default async function Summoner({
  params,
  searchParams,
}: SummonerPageProps) {
  const pageNumber = parseInt(searchParams.page ?? "1", 10);
  const [gameName, tagLine] = decodeRiotIdURIComponent(params.riotID);
  const region = (function () {
    if (!supportedUserRegions.has(params.region)) {
      notFound();
    }
    return params.region;
  })();
  const summoner = await getSummoner(gameName, tagLine, region);

  if (!summoner) {
    notFound();
  }

  return (
    <section>
      <section className="flex min-h-[20vh] flex-wrap items-center justify-center border-b-4 border-zinc-900 bg-zinc-600">
        <Suspense
          fallback={
            <LoadingSpinner
              key={`${gameName}#${tagLine}-${region}`}
              className="size-10"
            />
          }
        >
          <div className="m-2 md:mx-14">
            <ProfileCard
              gameName={summoner.gameName}
              tagLine={summoner.tagLine}
              rankTier={summoner.rankTier as Tier}
              currentLp={summoner.currentLp}
              profileIconId={summoner.profileIconId}
              summonerLevel={summoner.summonerLevel}
            />
          </div>
          <div className="m-2 md:mx-14">
            <DodgeStats
              gameName={summoner.gameName}
              tagLine={summoner.tagLine}
            />
          </div>
        </Suspense>
      </section>

      <Suspense
        key={`${gameName}#${tagLine}-${region}`}
        fallback={
          <div className="flex h-[70vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <div className="mx-auto lg:w-5/6">
          <DodgeList
            userRegion={region}
            pageNumber={pageNumber}
            gameName={gameName}
            tagLine={tagLine}
            statSiteButtons={false}
            profileLink={false}
          />
        </div>
      </Suspense>
    </section>
  );
}
