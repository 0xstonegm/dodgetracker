export enum Tier {
    MASTER = "MASTER",
    GRANDMASTER = "GRANDMASTER",
    CHALLENGER = "CHALLENGER",
}

export interface Dodge {
    dodgeId: number;
    summonerName: string;
    lpBeforeDodge: number;
    rankTier: string;
    lpLost: number;
    time: Date;
}
