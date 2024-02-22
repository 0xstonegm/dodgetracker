export enum Tier {
    MASTER = "MASTER",
    GRANDMASTER = "GRANDMASTER",
    CHALLENGER = "CHALLENGER",
}

export interface Dodge {
    dodgeID: number;
    gameName: string;
    tagLine: string;
    profileIconID: number;
    riotRegion: string;
    rankTier: Tier;
    lp: number;
    lpLost: number;
    time: Date;
}

export interface Summoner {
    gameName: string;
    tagLine: string;
    summonerLevel: number;
    profileIconID: number;
    rankTier: Tier;
    currentLP: number;
    gamesPlayed: number; // TODO: change DB to store wins and losses separately
    lastUpdateTime: Date;
    isInLatestUpdate: boolean;
}
