import LoadingSpinner from "@/src/components/LoadingSpinner";
import React from "react";

export default function loading() {
    return (
        <div className="flex h-[75vh] items-center justify-center">
            <LoadingSpinner />
        </div>
    );
}
