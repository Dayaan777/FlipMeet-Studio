"use client";

import Image from "next/image";
import { useState } from "react";
import type { Drop } from "@/data/drops";

export default function LookCarousel({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const count = drop.looks.length;

  const shift = (direction: number) => {
    setActive((index) => (index + direction + count) % count);
  };

  return (
    <section className="overflow-hidden border-b border-base-border px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-center text-xs tracking-widest text-accent">THE COLLECTION</p>
        <h2 className="mb-14 text-center font-display text-3xl text-text-primary md:text-4xl">
          {drop.name} - {count} OUTFITS
        </h2>

        <div className="relative">
          <div className="pointer-events-none absolute inset-x-[8%] bottom-20 h-24 rounded-[50%] border border-text-secondary/60 shadow-[0_18px_24px_rgba(255,255,255,0.08),inset_0_8px_18px_rgba(255,255,255,0.08)] sm:inset-x-[14%]" />
          <div className="pointer-events-none absolute inset-x-[14%] bottom-12 h-10 rounded-[50%] bg-black/60 blur-xl sm:inset-x-[20%]" />

          <div className="flex items-center gap-4 md:gap-8">
            <button
              type="button"
              aria-label="Previous look"
              onClick={() => shift(-1)}
              className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-base-border text-lg text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
            >
              ←
            </button>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div
                className="flex items-end transition-transform duration-500 ease-out"
                style={{ transform: `translateX(calc(${50 - (active + 0.5) * 25}% - 0px))` }}
              >
                {drop.looks.map((look, index) => {
                  const isActive = index === active;
                  return (
                    <button
                      type="button"
                      key={look.id}
                      onClick={() => setActive(index)}
                      aria-label={`Show ${look.name}`}
                      className={`group w-[78vw] shrink-0 px-3 text-center transition-all duration-500 sm:w-1/2 md:w-1/4 ${isActive ? "scale-105 opacity-100" : "opacity-45 hover:opacity-75"}`}
                    >
                      <div className="relative mx-auto mb-5 flex h-64 max-w-[14rem] items-end justify-center sm:h-72 md:h-80">
                        <div className={`absolute bottom-2 h-4/5 w-3/5 rounded-[45%] bg-gradient-to-b from-text-secondary/30 via-text-secondary/10 to-transparent blur-2xl transition-all duration-500 ${isActive ? "scale-125 bg-accent/20" : ""}`} />
                        <Image
                          src={look.images[0]}
                          alt={`${look.name} — ${look.description}`}
                          fill
                          sizes="(min-width: 768px) 20vw, 70vw"
                          className={`object-contain transition-all duration-500 ${isActive ? "drop-shadow-[0_0_24px_rgba(255,77,30,0.45)]" : ""}`}
                        />
                      </div>
                      <p className="text-sm text-text-primary">{look.name}</p>
                      <p className="mt-1 text-xs text-text-secondary">{look.description}</p>
                      <span className={`mx-auto mt-3 block h-0.5 transition-all duration-300 ${isActive ? "w-8 bg-accent" : "w-1.5 rounded-full bg-text-secondary"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              aria-label="Next look"
              onClick={() => shift(1)}
              className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-base-border text-lg text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
