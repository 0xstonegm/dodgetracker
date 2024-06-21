"use client";

import { sendGTMEvent } from "@next/third-parties/google";
import { useLocalStorage, useVisibilityChange } from "@uidotdev/usehooks";
import { Check, Lightbulb, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { autoFetchKey } from "../autoFetch";
import { cn, secondsBetween } from "../lib/utils";
import Toast from "./Toast";
import withNoSSR from "./higherOrder/withNoSSR";
import { Button } from "./ui/button";

const updateIntervalSecs = 15;

const notifPressCountIntervalSecs = 10;
const notifPressCountThreshold = 3;

export type FetchButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function FetchButton({ className, ...props }: FetchButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [autoFetch, _setAutoFetch] = useLocalStorage(autoFetchKey, false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const tabVisible = useVisibilityChange();
  const interval = useRef<number | null>(null);
  const lastFetchTime = useRef<Date>(new Date());
  const [presses, setPresses] = useState(new Set<Date>());

  // Fetch new dodges
  const fetch = useCallback(
    (eventName: string) => {
      setButtonClicked(true);
      startTransition(() => {
        router.refresh();
        setIsDone(true);
      });
      lastFetchTime.current = new Date();

      sendGTMEvent({ event: eventName });
      posthog.capture(eventName);
    },
    [setButtonClicked, startTransition, router, setIsDone],
  );

  const setInterval = useCallback(() => {
    interval.current = window.setInterval(() => {
      fetch("auto_fetch");
    }, updateIntervalSecs * 1000);
  }, [fetch]);

  const clearInterval = useCallback(() => {
    if (interval.current) {
      window.clearInterval(interval.current);
    }
  }, [interval]);

  // Reset interval
  const resetInterval = useCallback(() => {
    clearInterval();
    if (autoFetch) {
      setInterval();
    }
  }, [autoFetch, setInterval, clearInterval]);

  // Start an interval when autoFetch is enabled, clear it when disabled
  useEffect(() => {
    if (autoFetch) {
      setInterval();
    } else {
      clearInterval();
    }

    return () => {
      clearInterval();
    };
  }, [autoFetch, fetch, setInterval, clearInterval]);

  // Reset button state after a short delay
  useEffect(() => {
    if (!isPending && buttonClicked) {
      const timeoutId = setTimeout(() => {
        setIsDone(false);
        setButtonClicked(false);
      }, 250);
      return () => clearTimeout(timeoutId);
    }
  }, [isPending, buttonClicked]);

  // Start interval when tab becomes visible, stop interval when hidden
  useEffect(() => {
    if (tabVisible) {
      if (autoFetch) {
        if (
          secondsBetween(lastFetchTime.current, new Date()) > updateIntervalSecs
        ) {
          fetch("auto_fetch");
        }
        resetInterval();
      }
    } else {
      clearInterval();
    }
  }, [tabVisible, autoFetch, fetch, resetInterval, clearInterval]);

  const showNotification = () => {
    toast.custom(
      (t) => (
        <Toast className="flex flex-col" t={t}>
          <div className="flex items-center gap-1">
            <Lightbulb />
            <p className="font-semibold">Dodge not appearing?</p>
          </div>
          <p className="text-sm font-light">
            Dodges can take up to 30s to be tracked during heavy loads of the
            League API. The player who dodged could also be below master tier
            (or 0 LP), if so, the dodge can not be tracked.
          </p>
        </Toast>
      ),
      {
        id: "many-presses-toast",
        duration: 10 * 1000,
      },
    );
    posthog.capture("many_fetches");
  };

  return (
    <Button
      disabled={isPending || isDone}
      variant={"secondary"}
      className={cn(
        "min-h-8 min-w-16 text-lg md:min-h-10 md:min-w-20",
        className,
      )}
      onClick={() => {
        fetch("fetch_clicked");
        resetInterval();

        if (presses.size + 1 >= notifPressCountThreshold) {
          showNotification();
          setPresses(new Set());
        } else {
          const now = new Date();
          setPresses((prev) => {
            return new Set(prev).add(now);
          });
          setTimeout(() => {
            setPresses((prev) => {
              const newPresses = new Set(prev);
              newPresses.delete(now);
              return newPresses;
            });
          }, notifPressCountIntervalSecs * 1000);
        }
      }}
      {...props}
    >
      <div className="flex items-center justify-center">
        {isPending ? (
          <Loader2 className="animate-spin" />
        ) : isDone ? (
          <div className="text-xl md:text-2xl">
            <Check />
          </div>
        ) : (
          "Fetch"
        )}
      </div>
    </Button>
  );
}

export default withNoSSR(FetchButton);
