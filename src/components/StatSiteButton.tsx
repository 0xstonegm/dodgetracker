"use client";

import { cn } from "../lib/utils";
import { StatSite, getDeeplolUrl, getOpggUrl } from "../statSites";
import { Button } from "./Button";

export interface StatSiteButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  statSite: StatSite;
  riotRegion: string;
  gameName: string;
  tagLine: string;
  lolProsSlug?: string; /// If the stat site is lolPros, then this is the slug
}

export default function StatSiteButton({
  className,
  ...props
}: StatSiteButtonProps) {
  let url = (function () {
    switch (props.statSite) {
      case StatSite.OPGG:
        return getOpggUrl(props.riotRegion, props.gameName, props.tagLine);
      case StatSite.DEEPLOL:
        return getDeeplolUrl(props.riotRegion, props.gameName, props.tagLine);
      case StatSite.LOLPROS:
        return `https://lolpros.gg/player/${props.lolProsSlug}`;
    }
  })();

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <Button
        className={cn(
          "text-xs text-zinc-400",
          {
            "rounded-md bg-yellow-800 p-1 align-middle text-xs font-medium text-zinc-200 shadow-sm shadow-zinc-800 enabled:hover:bg-yellow-700":
              props.statSite === StatSite.LOLPROS,
          },
          className,
        )}
      >
        {props.statSite}
      </Button>
    </a>
  );
}
