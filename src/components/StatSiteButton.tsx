"use client";

import { twMerge } from "tailwind-merge";
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

export default function StatSiteButton(props: StatSiteButtonProps) {
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

  let className = (function () {
    let className = "text-xs text-zinc-400";
    if (props.statSite === StatSite.LOLPROS) {
      className =
        "rounded-md bg-yellow-800 p-1 align-middle text-xs font-medium text-zinc-200 shadow-sm shadow-zinc-800 hover:bg-yellow-700";
    }

    if (props.className !== undefined) {
      return twMerge(className, props.className);
    }
    return className;
  })();

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <Button className={className}>{props.statSite}</Button>
    </a>
  );
}
