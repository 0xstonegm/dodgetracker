"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarLink({ path }: { path: string }) {
    let currentUserRegion = usePathname().split("/")[1];
    currentUserRegion = (function () {
        // TODO: redirect to correct region
        if (currentUserRegion === "about") {
            return "";
        }
        return currentUserRegion;
    })();

    return (
        <Link href={`/${currentUserRegion}/${path.toLowerCase()}`}>
            <div className="text-lg md:text-xl">{path}</div>
        </Link>
    );
}
