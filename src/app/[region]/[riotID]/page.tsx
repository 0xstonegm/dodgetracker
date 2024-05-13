import DodgeList from "@/src/components/DodgeList";
import DodgeStats from "@/src/components/DodgeStats";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import ProfileCard from "@/src/components/ProfileCard";
import { getSummoner } from "@/src/data";
import { supportedUserRegions } from "@/src/regions";
import { Tier } from "@/src/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MdErrorOutline } from "react-icons/md";

// FIXME: Add metadata

export type Props = {
  params: {
    region: string;
    riotID: string;
  };
};

function riotIDToGameNameAndTagLine(riotID: string): [string, string] {
  if (riotID.indexOf("-") === -1) {
    return [riotID, ""];
  }

  const decodedString = decodeURIComponent(riotID);
  const lastDashIdx = decodedString.lastIndexOf("-");
  return [
    decodedString.substring(0, lastDashIdx),
    decodedString.substring(lastDashIdx + 1),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [gameName, tagLine] = riotIDToGameNameAndTagLine(params.riotID);

  return {
    title: `${gameName}#${tagLine} (${params.region.toUpperCase()}) - Dodge History`,
    description: `Dodge history of ${gameName}#${tagLine} (${params.region.toUpperCase()}) in League of Legends`,
  };
}

export default async function Summoner({ params }: Props) {
  const [gameName, tagLine] = riotIDToGameNameAndTagLine(params.riotID);

  const region = (function () {
    if (!supportedUserRegions.has(params.region)) {
      // TODO: show error message instead ?
      notFound();
    }
    return params.region;
  })();

  let result = await getSummoner(gameName, tagLine);
  if (result.length === 0) {
    return (
      <>
        <section className="flex h-[70vh] items-center justify-center text-center">
          <div className="m-2 flex flex-col items-center justify-center rounded-lg bg-zinc-800 px-2">
            <h1 className="flex items-center py-4 text-xl font-bold md:text-3xl">
              <MdErrorOutline className="mr-1 size-6 md:mr-2 md:size-10" />
              Not found in database
            </h1>
            <p className="px-4 md:text-xl">
              The account{" "}
              <b>
                {gameName}#{tagLine}
              </b>{" "}
              in region <b>{region.toUpperCase()}</b> was not found in the
              database. Make sure that:
            </p>
            <ul className="text-md list-inside list-decimal px-8 py-4 text-left md:text-lg">
              <li>
                The account has at least one dodge in master+ since tracking
                began.
              </li>
              <li>
                The RiotID is spelled correctly and exists in{" "}
                {region.toUpperCase()}.
              </li>
            </ul>
          </div>
        </section>
      </>
    );
  }
  let summoner = result[0];

  return (
    <section>
      <section className="flex min-h-[20vh] flex-wrap items-center justify-center border-b-4 border-zinc-900 bg-zinc-600">
        <Suspense
          fallback={
            <div className="size-16">
              <LoadingSpinner />
            </div>
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
            <div className="size-16">
              <LoadingSpinner />
            </div>
          </div>
        }
      >
        <div className="mx-auto lg:w-5/6">
          <DodgeList
            userRegion={region}
            pageNumber={1}
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
