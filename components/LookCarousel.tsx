"use client";

import { useState } from "react";
import type { Drop } from "@/data/drops";

export default function LookCarousel({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const look = drop.looks[active];

  return (
    <section className="py-24 px-6 border-b border-base-border">
      <div className="mx-auto max-w-7xl">
        <p className="text-accent text-xs tracking-widest text-center mb-2">
          THE COLLECTION
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-center text-text-primary mb-14">
          {drop.name.replace("DROP ", "DROP ")} — {drop.looks.length} OUTFITS
        </h2>

        <div className="flex items-center gap-6">
          <button
            aria-label="Previous look"
            onClick={() => setActive((i) => (i - 1 + drop.looks.length) % drop.looks.length)}
            className="shrink-0 w-10 h-10 rounded-full border border-base-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
          >
            ←
          </button>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            {drop.looks.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setActive(i)}
                className="text-left group"
              >
                <div
                  className={`aspect-[3/4] rounded-sm border flex items-center justify-center mb-3 transition-colors ${
                    i === active
                      ? "border-accent shadow-[0_0_24px_-6px_rgba(255,77,30,0.5)]"
                      : "border-base-border"
                  }`}
                >
                  <span className="text-text-secondary text-xs">{l.name}</span>
                </div>
                <p className="text-sm text-text-primary">{l.name}</p>
                <p className="text-xs text-text-secondary">{l.description}</p>
                {i === active && (
                  <span className="block h-[2px] w-8 bg-accent mt-2" />
                )}
              </button>
            ))}
          </div>

          <button
            aria-label="Next look"
            onClick={() => setActive((i) => (i + 1) % drop.looks.length)}
            className="shrink-0 w-10 h-10 rounded-full border border-base-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
