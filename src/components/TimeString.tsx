"use client";

import { useEffect, useState } from "react";

function timeToString(utcTime: Date): string {
  const timeDiff = Date.now() - utcTime.getTime();

  const diffInSeconds: number = timeDiff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  if (diffInDays > 1) {
    const remainingHours = Math.floor(diffInHours % 24);
    return remainingHours === 0
      ? `${Math.floor(diffInDays)}d ago`
      : `${Math.floor(diffInDays)}d ${Math.floor(remainingHours)}h ago`;
  } else if (diffInHours > 1) {
    const remainingMinutes = Math.floor(diffInMinutes % 60);
    return remainingMinutes === 0
      ? `${Math.floor(diffInHours)}h ago`
      : `${Math.floor(diffInHours)}h ${remainingMinutes}min ago`;
  } else if (diffInMinutes > 1) {
    const remainingSeconds = diffInSeconds % 60;
    return diffInMinutes < 5
      ? `${Math.floor(diffInMinutes)}min ${Math.floor(remainingSeconds)}s ago`
      : `${Math.floor(diffInMinutes)}min ago`;
  } else {
    return `${Math.floor(diffInSeconds)}s ago`;
  }
}

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
      {timeToString(utcTime)}
    </p>
  );
}
