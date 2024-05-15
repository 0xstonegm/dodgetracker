"use client";

import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { seasons } from "../seasons";
import { LeaderboardSearchParamsSchema } from "../types";

export default function LeaderboardFilters() {
  const [_, startTransition] = useTransition();
  const [season, setSeason] = useQueryState("season", { startTransition });
  const [page, setPage] = useQueryState("page", { startTransition });

  const validatedSearchParams = LeaderboardSearchParamsSchema.parse(
    Object.fromEntries(useSearchParams()),
  );

  const onSeasonChange = (value: string) => {
    setSeason(value);
    setPage("1");
  };

  return (
    <div>
      {
        <Select
          defaultValue={validatedSearchParams.season}
          onValueChange={onSeasonChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.reverse().map((season) => (
              <SelectItem key={season.value} value={season.value}>
                {season.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    </div>
  );
}
