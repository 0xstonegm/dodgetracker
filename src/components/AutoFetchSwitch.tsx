"use client";

import { useLocalStorage } from "@uidotdev/usehooks";
import posthog from "posthog-js";
import { autoFetchKey } from "../autoFetch";
import { Switch } from "./ui/switch";

export default function AutoFetchSwitch() {
  const [autoFetch, setAutoFetch] = useLocalStorage(autoFetchKey, false);

  const handleCheckedChange = (value: boolean) => {
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
