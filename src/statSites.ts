import { riotRegionToUserRegion } from "./regions";

export enum StatSite {
  OPGG = "OP.GG",
  DEEPLOL = "DEEPLOL.GG",
  LOLPROS = "LOLPROS.GG",
}

export function getOpggUrl(
  riotRegion: string,
  gameName: string,
  tagLine: string,
): string {
  const userRegion = riotRegionToUserRegion(riotRegion);
  return `https://www.op.gg/summoners/${userRegion}/${gameName}-${tagLine}`;
}

export function getDeeplolUrl(
  riotRegion: string,
  gameName: string,
  tagLine: string,
): string {
  const userRegion = riotRegionToUserRegion(riotRegion);
  return `https://www.deeplol.gg/summoner/${userRegion}/${gameName}-${tagLine}`;
}
