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
