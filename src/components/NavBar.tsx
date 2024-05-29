import Link from "next/link";
import Logo from "./Logo";
import NavbarLink from "./NavbarLink";
import RegionSelector from "./RegionSelector";
import SearchBar from "./SearchBar";

function NavBar() {
  return (
    <nav className="flex flex-col bg-zinc-800 p-2">
      <section className="flex justify-between">
        <div className="flex items-center gap-1">
          <section className="flex border-r border-zinc-700">
            <Logo />
            <RegionSelector className="mr-1" />
          </section>
          <SearchBar className="hidden md:visible md:flex" />
          <section className="flex pl-2">
            <NavbarLink className="md:text-lg" path={"Leaderboard"} />
          </section>
        </div>
        <section className="flex items-center">
          <Link href="/about">
            <p className="md:text-lg">About</p>
          </Link>
        </section>
      </section>
      <section className="pt-1 md:hidden">
        <SearchBar className="w-full" />
      </section>
    </nav>
  );
}

export default NavBar;
