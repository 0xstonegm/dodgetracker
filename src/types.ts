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
    wins: number;
    losses: number;
    lastUpdateTime: Date;
    isInLatestUpdate: boolean;
}

export interface DodgeCounts {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
}

export interface LeaderboardEntry {
    gameName: string;
    tagLine: string;
    riotRegion: string;
    rankTier: Tier;
    currentLP: number;
    wins: number;
    losses: number;
    numberOfDodges: number;
    profileIconID: number;
}

export interface Leaderboard {
    entries: LeaderboardEntry[];
}

export interface Account {
    gameName: string;
    tagLine: string;
    riotRegion: string;
    lastDodgeTime: Date;
}
