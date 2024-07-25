"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../../lib/utils";
import { supportedUserRegions } from "../../../regions";

interface NavBarLinkProps extends React.HTMLAttributes<HTMLDivElement> {
  path: string;
}

export default function NavbarLink({ path, className }: NavBarLinkProps) {
  let currentUserRegion: string | null = usePathname().split("/")[1];
  currentUserRegion = (function () {
    if (!supportedUserRegions.has(currentUserRegion)) {
      return null;
    }
    return currentUserRegion;
  })();

  function getNewPath(destination: string) {
    const path = destination.toLowerCase();

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
      <div className={cn(className)}>{path}</div>
    </Link>
  );
}
