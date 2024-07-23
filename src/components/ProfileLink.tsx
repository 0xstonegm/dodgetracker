"use client";

import Link from "next/link";
import posthog from "posthog-js";

export interface ProfileLinkProps extends React.HTMLAttributes<HTMLDivElement> {
  href: string;
  profileLink: boolean;
}

function captureEvent(eventName: string, href: string) {
  posthog.capture(eventName, { href });
}

export default function ProfileLink(props: ProfileLinkProps) {
  return (
    <Link
      onClick={(_e) => {
        captureEvent("profile_link_clicked", props.href);
      }}
      href={props.href}
      style={{
        pointerEvents: props.profileLink ? "auto" : "none",
      }}
    >
      {props.children}
    </Link>
  );
}
