import { riotRegionToUserRegion } from "./regions";

export function getOpggUrl(
    riotRegion: string,
    gameName: string,
    tagLine: string,
): string {
    let userRegion = riotRegionToUserRegion(riotRegion);
    return `https://www.op.gg/summoners/${userRegion}/${gameName}-${tagLine}`;
}

export function getDeeplolUrl(
    riotRegion: string,
    gameName: string,
    tagLine: string,
): string {
    let userRegion = riotRegionToUserRegion(riotRegion);
    return `https://www.deeplol.gg/summoner/${userRegion}/${gameName}-${tagLine}`;
}
