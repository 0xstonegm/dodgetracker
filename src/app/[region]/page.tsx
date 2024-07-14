import { autoFetchInterval } from "@/src/autoFetch";
import AutoFetchSwitch from "@/src/components/AutoFetchSwitch";
import DodgeList from "@/src/components/DodgeList";
import FetchButton from "@/src/components/FetchButton";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import PlayerCountAlert from "@/src/components/PlayerCountAlert";
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
import { ErrorBoundary } from "react-error-boundary";
import Notif from "./_components/Notif";

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
            <ErrorBoundary fallback={<p>Error loading player count.</p>}>
              <RegionPlayerCount userRegion={params.region} />
            </ErrorBoundary>
          </Suspense>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center">
            <header className="m-2 text-center text-2xl font-bold md:text-4xl">
              Dodges
            </header>
            <FetchButton className="mr-2" />
            <Popover>
              <PopoverTrigger>
                <HelpCircleIcon className="md:size-6" />
              </PopoverTrigger>
              <PopoverContent className="w-60 border-zinc-700 bg-zinc-800 sm:w-96">
                <div className="space-y-4">
                  <p className="font-semibold">
                    Dodges are automatically detected 24/7, every 5-10 seconds.
                  </p>
                  <ul className="list-inside list-disc space-y-2 font-light">
                    <li>
                      Press the <span className="font-semibold">Fetch</span>{" "}
                      button to manually get the latest dodges from the server.
                    </li>
                    <li>
                      Enable auto-fetch to receive updates automatically every{" "}
                      {autoFetchInterval} seconds.
                    </li>
                  </ul>
                </div>
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
          {["euw", "eune"].includes(params.region) && <Notif />}
          <ErrorBoundary
            fallback={
              <div className="flex w-full items-center justify-center">
                <p className="p-2 text-xl text-red-400">
                  Error loading dodges. The issue will be taken care of as soon
                  as possible.
                </p>
              </div>
            }
          >
            <DodgeList
              pageNumber={pageNumber}
              userRegion={params.region}
            ></DodgeList>
          </ErrorBoundary>
        </div>
      </Suspense>
    </>
  );
}
