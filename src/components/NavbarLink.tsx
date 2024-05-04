"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supportedUserRegions } from "../regions";

export default function NavbarLink({ path }: { path: string }) {
    let currentUserRegion: string | null = usePathname().split("/")[1];
    currentUserRegion = (function () {
        if (!supportedUserRegions.has(currentUserRegion)) {
            return null;
        }
        return currentUserRegion;
    })();

    function getNewPath(destination: string) {
        let path = destination.toLowerCase();

        if (!currentUserRegion) {
            if (path === "leaderboard") {
                // FIXME: Temporary fix, should be replaced with a proper solution
                return "/euw/leaderboard";
            } else {
                return `/${path}`;
            }
        } else {
            return `/${currentUserRegion}/${path}`;
        }
    }

    return (
        <Link href={getNewPath(path)}>
            <div className="text-lg md:text-xl">{path}</div>
        </Link>
    );
}
