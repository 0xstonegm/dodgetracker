import AutoFetchSwitch from "@/src/components/AutoFetchSwitch";
import DodgeList from "@/src/components/DodgeList";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import RefreshButton from "@/src/components/RefreshButton";
import RegionPlayerCount from "@/src/components/RegionPlayerCount";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { getLatestPlayerCount } from "@/src/data";
import { supportedUserRegions, userRegionToRiotRegion } from "@/src/regions";
import { HelpCircleIcon, Info } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: {
    region: string;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.region.toUpperCase()}`,
  };
}

export default async function Region({ params, searchParams }: Props) {
  const pageNumber = parseInt(searchParams.page ?? "1", 10);
  if (supportedUserRegions.has(params.region) === false) {
    redirect("/euw");
  }

  const playerCounts = await getLatestPlayerCount(
    userRegionToRiotRegion(params.region),
  );
  const totalPlayerCount =
    playerCounts.masterCount +
    playerCounts.grandmasterCount +
    playerCounts.challengerCount;

  return (
    <>
      <div className="flex w-full justify-end">
        <div className="border-b border-l border-zinc-900 px-2 text-sm">
          <RegionPlayerCount
            userRegion={params.region}
            lastUpdateUtc={playerCounts.atTime}
            totalPlayerCount={totalPlayerCount}
          />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center">
            <header className="m-2 text-center text-2xl font-bold md:text-4xl">
              Dodges
            </header>
            <RefreshButton className="mr-2" />
            <Popover>
              <PopoverTrigger>
                <HelpCircleIcon className="md:size-6" />
              </PopoverTrigger>
              <PopoverContent className="border-zinc-700 bg-zinc-800 text-white">
                <p>
                  The database is updated automatically every ~10 seconds. Press
                  the fetch button to fetch the latest dodges from the database
                  or enable auto-fetch to automatically fetch the latest dodges
                  every 15 seconds.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <AutoFetchSwitch />
          {totalPlayerCount === 0 && (
            <Alert className="mt-2 w-5/6 border-2 border-zinc-900 bg-yellow-400 bg-opacity-35 md:w-full">
              <AlertTitle>
                <div className="flex items-center text-center">
                  <Info className="mr-1 size-6" />
                  <p>No players!</p>
                </div>
              </AlertTitle>
              <AlertDescription>
                Currently, there are no {params.region.toUpperCase()} players in
                master or above, which means no dodges can be detected.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      <Suspense
        key={`${params.region}-${pageNumber}`}
        fallback={
          <div className="flex h-[75vh] items-center justify-center">
            <div className="size-16">
              <LoadingSpinner />
            </div>
          </div>
        }
      >
        <div className="mx-auto lg:w-3/4">
          <DodgeList
            pageNumber={pageNumber}
            userRegion={params.region}
          ></DodgeList>
        </div>
      </Suspense>
    </>
  );
}
