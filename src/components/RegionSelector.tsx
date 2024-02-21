"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { supportedUserRegions } from "../regions";

export default function RegionSelector() {
    const pathname = usePathname();
    const router = useRouter();
    const userRegion = pathname.split("/")[1];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(`/${e.target.value}`);
    };

    return (
        <>
            <select
                className="ml-2 rounded-md bg-zinc-700"
                defaultValue={userRegion}
                onChange={handleChange}
            >
                {Array.from(supportedUserRegions).map((region) => (
                    <option key={region} value={region}>
                        {region.toUpperCase()}
                    </option>
                ))}
            </select>
        </>
    );
}
