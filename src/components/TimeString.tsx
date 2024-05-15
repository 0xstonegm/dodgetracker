"use client";

import { useEffect, useState } from "react";
import { timeDiffString } from "../lib/utils";

export default function TimeString({
  utcTime: utcTime,
}: {
  utcTime: Date | null;
}) {
  const [, setTick] = useState(0); // Use state to force re-render

  // console.log(utcTime.toLocaleString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs only once on mount

  if (utcTime === null) {
    return <p>Time unknown</p>;
  }

  return (
    <p title={`Dodge detected at:\n${utcTime.toLocaleString()}`}>
      {timeDiffString(utcTime)}
    </p>
  );
}
