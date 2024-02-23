"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

export default function RefreshButton() {
    const router = useRouter();

    return (
        <Button
            className="text-sm md:text-xl"
            label="Refresh"
            onClick={() => router.refresh()}
        />
    );
}
