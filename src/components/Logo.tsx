"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Logo() {
    let currentUserRegion = usePathname().split("/")[1];
    currentUserRegion = (function () {
        // TODO: redirect to correct region
        if (currentUserRegion === "about") {
            return "";
        }
        return currentUserRegion;
    })();

    return (
        <Link href={`/${currentUserRegion}`}>
            <p className="text-xl md:text-3xl">Dodgetracker</p>
        </Link>
    );
}
