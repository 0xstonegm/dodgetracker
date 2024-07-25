import RankInfo from "@/src/components/RankInfo";
import TimeString from "@/src/components/TimeString";
import { type Dodge, type Tier } from "@/src/lib/types";
import { StatSite } from "@/src/statSites";
import SmallProfileCard from "../../player/components/SmallProfileCard";
import StatSiteButton from "../../player/components/StatSiteButton";
import LpLostBadge from "./LpLostBadge";

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
        <SmallProfileCard
          gameName={props.dodge.gameName}
          tagLine={props.dodge.tagLine}
          profileIconId={props.dodge.profileIconId}
          userRegion={props.userRegion}
          profileLink={props.profileLink}
        />
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
        <LpLostBadge lpLost={props.dodge.lpLost} />
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
