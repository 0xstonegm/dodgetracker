"use client";

import { sendGTMEvent } from "@next/third-parties/google";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useState, useTransition } from "react";
import { MdDone } from "react-icons/md";
import { cn } from "../lib/utils";
import { Button } from "./Button";
import LoadingSpinner from "./LoadingSpinner";

const updateIntervalSecs = 15;

export interface RefreshButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function RefreshButton({
  className,
  ...props
}: RefreshButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultLabel = "Fetch";

  const [buttonClicked, setButtonClicked] = useState(false);
  const [isDone, setIsDone] = useState(false);

  function getAutoFetch(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    const value = localStorage.getItem("autoFetch");
    return value === "true";
  }

  useEffect(() => {
    if (!isPending && buttonClicked) {
      const timeoutId = setTimeout(() => {
        setIsDone(false);
        setButtonClicked(false);
      }, 250);
      return () => clearTimeout(timeoutId);
    }
  }, [isPending, buttonClicked]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (getAutoFetch()) {
        setButtonClicked(true);
        startTransition(() => {
          sendGTMEvent({ event: "auto_fetch" });
          posthog.capture("auto_fetch");

          router.refresh();
          setIsDone(true);
        });
      }
    }, updateIntervalSecs * 1000);

    return () => clearInterval(intervalId);
  }, [router]);

  return (
    <Button
      disabled={isPending || isDone}
      className={cn(
        "min-h-6 min-w-12 text-sm md:min-h-10 md:min-w-16 md:text-lg",
        className,
      )}
      onClick={() => {
        setButtonClicked(true);
        startTransition(() => {
          router.refresh();
          setIsDone(true);
        });

        sendGTMEvent({ event: "fetch_clicked" });
        posthog.capture("fetch_clicked");
      }}
      {...props}
    >
      <div className="flex items-center justify-center">
        {isPending ? (
          <div className="size-5 md:size-7">
            <LoadingSpinner />
          </div>
        ) : isDone ? (
          <div className="text-xl md:text-2xl">
            <MdDone />
          </div>
        ) : (
          defaultLabel
        )}
      </div>
    </Button>
  );
}
