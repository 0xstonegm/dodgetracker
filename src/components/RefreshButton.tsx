"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useTransition } from "react";
import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { MdDone } from "react-icons/md";

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
            disabled={isPending}
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
