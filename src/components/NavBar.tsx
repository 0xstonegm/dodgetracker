import Link from "next/link";
import React from "react";
import RegionSelector from "./RegionSelector";

function NavBar() {
    return (
        <div className="flex justify-between bg-zinc-800 p-2">
            <div className="flex">
                <Link href="/">
                    <div className="text-3xl">Dodgetracker</div>
                </Link>
                <RegionSelector />
            </div>
            <div className="flex">
                <Link href="/about">
                    <div className="text-xl">About</div>
                </Link>
            </div>
        </div>
    );
}

export default NavBar;
