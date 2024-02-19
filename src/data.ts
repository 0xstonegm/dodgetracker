import { createPool } from "mysql2/promise";
import { Dodge } from "./types"; // Assuming Dodge is properly defined to match the query results

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "dodgetracker",
});

export async function getAllDodges(): Promise<Dodge[]> {
    try {
        const [rows, _] = await pool.query(`
            SELECT
                d.dodge_id as dodgeId,
                p.summoner_name as summonerName,
                d.lp_before as lpBeforeDodge,
                p.rank_tier as rankTier,
                (d.lp_before - d.lp_after) as lpLost,
                d.dodge_timestamp as time
            FROM
                dodges d
            INNER JOIN
                players p ON d.summoner_id = p.summoner_id
            ORDER BY
                d.dodge_timestamp DESC
        `);

        // Assuming the rows directly match the structure of Dodge[]
        return rows as Dodge[];
    } catch (error) {
        console.error(error);
        return [];
    }
}
