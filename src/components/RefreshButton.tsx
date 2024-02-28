"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { MdDone } from "react-icons/md";
import { Button } from "./Button";
import LoadingSpinner from "./LoadingSpinner";

export default function RefreshButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const defaultLabel = "Fetch";

    const [buttonClicked, setButtonClicked] = useState(false);
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        if (!isPending && buttonClicked) {
            const timeoutId = setTimeout(() => {
                setIsDone(false);
                setButtonClicked(false);
            }, 250);
            return () => clearTimeout(timeoutId);
        }
    }, [isPending, buttonClicked]);

    return (
        <Button
            title="The database is updated automatically every ~10 seconds. Use this button to fetch the latest data from the database."
            disabled={isPending || isDone}
            className="min-h-6 min-w-12 text-sm md:min-h-10 md:min-w-16 md:text-lg"
            onClick={() => {
                setButtonClicked(true);
                startTransition(() => {
                    router.refresh();
                    setIsDone(true);
                });
            }}
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
