"use client";

import { useState } from "react";
import Image from "next/image";
import type { Drop, Look } from "@/data/drops";
import PlatformRing from "@/components/PlatformRing";

const featuredLookIds = ["look-01", "look-04", "look-05", "look-06"];


function FeaturedLook({ look, active, onSelect }: { look: Look; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`relative flex min-w-0 flex-1 cursor-pointer flex-col items-center text-center transition-opacity duration-200 ${
        active ? "z-10 opacity-100" : "opacity-55 hover:opacity-85"
      }`}
    >
      {/* Outfit image — feet touch bottom of the image container which lands on the ring */}
      <div
        className={`relative z-10 flex h-64 w-full origin-bottom items-end justify-center transition-transform duration-200 sm:h-72 lg:h-80 ${
          active ? "scale-[1.06]" : "scale-[0.96]"
        }`}
      >
        <Image
          src={look.images[0]}
          alt={`${look.name} — ${look.description}`}
          fill
          sizes="(min-width: 1024px) 20vw, 45vw"
          className="object-contain object-bottom"
        />
      </div>

      {/* Label + indicator beneath the outfit */}
      <div className="relative z-10 mt-4 flex min-h-14 flex-col items-center">
        <p className={`text-[11px] font-bold uppercase tracking-widest ${active ? "text-text-primary" : "text-text-secondary"}`}>
          {look.name}
        </p>
        <p className="mt-1 text-[10px] text-text-secondary">{look.description}</p>
        <span
          className={`mt-3 block transition-all duration-200 ${
            active ? "h-0.5 w-7 bg-accent" : "h-2 w-2 rounded-full bg-white/40"
          }`}
        />
      </div>
    </button>
  );
}

export default function FeaturedLooksGrid({ drop }: { drop: Drop }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const looks = featuredLookIds
    .map((id) => drop.looks.find((look) => look.id === id))
    .filter((look): look is Look => Boolean(look));

  const moveFocus = (direction: number) => {
    setFocusedIndex((current) => (current + direction + looks.length) % looks.length);
  };

  return (
    <section className="overflow-hidden border-b border-base-border px-6 pb-24 pt-20" aria-labelledby="featured-looks-heading">
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-center text-xs tracking-[0.28em] text-accent">THE COLLECTION</p>
        <h2 id="featured-looks-heading" className="text-balance text-center font-display text-3xl tracking-wide text-text-primary md:text-4xl">
          {drop.name} - FEATURED LOOKS
        </h2>

        <div className="relative mx-auto mt-10 max-w-6xl px-4 pb-16 sm:px-3 sm:pb-1">
          {/* Platform ring — sits at the footer of the outfit grid */}
          <PlatformRing
            bloomX={looks.length > 1 ? (focusedIndex / (looks.length - 1)) * 100 : 50}
            className="bottom-[3.25rem] transition-[left] duration-300"
          />

          {/* Outfit grid */}
          <div className="relative z-10 grid grid-cols-4 items-end gap-5 sm:gap-4 lg:gap-8">
            {looks.map((look, index) => (
              <FeaturedLook
                key={look.id}
                look={look}
                active={index === focusedIndex}
                onSelect={() => setFocusedIndex(index)}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Previous featured look"
            onClick={() => moveFocus(-1)}
            className="absolute bottom-0 left-1/2 z-20 flex size-10 -translate-x-[calc(100%+0.75rem)] items-center justify-center rounded-full border border-text-secondary/50 text-xl text-text-primary transition-colors hover:border-text-primary hover:bg-text-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:left-[-2.5rem] sm:top-1/2 sm:bottom-auto sm:translate-x-0 sm:-translate-y-1/2"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Next featured look"
            onClick={() => moveFocus(1)}
            className="absolute bottom-0 left-1/2 z-20 flex size-10 translate-x-3/4 items-center justify-center rounded-full border border-text-secondary/50 text-xl text-text-primary transition-colors hover:border-text-primary hover:bg-text-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:right-[-2.5rem] sm:left-auto sm:top-1/2 sm:bottom-auto sm:translate-x-0 sm:-translate-y-1/2"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
