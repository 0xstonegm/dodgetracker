import RankInfo from "@/src/components/RankInfo";
import TimeString from "@/src/components/TimeString";
import { type Dodge, type Tier } from "@/src/lib/types";
import { cn, profileIconUrl } from "@/src/lib/utils";
import { StatSite } from "@/src/statSites";
import Image from "next/image";
import ProfileLink from "../../player/components/ProfileLink";
import StatSiteButton from "../../player/components/StatSiteButton";

export default function DodgeEntry(props: {
  dodge: Dodge;
  clientServerTimeDiff: number;
  userRegion: string;
  statSiteButtons: boolean;
  profileLink: boolean;
}) {
  return (
    <div className="grid grid-cols-[3fr,1.2fr,0.9fr,0.8fr] gap-1 md:grid-cols-[2fr,0.8fr,0.3fr,0.6fr] md:gap-2">
      <section className="flex flex-wrap items-center md:text-xl">
        <ProfileLink
          href={`/${props.userRegion}/${props.dodge.gameName}-${props.dodge.tagLine}`}
          profileLink={props.profileLink}
        >
          <section className="mr-2 flex origin-right transform items-center justify-center underline-offset-4 transition-transform hover:underline sm:justify-start md:hover:scale-105">
            <div className="relative size-10 self-center md:size-12">
              <Image
                alt="Profile Icon"
                src={profileIconUrl(props.dodge.profileIconId)}
                quality={100}
                unoptimized
                layout="fill"
                style={{ objectFit: "contain" }}
              ></Image>
            </div>
            <div className="flex flex-wrap break-all pl-2 font-bold">
              <p>{props.dodge.gameName}</p>
              <p>#{props.dodge.tagLine}</p>
            </div>
          </section>
        </ProfileLink>
        {props.statSiteButtons && (
          <>
            {props.dodge.lolProsSlug && (
              <div className="mr-1">
                <StatSiteButton
                  riotRegion={props.dodge.riotRegion}
                  gameName={props.dodge.gameName}
                  tagLine={props.dodge.tagLine}
                  statSite={StatSite.LOLPROS}
                  lolProsSlug={props.dodge.lolProsSlug}
                />
              </div>
            )}
            <div className="mr-1">
              <StatSiteButton
                riotRegion={props.dodge.riotRegion}
                gameName={props.dodge.gameName}
                tagLine={props.dodge.tagLine}
                statSite={StatSite.OPGG}
              />
            </div>
            <StatSiteButton
              riotRegion={props.dodge.riotRegion}
              gameName={props.dodge.gameName}
              tagLine={props.dodge.tagLine}
              statSite={StatSite.DEEPLOL}
            />
          </>
        )}
      </section>
      <RankInfo rankTier={props.dodge.rankTier as Tier} lp={props.dodge.lp} />
      <section className="flex items-center justify-center text-left text-sm sm:justify-start md:text-base">
        <p
          className={cn(
            "text-nowrap rounded-xl bg-opacity-35 p-1 text-xs md:px-2 md:text-sm",
            {
              "border-2 border-yellow-400 border-opacity-30 bg-yellow-400":
                props.dodge.lpLost <= 5,
              "border-2 border-red-400 border-opacity-30 bg-red-400":
                props.dodge.lpLost > 5,
            },
          )}
        >
          -{props.dodge.lpLost} LP
        </p>
      </section>
      <section className="flex flex-wrap items-center justify-end text-right text-xs font-light md:text-sm">
        <TimeString
          utcTime={props.dodge.time}
          clientServerTimeDiff={props.clientServerTimeDiff}
        />
      </section>
    </div>
  );
}
