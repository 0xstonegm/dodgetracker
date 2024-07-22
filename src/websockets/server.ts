import "dotenv/config";
import fs from "fs";
import https from "https";
import { Client } from "pg";
import { URL } from "url";
import WebSocket, { WebSocketServer } from "ws";
import { z } from "zod";
import {
  dodgeSchema,
  regionUpdateScema,
  type Dodge,
  type RegionUpdate,
} from "../lib/types";
import logger from "./logger";

type WebSocketWithRegion = WebSocket & { region: string };

const serverOptions = {
  cert: fs.readFileSync(process.env.CERT_FILE!),
  key: fs.readFileSync(process.env.KEY_FILE!),
};

const port = 8080;

const server = https.createServer(serverOptions);
const wss = new WebSocketServer({ server });

const queryParamSchema = z.object({
  region: z.enum(["EUW1", "EUN1", "NA1", "KR", "OC1"]),
});

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
});

function broadcastDodge(dodge: Dodge) {
  logger.info(
    `Broadcasting ${dodge.riotRegion} dodge with ID: ${dodge.dodgeId}`,
  );
  wss.clients.forEach((client) => {
    const region = (client as WebSocketWithRegion).region;
    if (region !== dodge.riotRegion) return;

    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify(
          { type: "dodge", data: dodge },
          (_key, value) =>
            typeof value === "bigint" ? value.toString() : value, // eslint-disable-line
        ),
      );
    }
  });
}

function broadcastRegionUpdate(regionUpdate: RegionUpdate) {
  logger.info(`Broadcasting region update: ${regionUpdate.region}`);
  const serverTime = new Date().toISOString();
  wss.clients.forEach((client) => {
    if ((client as WebSocketWithRegion).region === regionUpdate.region) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "region_update",
            data: regionUpdate,
            serverTime,
          }),
        );
      }
    }
  });
}

async function getLatestUpdateTime(region: string) {
  const result = await pgClient.query<{
    json_data: RegionUpdate;
  }>(
    `SELECT row_to_json(t) AS json_data
     FROM (SELECT * FROM latest_updates WHERE region = $1) t`,
    [region],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].json_data;
}

pgClient.connect().catch(logger.error);

pgClient
  .query("LISTEN dodge_insert")
  .then(() => {
    logger.info("Listening for dodge_insert events");
  })
  .catch(console.error);
pgClient
  .query("LISTEN region_update")
  .then(() => {
    logger.info("Listening for region_update events");
  })
  .catch(console.error);

pgClient.on("notification", (notification) => {
  if (notification.channel === "dodge_insert") {
    if (notification.payload) {
      const parseResult = dodgeSchema.safeParse(
        JSON.parse(notification.payload),
      );

      if (!parseResult.success) {
        logger.error(
          "Error parsing dodge_insert notification: ",
          parseResult.error,
        );
        return;
      }

      broadcastDodge(parseResult.data);
    }
  } else if (notification.channel === "region_update") {
    if (notification.payload) {
      const parseResult = regionUpdateScema.safeParse(
        JSON.parse(notification.payload),
      );

      if (!parseResult.success) {
        logger.error(
          "Error parsing region_update notification: ",
          parseResult.error,
        );
        return;
      }

      broadcastRegionUpdate(parseResult.data);
    }
  }
});

wss.on("connection", (ws: WebSocketWithRegion, req) => {
  logger.info("Client connected");
  logger.info(`Number of connected clients: ${wss.clients.size}`);

  const queryParams = Object.fromEntries(
    new URL(
      req.url ?? "/",
      `https://${req.headers.host}`,
    ).searchParams.entries(),
  );
  const queryParamResult = queryParamSchema.safeParse(queryParams);

  if (!queryParamResult.success) {
    logger.error("Error parsing query params: ", queryParamResult.error);
    ws.send(
      JSON.stringify({
        error: "Invalid region",
        details: queryParamResult.error,
      }),
    );
    ws.close();
    return;
  }

  ws.region = queryParamResult.data.region;
  logger.info(`Client region detected: ${ws.region}`);

  getLatestUpdateTime(ws.region)
    .then((result) => {
      if (result) {
        const serverTime = new Date().toISOString();
        ws.send(
          JSON.stringify({
            type: "region_update",
            data: result,
            serverTime,
          }),
        );
      }
    })
    .catch(console.error);

  ws.on("close", () => {
    logger.info("Client disconnected");
    logger.info(`Number of connected clients: ${wss.clients.size}`);
  });

  ws.on("error", (error) => {
    logger.error("WebSocket error: ", error);
  });
});

server.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
