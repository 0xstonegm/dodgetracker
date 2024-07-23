"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { z } from "zod";
import { dodgeSchema, regionUpdateScema, type Dodge } from "../lib/types";
import { userRegionToRiotRegion } from "../regions";
import DodgeList from "./DodgeList";
import LastUpdate from "./LastUpdate";
import LoadingSpinner from "./LoadingSpinner";

// @ts-expect-error: Overriding toJSON method for BigInt
BigInt.prototype.toJSON = function () {
  return this.toString();
};

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
  serverTime: z.string().datetime({ offset: true }).pipe(z.coerce.date()),
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
  const [lastUpdate, setLastUpdate] = useState<{
    lastUpdateTime: Date;
    serverTime: Date;
  } | null>(null);

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

  const { lastJsonMessage, readyState } = useWebSocket(
    `${websocketUrl}/?region=${riotRegion}`,
    {
      onOpen: () => {
        invalidateQuery();
      },
      onClose: () => {
        invalidateQuery();
      },
      onError: (event) => {
        posthog.capture("websocket_error", { event });
        console.error("WebSocket error", event);
      },
      shouldReconnect: (_) => true,
    },
  );

  useEffect(() => {
    if (lastJsonMessage !== null) {
      try {
        const message = websocketMessageSchema.parse(lastJsonMessage);

        if (message.type === "region_update") {
          setLastUpdate({
            lastUpdateTime: message.data.update_time,
            serverTime: message.serverTime,
          });
        } else if (message.type === "dodge") {
          queryClient.setQueryData(queryKey, (oldData: Dodge[]) => {
            return [message.data, ...oldData];
          });
        }
      } catch (error) {
        posthog.capture("websocket_msg_parse_error", { error });
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
        {readyState == ReadyState.OPEN && lastUpdate && (
          <LastUpdate
            lastUpdatedAt={lastUpdate.lastUpdateTime}
            initialServerTime={lastUpdate.serverTime}
          />
        )}
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
