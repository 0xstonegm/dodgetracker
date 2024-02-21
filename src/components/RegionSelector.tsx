"use client";

import React from "react";

export default function RegionSelector() {
    return (
        <>
            <select className="ml-2 rounded-md bg-zinc-700">
                <option value="euw">euw</option>
                <option value="na">na</option>
                <option value="kr">kr</option>
                <option value="eune">eune</option>
            </select>
        </>
    );
}
