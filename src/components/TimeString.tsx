"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { timeDiffString } from "../lib/utils";

function TimeString(props: {
  utcTime: Date | null;
  clientServerTimeDiff: number;
}) {
  const [, setTick] = useState(0); // Use state to force re-render

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (props.utcTime === null) {
    return <p>Time unknown</p>;
  }

  const formattedDate = format(
    props.utcTime,
    "HH:mm:ss, eee do 'of' MMMM yyyy",
  );

  return (
    <p title={`Dodge detected at:\n${formattedDate}`} suppressHydrationWarning>
      {timeDiffString(props.utcTime, props.clientServerTimeDiff)}
    </p>
  );
}

export default TimeString;
