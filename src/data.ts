import { Pool, RowDataPacket, createPool } from "mysql2/promise";
import {
    Dodge,
    DodgeCounts,
    Leaderboard,
    LeaderboardEntry,
    Summoner,
    Tier,
} from "./types"; // Assuming Dodge is properly defined to match the query results

import * as dotenv from "dotenv";
dotenv.config();

let globalPool: Pool | undefined = undefined;
async function getDBConnection(): Promise<Pool> {
    if (typeof globalPool !== "undefined") return globalPool;

    globalPool = createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: "dodgetracker",
    });
    return globalPool;
}

export function profileIconUrl(profileIconID: number): string {
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileIconID}.jpg`;
}

export async function getDodges(riotRegion?: string): Promise<Dodge[]> {
    try {
        // Initialize the base query
        let query = `
            SELECT
                d.dodge_id as dodgeID,
                r.game_name as gameName,
                r.tag_line as tagLine,
                s.profile_icon_id as profileIconID,
                d.region as riotRegion,
                d.rank_tier as rankTier,
                d.lp_before as lp,
                d.lp_before - d.lp_after as lpLost,
                d.created_at as time
            FROM
                dodges d
            JOIN
                summoners s ON d.summoner_id = s.summoner_id AND d.region = s.region
            JOIN
                riot_ids r ON s.puuid = r.puuid
        `;

        // Declare an array to hold the parameters for the query
        const queryParams = [];

        // Check if region parameter is provided and modify the query and parameters accordingly
        if (riotRegion) {
            query += ` WHERE d.region = ?`; // Add the WHERE clause to filter by region
            queryParams.push(riotRegion); // Add the region value to the parameters array
        }

        // Add the order by clause outside the condition
        query += ` ORDER BY d.created_at DESC`;

        // Execute the query with the conditional parameters
        const [rows, _] = await (
            await getDBConnection()
        ).query(query, queryParams);

        // Assuming the rows directly match the structure of Dodge[]
        return rows as Dodge[];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getDodgesByPlayer(
    gameName: string,
    tagLine: string,
): Promise<Dodge[]> {
    try {
        const query = `
        SELECT
            d.dodge_id as dodgeID,
            r.game_name as gameName,
            r.tag_line as tagLine,
            s.profile_icon_id as profileIconID,
            d.region as riotRegion,
            d.rank_tier as rankTier,
            d.lp_before as lp,
            d.lp_before - d.lp_after as lpLost,
            d.created_at as time
        FROM
            riot_ids r
        JOIN 
            summoners s ON s.puuid = r.puuid
        JOIN 
            dodges d ON s.summoner_id = d.summoner_id
        WHERE
            r.game_name = ? AND r.tag_line = ?
        ORDER BY 
            d.created_at DESC;
        `;

        const [rows, _] = await (
            await getDBConnection()
        ).query(query, [gameName, tagLine]);
        return rows as Dodge[];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getSummoner(
    gameName: string,
    tagLine: string,
): Promise<Summoner | null> {
    try {
        // Initialize the query
        const query = `
            SELECT
                r.game_name as gameName,
                r.tag_line as tagLine,
                s.summoner_level as summonerLevel,
                s.profile_icon_id as profileIconID,
                p.rank_tier as rankTier,
                p.current_lp as currentLP,
                p.games_played as gamesPlayed,
                p.updated_at as lastUpdateTime,
                (p.updated_at = (SELECT MAX(updated_at) FROM apex_tier_players)) as isInLatestUpdate
            FROM
                riot_ids r
            JOIN 
                summoners s ON s.puuid = r.puuid
            JOIN 
                apex_tier_players p ON s.summoner_id = p.summoner_id AND s.region = p.region
            WHERE
                r.game_name = ? AND r.tag_line = ?;
        `;

        // Execute the query with the parameters
        const [rows, _] = (await (
            await getDBConnection()
        ).query(query, [gameName, tagLine])) as RowDataPacket[][];

        switch (rows.length) {
            case 0:
                return null;
            case 1:
                return rows[0] as Summoner;
            default:
                throw new Error(
                    `Expected 0 or 1 summoners, but received ${rows.length} summoners.`,
                );
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getDodgeCounts(
    gameName: string,
    tagLine: string,
): Promise<DodgeCounts | null> {
    try {
        const query = `
        SELECT
            COUNT(
                CASE
                    WHEN d.created_at >= CURRENT_TIMESTAMP - INTERVAL 1 DAY THEN 1
                END
            ) AS last24Hours,
            COUNT(
                CASE
                    WHEN d.created_at >= CURRENT_TIMESTAMP - INTERVAL 7 DAY THEN 1
                END
            ) AS last7Days,
            COUNT(
                CASE
                    WHEN d.created_at >= CURRENT_TIMESTAMP - INTERVAL 30 DAY THEN 1
                END
            ) AS last30Days
        FROM
            riot_ids r
            JOIN summoners s ON r.puuid = s.puuid
            JOIN dodges d ON d.summoner_id = s.summoner_id
        WHERE
            game_name = ?
            AND tag_line = ?
        HAVING
            COUNT(d.dodge_id) > 0;
    `;

        const [rows, _] = (await (
            await getDBConnection()
        ).query(query, [gameName, tagLine])) as RowDataPacket[][];

        switch (rows.length) {
            case 0:
                return null;
            case 1:
                return rows[0] as DodgeCounts;
            default:
                throw new Error(
                    `Expected 0 or 1 dodge counts, but received ${rows.length} dodge counts.`,
                );
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getLeaderboard(
    riotRegion: string,
): Promise<Leaderboard | null> {
    try {
        const query = `
            SELECT
                r.game_name AS gameName,
                r.tag_line AS tagLine,
                s.region AS riotRegion,
                p.rank_tier AS rankTier,
                p.current_lp AS currentLP,
                p.games_played AS gamesPlayed,
                COUNT(*) AS numberOfDodges,
                s.profile_icon_id AS profileIconID
            FROM
                dodges d
                JOIN summoners s ON d.summoner_id = s.summoner_id
                AND d.region = s.region
                JOIN apex_tier_players p ON s.summoner_id = p.summoner_id
                AND s.region = p.region
                JOIN riot_ids r ON s.puuid = r.puuid
            WHERE
                d.region = ?
            GROUP BY
                r.game_name,
                r.tag_line
            ORDER BY
                numberOfDodges DESC,
                p.games_played ASC
        `;

        const [rows, _] = (await (
            await getDBConnection()
        ).query(query, riotRegion)) as RowDataPacket[][];

        if (rows.length === 0) return null;
        return {
            entries: rows as LeaderboardEntry[],
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export function getRankEmblem(rankTier: Tier) {
    const rankTierStr = rankTier.toLowerCase();
    return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${rankTierStr}.svg`;
}
