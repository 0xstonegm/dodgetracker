import { profileIconUrl } from "@/src/lib/utils";
import Image from "next/image";
import ProfileLink from "./ProfileLink";

export default function SmallProfileCard(props: {
  gameName: string;
  tagLine: string;
  profileIconId: number;
  userRegion: string;
  profileLink: boolean;
}) {
  return (
    <ProfileLink
      href={`/${props.userRegion}/${props.gameName}-${props.tagLine}`}
      profileLink={props.profileLink}
    >
      <section className="mr-2 flex origin-right transform items-center justify-center underline-offset-4 transition-transform hover:underline sm:justify-start md:hover:scale-105">
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
        <div className="flex flex-wrap break-all pl-2 font-bold">
          <p>{props.gameName}</p>
          <p>#{props.tagLine}</p>
        </div>
      </section>
    </ProfileLink>
  );
}
