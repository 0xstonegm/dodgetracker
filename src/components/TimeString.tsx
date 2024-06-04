"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { timeDiffString } from "../lib/utils";
import withNoSSR from "./higherOrder/withNoSSR";

function TimeString({ utcTime: utcTime }: { utcTime: Date | null }) {
  const [, setTick] = useState(0); // Use state to force re-render

  // console.log(utcTime.toLocaleString());
  //

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs only once on mount

  if (utcTime === null) {
    return <p>Time unknown</p>;
  }

  const formattedDate = format(utcTime, "HH:mm:ss, eee do 'of' MMMM yyyy");

  return (
    <p title={`Dodge detected at:\n${formattedDate}`}>
      {timeDiffString(utcTime)}
    </p>
  );
}

export default withNoSSR(TimeString);
