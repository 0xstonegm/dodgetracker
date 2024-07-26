import { type dodgeSchema } from "@/src/lib/types";
import { cn, profileIconUrl } from "@/src/lib/utils";
import Image from "next/image";
import { type z } from "zod";
import ProfileLink from "./ProfileLink";

function getFullPosition(
  position: z.infer<typeof dodgeSchema.shape.lolProsPosition>,
) {
  switch (position) {
    case "TOP":
      return "position_top";
    case "JUNGLE":
      return "position_jungle";
    case "MID":
      return "position_mid";
    case "BOT":
      return "position_bottom";
    case "SUPPORT":
      return "position_support";
    default:
      throw new Error("Invalid position");
  }
}

export default function SmallProfileCard(props: {
  gameName: string;
  tagLine: string;
  profileIconId: number;
  lolProsSlug: string | null;
  lolProsName: string | null;
  lolProsCountry: string | null;
  lolProsPosition: z.infer<typeof dodgeSchema.shape.lolProsPosition>;
  userRegion: string;
  profileLink: boolean;
  scale?: boolean;
}) {
  return (
    <ProfileLink
      href={`/${props.userRegion}/${props.gameName}-${props.tagLine}`}
      profileLink={props.profileLink}
    >
      <section
        className={cn(
          "group mr-2 flex origin-right transform items-center justify-center gap-2 transition-transform sm:justify-start",
          {
            "md:hover:scale-105": props.scale,
          },
        )}
      >
        <div className="relative size-10 self-center md:size-12">
          <Image
            alt="Profile Icon"
            src={profileIconUrl(props.profileIconId)}
            quality={100}
            unoptimized
            layout="fill"
            style={{ objectFit: "contain" }}
          ></Image>
        </div>
        <section className="flex flex-col">
          <div className="flex flex-wrap break-all font-semibold underline-offset-2 group-hover:underline">
            <p>{props.gameName}</p>
            <p>#{props.tagLine}</p>
          </div>
          {props.lolProsName &&
            props.lolProsCountry &&
            props.lolProsPosition && (
              <section className="flex items-center gap-[2px] text-sm font-light">
                <Image
                  alt={`${props.lolProsCountry} Flag`}
                  src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${props.lolProsCountry}.svg`}
                  quality={100}
                  width={30}
                  height={20}
                  unoptimized
                ></Image>
                <Image
                  alt={props.lolProsPosition}
                  src={`https://raw.communitydragon.org/14.14/plugins/rcp-fe-lol-career-stats/global/default/${getFullPosition(props.lolProsPosition)}.png`}
                  quality={100}
                  width={23}
                  height={23}
                  unoptimized
                ></Image>
                <p>{props.lolProsName}</p>
              </section>
            )}
        </section>
      </section>
    </ProfileLink>
  );
}
