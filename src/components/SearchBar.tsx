"use client";

import { Kbd } from "@nextui-org/kbd";
import { useQuery } from "@tanstack/react-query";
import { useClickAway, useDebounce } from "@uidotdev/usehooks";
import { Dot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useRef, useState } from "react";
import { z } from "zod";
import { cn, getRankEmblem } from "../lib/utils";
import { userRegionToRiotRegion } from "../regions";
import { Tier } from "../types";
import { Input } from "./ui/input";

interface SearchBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const playerSchema = z.object({
  players: z.array(
    z.object({
      gameName: z.string(),
      tagLine: z.string(),
      rankTier: z.string(),
      lp: z.number(),
      summonerLevel: z.number(),
      profileIconId: z.number(),
      lastUpdatedAt: z.coerce.date(),
    }),
  ),
});

const fetchPlayers = async (searchFilter: string, userRegion: string) => {
  const riotRegion = userRegionToRiotRegion(userRegion);

  const response = await fetch(
    `/api/players?search=${encodeURIComponent(searchFilter)}&region=${riotRegion}`,
  );

  if (!response.ok)
    throw new Error(`Fetch failed with status: ${response.status}.`);

  const data = await response.json();
  return playerSchema.parse(data);
};

function isWithinDays(oldDate: Date, now: Date, dayLimit: number): boolean {
  const differenceInMillis = Math.abs(now.getTime() - oldDate.getTime());
  const differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);
  return differenceInDays < dayLimit;
}

export default function SearchBar({ className }: SearchBarProps) {
  const [inputHasFocus, setInputHasFocus] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const debouncedSearchFilter = useDebounce(searchFilter, 250);

  const region = usePathname().split("/")[1];
  const router = useRouter();

  const ref = useClickAway(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    setInputHasFocus(false);
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["players", region, debouncedSearchFilter.toLowerCase()],
    queryFn: () => fetchPlayers(debouncedSearchFilter!.toLowerCase(), region),
    enabled: !!debouncedSearchFilter && region !== "about",
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const inputHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(e.target.value);
    setInputHasFocus(true);
  };

  const captureSearch = (gameName: string, tagLine: string) => {
    posthog.capture("searched_player", {
      region: region,
      gameName: gameName,
      tagLine: tagLine,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (isPending || error || !data || data.players.length === 0) return;

    const player = data.players[0];
    const url = `/${region}/${player.gameName}-${player.tagLine}`;
    router.push(url);

    setSearchFilter("");
    inputRef.current?.blur();

    captureSearch(player.gameName, player.tagLine);
    posthog.capture("searchbar_enter_search");
  };

  return (
    <>
      <div className="relative">
        <div ref={ref as any}>
          <Input
            className={cn("w-96", className)}
            ref={inputRef}
            placeholder="Search players..."
            disabled={region === "about"} // FIXME: Temporary fix
            value={searchFilter}
            onChange={inputHandleChange}
            onClick={() => setInputHasFocus(true)}
            onFocus={() => {
              setInputHasFocus(true);
              posthog.capture("searchbar_focused");
            }}
            onKeyDown={handleKeyDown}
          />
          {inputHasFocus && searchFilter.length > 0 && (
            <div className="absolute top-10 z-[100] flex h-[50vh] w-full flex-col overflow-y-scroll rounded-sm bg-zinc-900 text-zinc-300 shadow-sm shadow-zinc-900 scrollbar scrollbar-track-zinc-800 scrollbar-thumb-zinc-900">
              {inputHasFocus && data && data.players.length > 0 && (
                <ul>
                  {data.players.map((player, index) => (
                    <li
                      className="hover:bg-zinc-800"
                      key={`${player.gameName}#${player.tagLine}`}
                    >
                      <Link
                        className="flex items-center border-b border-zinc-800 p-1"
                        href={`/${region}/${player.gameName}-${player.tagLine}`}
                        onClick={() => {
                          setSearchFilter("");
                          captureSearch(player.gameName, player.tagLine);
                        }}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <Image
                              className="pr-1"
                              alt="Profile Icon"
                              src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${player.profileIconId}.jpg`}
                              width={32}
                              height={32}
                              unoptimized
                            />
                            <div className="flex flex-col">
                              <p className="font-semibold">
                                {player.gameName}#{player.tagLine}
                              </p>
                              <div className="text-xs font-light">
                                <div className="flex items-center gap-1">
                                  {isWithinDays(
                                    player.lastUpdatedAt,
                                    new Date(),
                                    3,
                                  ) && (
                                    <>
                                      <Image
                                        src={getRankEmblem(
                                          player.rankTier as Tier,
                                        )}
                                        alt={player.rankTier}
                                        quality={100}
                                        width={16}
                                        height={16}
                                        unoptimized
                                      />
                                      <p>{player.lp} LP</p>
                                      <Dot size={10} />
                                    </>
                                  )}
                                  <p>LVL {player.summonerLevel}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {index == 0 && (
                            <Kbd
                              keys={"enter"}
                              className="mr-1 rounded-md border border-zinc-300 p-1 text-center text-xs text-zinc-300"
                            >
                              Enter
                            </Kbd>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {inputHasFocus && isPending && searchFilter.length > 0 && (
                <div className="flex items-center justify-center p-2">
                  <p className="font-semibold">Loading...</p>
                </div>
              )}
              {inputHasFocus &&
                data &&
                searchFilter.length > 0 &&
                data.players.length === 0 && (
                  <div className="flex items-center justify-center p-2">
                    <div className="flex flex-col items-center justify-center text-center">
                      <p className="font-semibold">No players found.</p>
                      <p className="text-sm font-light">
                        (Players without any dodges will not show up)
                      </p>
                    </div>
                  </div>
                )}
              {inputHasFocus && error && searchFilter.length > 0 && (
                <div className="flex items-center justify-center p-2">
                  <p>Search error: {error.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
