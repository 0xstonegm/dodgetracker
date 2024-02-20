import { createPool } from "mysql2/promise";
import { Dodge } from "./types"; // Assuming Dodge is properly defined to match the query results

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "dodgetracker",
});

export function profileIconUrl(profileIconID: number): string {
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileIconID}.jpg`;
}

export async function getDodges(): Promise<Dodge[]> {
    try {
        const [rows, _] = await pool.query(`
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
            order by d.created_at DESC;
        `);

        // Assuming the rows directly match the structure of Dodge[]
        return rows as Dodge[];
    } catch (error) {
        console.error(error);
        return [];
    }
}
