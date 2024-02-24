"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { supportedUserRegions } from "../regions";

export default function RegionSelector() {
    const pathname = usePathname();
    const router = useRouter();
    const userRegion = pathname.split("/")[1];
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        startTransition(() => {
            router.push(`/${e.target.value}`);
        });
    };

    return (
        <>
            <select
                className="ml-2 rounded-md bg-zinc-700 text-sm md:text-base"
                defaultValue={userRegion}
                onChange={handleChange}
                disabled={isPending}
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
