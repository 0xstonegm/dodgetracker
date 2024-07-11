"use client";

import { useLocalStorage } from "@uidotdev/usehooks";
import { Sparkles, X } from "lucide-react";
import posthog from "posthog-js";

export default function Notif() {
  const [dismissed, setDismissed] = useLocalStorage(
    "perfNotifDismissed",
    false,
  );

  if (dismissed || Date.now() >= new Date("2024-07-20").getTime()) {
    return null;
  }

  return (
    <div className="mx-auto mt-2 flex w-[95%] items-center justify-between gap-1 rounded-md border-4 border-zinc-800 bg-green-900/50 px-2 py-1">
      <div className="flex items-center gap-2">
        <Sparkles className="size-14 sm:size-6" />
        <p>
          <b>Improved dodge detection!</b> Most new dodges are now detected
          within just 5 seconds.
        </p>
      </div>
      <X
        className="size-14 cursor-pointer sm:size-6"
        onClick={() => {
          posthog.capture("perf_notif_dismissed");
          setDismissed(true);
        }}
      />
    </div>
  );
}
