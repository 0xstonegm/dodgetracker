"use client";

import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";

export default function AutoFetchSwitch() {
    const [autoFetch, setAutoFetch] = useState(() => {
        const value = localStorage.getItem("autoFetch");
        return value === "true";
    });

    function setAndStoreAutoFetch(value: boolean) {
        localStorage.setItem("autoFetch", value.toString());
        setAutoFetch(value);
    }

    // Sync autoFetch between tabs
    useEffect(() => {
        // Handler to update state based on localStorage changes
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "autoFetch") {
                setAutoFetch(event.newValue === "true");
            }
        };

        // Add event listener for storage changes
        window.addEventListener("storage", handleStorageChange);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    return (
        <div className="flex items-center justify-center text-sm">
            <p className="pr-2">Auto-fetch</p>
            <Switch
                checked={autoFetch}
                onCheckedChange={setAndStoreAutoFetch}
            />
        </div>
    );
}
