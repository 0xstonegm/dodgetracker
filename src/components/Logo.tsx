"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Logo() {
    const currentUserRegion = usePathname().split("/")[1];

    return (
        <Link href={`/${currentUserRegion}`}>
            <p className="text-xl md:text-3xl">Dodgetracker</p>
        </Link>
    );
}
