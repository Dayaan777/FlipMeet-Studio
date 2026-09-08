"use client";

import { useState } from "react";
import Image from "next/image";
import type { Drop, Look } from "@/data/drops";

const featuredLookIds = ["look-01", "look-04", "look-05", "look-06"];

function PlatformRing({ activeIndex, totalLooks }: { activeIndex: number; totalLooks: number }) {
  // Spread the bloom across the width proportionally to the active look position
  const bloomXPercent = totalLooks > 1 ? (activeIndex / (totalLooks - 1)) * 100 : 50;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-[3.25rem] h-[120px]"
    >
      {/* Active-look orange floor bloom — positioned under the active outfit */}
      <div
        className="absolute bottom-0 h-[90px] w-[28%] -translate-x-1/2 transition-[left] duration-300 ease-in-out"
        style={{ left: `${bloomXPercent}%` }}
      >
        <div className="h-full w-full rounded-[50%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,100,20,0.55)_0%,rgba(255,60,0,0.22)_35%,transparent_70%)] blur-[2px]" />
      </div>

      {/* SVG concentric ring platform */}
      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outer ring groove gradient — dark base with slight grey rim on top */}
          <linearGradient id="ringStrokeOuter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#555555" stopOpacity="1" />
            <stop offset="30%" stopColor="#2a2a2a" stopOpacity="1" />
            <stop offset="100%" stopColor="#0d0d0d" stopOpacity="1" />
          </linearGradient>
          {/* Inner ring groove gradient */}
          <linearGradient id="ringStrokeInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#444444" stopOpacity="1" />
            <stop offset="25%" stopColor="#1e1e1e" stopOpacity="1" />
            <stop offset="100%" stopColor="#080808" stopOpacity="1" />
          </linearGradient>
          {/* Specular arc highlight — the bright streak on the top-left of the ring in the reference */}
          <linearGradient id="specularArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="38%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="52%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          {/* Clip path to show only the top arc of the ring for the specular highlight */}
          <clipPath id="topHalfClip">
            <rect x="0" y="0" width="1000" height="60" />
          </clipPath>
        </defs>

        {/* ── Outer ring ── fill matches background so only the stroke groove is visible */}
        <ellipse
          cx="500" cy="80" rx="490" ry="38"
          fill="#050505"
          stroke="url(#ringStrokeOuter)"
          strokeWidth="5"
        />

        {/* ── Inner ring ── slightly smaller, same treatment */}
        <ellipse
          cx="500" cy="80" rx="455" ry="28"
          fill="none"
          stroke="url(#ringStrokeInner)"
          strokeWidth="3.5"
        />

        {/* ── Specular arc highlight on the top portion of the outer ring ── */}
        <ellipse
          cx="500" cy="80" rx="490" ry="38"
          fill="none"
          stroke="url(#specularArc)"
          strokeWidth="5"
          clipPath="url(#topHalfClip)"
        />

        {/* ── Very subtle inner surface sheen between the two rings ── */}
        <ellipse
          cx="500" cy="80" rx="472" ry="33"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="30"
        />
      </svg>
    </div>
  );
}

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

        <div className="relative mx-auto mt-10 max-w-6xl px-1 pb-1 sm:px-3">
          {/* Platform ring — sits at the footer of the outfit grid */}
          <PlatformRing activeIndex={focusedIndex} totalLooks={looks.length} />

          {/* Outfit grid */}
          <div className="relative z-10 grid grid-cols-4 items-end gap-2 sm:gap-4 lg:gap-8">
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
            className="absolute left-[-1.25rem] top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-text-secondary/50 text-xl text-text-primary transition-colors hover:border-text-primary hover:bg-text-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:left-[-2.5rem]"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Next featured look"
            onClick={() => moveFocus(1)}
            className="absolute right-[-1.25rem] top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-text-secondary/50 text-xl text-text-primary transition-colors hover:border-text-primary hover:bg-text-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:right-[-2.5rem]"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
