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
  const [time, setTime] = useState<ReturnType<typeof getRemaining> | null>(null);

  useEffect(() => {
    setTime(getRemaining(target));
    const id = setInterval(() => setTime(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number | null][] = [
    ["DAYS", time?.days ?? null],
    ["HRS", time?.hours ?? null],
    ["MINS", time?.mins ?? null],
    ["SECS", time?.secs ?? null],
  ];

  return (
    <div className="flex gap-4">
      {units.map(([label, value]) => (
        <div key={label} className="text-center">
          <span className="font-display text-3xl md:text-4xl font-bold text-text-primary tabular-nums">
            {value === null ? "--" : String(value).padStart(2, "0")}
          </span>
          <span className="block text-[10px] tracking-widest text-text-secondary mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}