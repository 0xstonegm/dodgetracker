"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import useWebSocket from "react-use-websocket";
import { z } from "zod";
import { Dodge, dodgeSchema, regionUpdateScema } from "../lib/types";
import { userRegionToRiotRegion } from "../regions";
import DodgeList from "./DodgeList";
import LastUpdate from "./LastUpdate";
import LoadingSpinner from "./LoadingSpinner";

/* eslint-disable */
interface BigInt {
  /** Convert to BigInt to string form in JSON.stringify */
  toJSON: () => string;
}
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};
/* eslint-enable */

type DodgeListWebSocketProps = {
  userRegion: string;
};

const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL!;

const dodgeMessageSchema = z.object({
  type: z.literal("dodge"),
  data: dodgeSchema,
});
const regionUpdateMessage = z.object({
  type: z.literal("region_update"),
  data: regionUpdateScema,
});
const websocketMessageSchema = z.discriminatedUnion("type", [
  regionUpdateMessage,
  dodgeMessageSchema,
]);

const dodgeListSchema = z.object({
  dodges: z.array(dodgeSchema),
});

async function fetchDodges(riotRegion: string) {
  const response = await fetch(`/api/dodges?region=${riotRegion}`);
  if (!response.ok)
    throw new Error(`Fetch failed with status: ${response.status}.`);

  const data = await response.json(); // eslint-disable-line
  return dodgeListSchema.parse(data).dodges;
}

export default function DodgeListWebSocket(props: DodgeListWebSocketProps) {
  const riotRegion = userRegionToRiotRegion(props.userRegion);
  const queryKey = useMemo(() => ["dodges", riotRegion], [riotRegion]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const queryClient = useQueryClient();

  const { data: dodges, isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchDodges(riotRegion),
    staleTime: Infinity,
  });

  function invalidateQuery() {
    queryClient
      .invalidateQueries({ queryKey, exact: true })
      .catch(console.error);
  }

  const { lastJsonMessage } = useWebSocket(
    `${websocketUrl}/?region=${riotRegion}`,
    {
      onOpen: () => {
        console.log("WebSocket connection opened");
        invalidateQuery();
      },
      onClose: () => {
        console.log("WebSocket connection closed");
        invalidateQuery();
      },
      onError: (event) => {
        return console.error("WebSocket error", event);
      },
      shouldReconnect: (_) => true,
    },
  );

  // Effect to handle incoming messages
  useEffect(() => {
    if (lastJsonMessage !== null) {
      try {
        console.log("Received WebSocket message:", lastJsonMessage);
        const result = websocketMessageSchema.safeParse(lastJsonMessage);
        if (!result.success) {
          console.error("Error parsing WebSocket message:", result.error);
          return;
        }
        const message = result.data;

        if (message.type === "region_update") {
          setLastUpdate(message.data.update_time);
        } else if (message.type === "dodge") {
          queryClient.setQueryData(queryKey, (oldData: Dodge[]) => {
            return [message.data, ...oldData];
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastJsonMessage, queryClient, queryKey]);

  if (!dodges && isFetching) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!dodges) return;
  return (
    <>
      <div className="flex items-center justify-center">
        <LastUpdate lastUpdatedAt={lastUpdate} />
      </div>
      <DodgeList
        dodges={dodges}
        userRegion={props.userRegion}
        profileLink={true}
        statSiteButtons={true}
      />
    </>
  );
}
