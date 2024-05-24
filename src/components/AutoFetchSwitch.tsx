"use client";

import { useLocalStorage } from "@uidotdev/usehooks";
import posthog from "posthog-js";
import { autoFetchKey } from "../autoFetch";
import withNoSSR from "./higherOrder/withNoSSR";
import { Switch } from "./ui/switch";

function AutoFetchSwitch() {
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

export default withNoSSR(AutoFetchSwitch);
