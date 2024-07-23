import { useHover } from "@uidotdev/usehooks";
import { Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

function calculateElapsedSeconds(
  timeDiff: number, // the time difference between the server and the client
  lastUpdatedAt: Date,
): number {
  return (Date.now() - lastUpdatedAt.getTime() + timeDiff) / 1000;
}

export default function LastUpdate(props: {
  lastUpdatedAt: Date;
  initialServerTime: Date;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);
  const [highlight, setHighlight] = useState<boolean>(false);
  const [lastHighlight, setLastHighlight] = useState<Date | null>(null);

  const [ref, hovering] = useHover();

  useEffect(() => {
    // The time difference between the server and the client
    const timeDiff = props.lastUpdatedAt.getTime() - Date.now();

    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsedSeconds(timeDiff, props.lastUpdatedAt));
    }, 100);

    return () => clearInterval(interval);
  }, [props.initialServerTime, props.lastUpdatedAt]);

  useEffect(() => {
    if (props.lastUpdatedAt) {
      if (
        elapsedSeconds &&
        elapsedSeconds <= 1 &&
        (!lastHighlight || props.lastUpdatedAt > lastHighlight)
      ) {
        setHighlight(true);
        setLastHighlight(props.lastUpdatedAt);
        setTimeout(() => setHighlight(false), 250);
      }
    }
  }, [props.lastUpdatedAt, elapsedSeconds, lastHighlight]);

  if (!props.lastUpdatedAt) return null;

  return (
    <Popover open={hovering}>
      <PopoverTrigger className="cursor-default" tabIndex={-1}>
        <p className="flex items-center gap-1 text-sm md:text-base" ref={ref}>
          Last Dodge Check:
          <p
            className={cn(
              "flex min-w-14 items-center gap-[1px] rounded-md bg-zinc-800 p-1 text-center font-mono transition-colors duration-300 md:min-w-16",
              {
                "bg-green-400 text-zinc-800": highlight,
              },
            )}
          >
            <Timer className="size-4" />
            {elapsedSeconds !== null && `${elapsedSeconds.toFixed(1)}s`}
          </p>
        </p>
      </PopoverTrigger>
      <PopoverContent className="max-w-50 bg-zinc-800 sm:max-w-96">
        <div className="space-y-4">
          <ul className="list-inside list-disc space-y-2">
            <li>
              New dodges are sent from the server in <b>real-time</b>, no need
              to refresh the page.
            </li>
            <li>
              The time since the last dodge check on the server is displayed
              above.
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
