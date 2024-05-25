"use client";

import { decodeRiotIdURIComponent } from "@/src/lib/utils";
import { usePathname } from "next/navigation";
import { MdErrorOutline } from "react-icons/md";

export default function NotFound() {
  const pathname = usePathname();
  const [region, riotID] = pathname.split("/").slice(1);
  const [gameName, tagLine] = decodeRiotIdURIComponent(riotID);

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
