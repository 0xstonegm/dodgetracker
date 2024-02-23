import Link from "next/link";
import React from "react";
import RegionSelector from "./RegionSelector";
import Logo from "./Logo";

function NavBar() {
    return (
        <div className="flex justify-between bg-zinc-800 p-2">
            <div className="flex">
                <Logo />
                <RegionSelector />
            </div>
            <div className="flex">
                <Link href="/about">
                    <div className="text-lg md:text-2xl">About</div>
                </Link>
            </div>
        </div>
    );
}

export default NavBar;
