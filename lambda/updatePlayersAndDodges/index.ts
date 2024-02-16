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
    lp: number;
    gamesPlayed: number;
}

interface Dodge {
    summonerId: string;
    lp_before: number;
    lp_after: number;
    atGamesPlayed: number;
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
            lp: entry.leaguePoints,
            gamesPlayed: entry.wins + entry.losses,
        })),
    );

    return players;
}

async function fetchCurrentPlayersData(connection): Promise<{
    [summonerId: string]: {
        lp: number;
        gamesPlayed: number;
    };
}> {
    const [rows] = await connection.execute(
        "SELECT summoner_id, current_lp, games_played FROM players",
    );
    const currentPlayersData = {};
    rows.forEach((row) => {
        currentPlayersData[row.summoner_id] = {
            lp: row.current_lp,
            gamesPlayed: row.games_played,
        };
    });
    return currentPlayersData;
}

async function getDodges(
    oldPlayersData: {
        [summonerId: string]: { lp: number; gamesPlayed: number };
    },
    newPlayersData: Player[],
): Promise<Dodge[]> {
    const dodges: Dodge[] = [];
    for (const player of newPlayersData) {
        if (!oldPlayersData[player.summonerId]) {
            continue;
        }

        const playerDataBefore = oldPlayersData[player.summonerId];

        if (
            player.lp < playerDataBefore.lp &&
            player.gamesPlayed === playerDataBefore.gamesPlayed
        ) {
            dodges.push({
                summonerId: player.summonerId,
                lp_before: playerDataBefore.lp,
                lp_after: player.lp,
                atGamesPlayed: player.gamesPlayed,
            });
        }
    }
    return dodges;
}

async function insertDodges(dodges: Dodge[], connection) {
    const query = `
        INSERT INTO dodges (summoner_id, lp_before, lp_after, at_games_played)
        VALUES ?;
    `;

    const values = dodges.map((dodge) => [
        dodge.summonerId,
        dodge.lp_before,
        dodge.lp_after,
        dodge.atGamesPlayed,
    ]);

    await connection.query(query, [values]);
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
        player.lp,
        player.gamesPlayed,
    ]);

    await connection.query(query, [values]);
}

export const handler: Handler = async () => {
    const connection = await createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: "dodgetracker",
        password: process.env.DB_PASS,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    });

    try {
        await connection.beginTransaction(); // Start the transaction

        const players = await getPlayers();
        const currentPlayersData = await fetchCurrentPlayersData(connection);
        const dodges = await getDodges(currentPlayersData, players);

        if (dodges.length > 0) {
            await insertDodges(dodges, connection);
            console.log(`Batch inserted ${dodges.length} dodges.`);
        }
        if (players.length > 0) {
            await upsertPlayers(players, connection);
            console.log(`Batch updated ${players.length} players.`);
        }

        await connection.commit();
        console.log("Transaction committed successfully.");
    } catch (error) {
        await connection.rollback();
        console.error("Transaction rolled back due to an error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error processing request",
                error,
            }),
        };
    } finally {
        await connection.end();
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Players and dodges updated successfully",
        }),
    };
};
