import Link from "next/link";
import Logo from "./Logo";
import NavbarLink from "./NavbarLink";
import RegionSelector from "./RegionSelector";
import SearchBar from "./SearchBar";
import { Separator } from "./ui/separator";

function NavBar() {
  return (
    <nav className="flex flex-col bg-zinc-800 p-2">
      <section className="flex justify-between">
        <div className="flex items-center">
          <section className="flex gap-1">
            <Logo />
            <RegionSelector />
          </section>
          <Separator className="mx-2 dark:bg-zinc-700" orientation="vertical" />
          <section className="hidden md:visible md:block">
            <SearchBar />
          </section>
          <Separator
            className="hidden dark:bg-zinc-700 md:visible md:mx-2 md:block"
            orientation="vertical"
          />
          <NavbarLink className="md:text-lg" path={"Leaderboard"} />
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
