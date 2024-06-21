"use client";

import { useLocalStorage } from "@uidotdev/usehooks";
import posthog from "posthog-js";
import toast from "react-hot-toast";
import { autoFetchKey } from "../autoFetch";
import { cn } from "../lib/utils";
import Toast from "./Toast";
import withNoSSR from "./higherOrder/withNoSSR";
import { Switch } from "./ui/switch";

function AutoFetchSwitch() {
  const [autoFetch, setAutoFetch] = useLocalStorage(autoFetchKey, false);

  const handleCheckedChange = (value: boolean) => {
    toast.custom(
      (t) => (
        <Toast t={t}>
          <p className="flex">
            Auto-fetch{" "}
            <p
              className={cn("ml-1 rounded-md px-1 font-semibold", {
                "bg-green-800": value,
                "bg-red-800": !value,
              })}
            >
              {value ? " enabled" : " disabled"}
            </p>
          </p>
          {value && (
            <p className="mt-1 text-sm font-light">
              Dodges will automatically be fetched every 15 seconds.
            </p>
          )}
        </Toast>
      ),
      {
        id: "auto-fetch-toast",
      },
    );
    setAutoFetch(value);
    posthog.capture("auto_fetch_switch", {
      enabled: value,
    });
  };

  return (
    <div className="flex items-center justify-center text-sm">
      <p className="pr-2">Auto-fetch</p>
      <Switch checked={autoFetch} onCheckedChange={handleCheckedChange} />
    </div>
  );
}

export default withNoSSR(AutoFetchSwitch);
