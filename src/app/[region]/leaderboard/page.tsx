import Leaderboard from "@/src/components/Leaderboard";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import { supportedUserRegions } from "@/src/regions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: {
    region: string;
  };
  searchParams: {
    page?: string;
  };
};

// TODO: add page number ?
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Leaderboard - ${params.region.toUpperCase()}`,
    description: `Leaderboard of players with the most dodges in master+ in League of Legends`,
  };
}

export default async function page({ params, searchParams }: Props) {
  const userRegion = (function () {
    if (!supportedUserRegions.has(params.region)) {
      // TODO: show error message instead ?
      notFound();
    }
    return params.region;
  })();
  const pageNumber = parseInt(searchParams.page ?? "1", 10);

  return (
    <section className="p-2">
      <p className="flex items-center justify-center text-sm md:text-lg">
        Players with the most dodges in {userRegion.toUpperCase()}
      </p>
      <Suspense
        key={`${userRegion}-${pageNumber}`}
        fallback={
          <div className="flex h-[75vh] items-center justify-center">
            <div className="size-16">
              <LoadingSpinner />
            </div>
          </div>
        }
      >
        <div className="mx-auto md:w-5/6 lg:w-3/4">
          <Leaderboard userRegion={userRegion} pageNumber={pageNumber} />
        </div>
      </Suspense>
    </section>
  );
}
