import React from "react";

export default function Player({
    params,
}: {
    params: {
        riotID: string;
    };
}) {
    return <div>Player: {params.riotID}</div>;
}
