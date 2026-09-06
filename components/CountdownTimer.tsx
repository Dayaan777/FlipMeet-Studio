"use client";

import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    mins: Math.floor((diff / (1000 * 60)) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ target }: { target: string }) {
  const [time, setTime] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number][] = [
    ["DAYS", time.days],
    ["HRS", time.hours],
    ["MINS", time.mins],
    ["SECS", time.secs],
  ];

  return (
    <div className="flex gap-4">
      {units.map(([label, value]) => (
        <div key={label} className="text-center">
          <span className="font-display text-2xl md:text-3xl text-text-primary tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="block text-[10px] tracking-widest text-text-secondary mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
