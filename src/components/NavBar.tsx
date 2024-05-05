import Link from "next/link";
import Logo from "./Logo";
import NavbarLink from "./NavbarLink";
import RegionSelector from "./RegionSelector";

function NavBar() {
  return (
    <div className="flex justify-between bg-zinc-800 p-2">
      <div className="flex items-center">
        <div className="flex border-r border-zinc-700 pr-2">
          <Logo />
          <RegionSelector />
        </div>
        <div className="flex pl-2">
          <NavbarLink path={"Leaderboard"} />
        </div>
      </div>
      <div className="flex">
        <Link href="/about">
          <div className="text-lg md:text-xl">About</div>
        </Link>
      </div>
    </div>
  );
}

export default NavBar;
