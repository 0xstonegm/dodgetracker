import AutoFetchSwitch from "@/src/components/AutoFetchSwitch";
import DodgeList from "@/src/components/DodgeList";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import PlayerCountAlert from "@/src/components/PlayerCountAlert";
import RefreshButton from "@/src/components/RefreshButton";
import RegionPlayerCount from "@/src/components/RegionPlayerCount";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { supportedUserRegions } from "@/src/regions";
import { HelpCircleIcon } from "lucide-react";
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

export default async function Region({ params, searchParams }: Props) {
  const pageNumber = parseInt(searchParams.page ?? "1", 10);
  if (supportedUserRegions.has(params.region) === false) {
    redirect("/euw");
  }

  // Key for suspense to re-fetch data when the region or page number changes
  const suspenseKey = `${params.region}-${pageNumber}`;

  return (
    <>
      <div className="flex w-full justify-end">
        <div className="border-b border-l border-zinc-900 px-2 text-sm font-light">
          <Suspense key={suspenseKey} fallback={<p>Loading player count...</p>}>
            <RegionPlayerCount userRegion={params.region} />
          </Suspense>
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
          <Suspense key={suspenseKey}>
            <PlayerCountAlert userRegion={params.region} />
          </Suspense>
        </div>
      </div>
      <Suspense
        key={suspenseKey}
        fallback={
          <div className="flex h-[75vh] items-center justify-center">
            <LoadingSpinner />
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
