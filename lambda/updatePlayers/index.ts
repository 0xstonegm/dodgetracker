import { Handler } from "aws-lambda";
import axios from "axios";
import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const RIOT_API_KEY = process.env.RIOT_API_KEY;

interface Player {
    summonerId: string;
    summonerName: string;
    rankTier: string;
    currentLp: number;
    gamesPlayed: number;
}

async function getPlayers(): Promise<Player[]> {
    const queues = ["masterleagues", "grandmasterleagues", "challengerleagues"];
    const baseUrl = "https://euw1.api.riotgames.com/lol/league/v4";
    const apiCalls = queues.map((queue) =>
        axios.get(
            `${baseUrl}/${queue}/by-queue/RANKED_SOLO_5x5?api_key=${RIOT_API_KEY}`,
        ),
    );

    const responses = await Promise.all(apiCalls);
    const players: Player[] = responses.flatMap((response) =>
        response.data.entries.map((entry) => ({
            summonerId: entry.summonerId,
            summonerName: entry.summonerName,
            rankTier: response.data.tier,
            currentLp: entry.leaguePoints,
            gamesPlayed: entry.wins + entry.losses,
        })),
    );

    return players;
}

async function upsertPlayers(players: Player[], connection) {
    const query = `
        INSERT INTO players (summoner_id, summoner_name, rank_tier, current_lp, games_played)
        VALUES ? ON DUPLICATE KEY UPDATE
        summoner_name = VALUES(summoner_name),
        rank_tier = VALUES(rank_tier),
        current_lp = VALUES(current_lp),
        games_played = VALUES(games_played);
    `;

    const values = players.map((player) => [
        player.summonerId,
        player.summonerName,
        player.rankTier,
        player.currentLp,
        player.gamesPlayed,
    ]);

    await connection.query(query, [values]);
}

export const handler: Handler = async () => {
    try {
        const connection = await createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: "dodgetracker",
            password: process.env.DB_PASS,
            port: process.env.DB_PORT
                ? parseInt(process.env.DB_PORT, 10)
                : 3306,
        });

        const players = await getPlayers();
        if (players.length > 0) {
            await upsertPlayers(players, connection);
            console.log(`Batch updated ${players.length} players.`);
        }

        await connection.end();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Players updated" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error processing request",
                error,
            }),
        };
    }
};
