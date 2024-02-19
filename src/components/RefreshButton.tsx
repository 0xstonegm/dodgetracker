"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

export default function RefreshButton() {
    const router = useRouter();

    return <Button label="Refresh" onClick={() => router.refresh()} />;
}
