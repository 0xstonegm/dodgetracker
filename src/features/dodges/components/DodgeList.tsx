import { type Dodge } from "../../../lib/types";
import DodgeEntry from "./DodgeEntry";

export default function DodgeList(props: {
  dodges: Dodge[];
  clientServerTimeDiff: number;
  userRegion: string;
  statSiteButtons: boolean;
  profileLink: boolean;
}) {
  return (
    <ul className="p-2">
      {props.dodges.map((dodge, _) => (
        <li key={dodge.dodgeId} className="border-b border-zinc-900 py-2">
          <DodgeEntry
            dodge={dodge}
            clientServerTimeDiff={props.clientServerTimeDiff}
            userRegion={props.userRegion}
            statSiteButtons={props.statSiteButtons}
            profileLink={props.profileLink}
          />
        </li>
      ))}
    </ul>
  );
}
