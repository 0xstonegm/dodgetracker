import AutoFetchSwitch from "@/src/components/AutoFetchSwitch";
import DodgeList from "@/src/components/DodgeList";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import RefreshButton from "@/src/components/RefreshButton";
import RegionPlayerCount from "@/src/components/RegionPlayerCount";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { supportedUserRegions } from "@/src/regions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BsQuestionCircleFill } from "react-icons/bs";

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

export default function Region({ params, searchParams }: Props) {
  const pageNumber = parseInt(searchParams.page ?? "1", 10);
  if (supportedUserRegions.has(params.region) === false) {
    redirect("/euw");
  }

  return (
    <>
      <div className="flex w-full justify-end">
        <div className="border-b border-l border-zinc-900 px-2 text-sm">
          <Suspense
            fallback={<p>Loading player count...</p>}
            key={`${params.region}`}
          >
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
                <BsQuestionCircleFill className="md:size-6" />
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
