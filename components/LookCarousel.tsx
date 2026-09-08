"use client";

import Image from "next/image";
import { useState } from "react";
import type { Drop } from "@/data/drops";
import PlatformRing from "@/components/PlatformRing";

export default function LookCarousel({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const count = drop.looks.length;

  // Per-look vertical offset corrections (unchanged — preserves original grounding adjustments)
  const imageOffsets: Record<string, number> = {
    "look-02": 18,
    "look-03": 24,
  };

  const shift = (direction: number) =>
    setActive((index) => (index + direction + count) % count);

  // Signed relative position: 0 = active, ±1 = adjacent, ±2+ = background
  const relative = (index: number) =>
    ((index - active + Math.ceil(count / 2)) % count) - Math.ceil(count / 2);

  return (
    <section
      className="overflow-hidden border-b border-base-border px-6 py-24"
      aria-labelledby="look-carousel-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* ── Section header — matches FeaturedLooksGrid typography ── */}
        <p className="mb-2 text-center text-xs tracking-[0.28em] text-accent">THE COLLECTION</p>
        <h2
          id="look-carousel-heading"
          className="mb-14 text-center font-display text-3xl tracking-wide text-text-primary md:text-4xl"
        >
          {drop.name} — {count} OUTFITS
        </h2>

        <div className="relative">
          <div className="flex items-center gap-4 md:gap-8">
            {/* Prev arrow */}
            <button
              type="button"
              aria-label="Previous look"
              onClick={() => shift(-1)}
              className="z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-text-secondary/50 text-lg text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              ←
            </button>

            <div className="min-w-0 flex-1">
              {/*
               * Stage container — perspective 3-D depth stack.
               * The platform ring sits at the very bottom of this container;
               * all outfit cards are positioned absolutely within it.
               */}
              <div
                className="relative mx-auto h-[30rem] w-full max-w-4xl [perspective:1200px] sm:h-[34rem]"
                aria-live="polite"
              >
                {/* ── Platform ring — centred bloom (active is always position 0) ── */}
                <PlatformRing
                  bloomX={50}
                  className="bottom-[6.75rem] sm:bottom-[7.25rem]"
                />

                {/* ── Outfit cards ── */}
                {drop.looks.map((look, index) => {
                  const position = relative(index);
                  const distance = Math.abs(position);
                  const activeLook = position === 0;
                  const side = position < 0 ? -1 : 1;

                  // 3-D transform — unchanged depth-stack logic, refined scale values
                  const transform = activeLook
                    ? "translate3d(0, 18px, 80px) rotateY(0deg) scale(1)"
                    : distance === 1
                    ? `translate3d(${side * 30}%, 18px, -50px) rotateY(${side * -16}deg) scale(0.78)`
                    : `translate3d(${side * (42 + Math.min(distance - 2, 2) * 5)}%, 18px, -${130 + distance * 25}px) rotateY(${side * -24}deg) scale(${Math.max(0.54, 0.66 - (distance - 2) * 0.05)})`;

                  // Opacity falloff — slightly crisper than before
                  const opacity = activeLook
                    ? 1
                    : distance === 1
                    ? 0.58
                    : Math.max(0.18, 0.34 - (distance - 2) * 0.05);

                  return (
                    <button
                      type="button"
                      key={look.id}
                      onClick={() => setActive(index)}
                      aria-label={`Show ${look.name}`}
                      aria-current={activeLook ? "true" : undefined}
                      className="absolute inset-0 flex flex-col items-center text-center transition-[transform,opacity,filter] duration-500 ease-out"
                      style={{
                        transform,
                        opacity,
                        zIndex: count - distance,
                        transformOrigin: "center 76%",
                        filter: activeLook
                          ? "none"
                          : `blur(${Math.min(distance, 2) * 0.35}px)`,
                      }}
                    >
                      {/* Outfit image — object-bottom grounds feet on ring */}
                      <div
                        className="relative mb-5 flex h-80 w-full max-w-[18rem] items-end justify-center sm:h-96 sm:max-w-[21rem]"
                        style={{
                          transform: `translateY(${imageOffsets[look.id] ?? 0}px)`,
                        }}
                      >
                        <Image
                          src={look.images[0]}
                          alt={`${look.name} — ${look.description}`}
                          fill
                          sizes="(min-width: 768px) 28rem, 75vw"
                          className={`object-contain object-bottom transition-all duration-500 ${
                            activeLook
                              ? "drop-shadow-[0_0_24px_rgba(255,77,30,0.45)]"
                              : ""
                          }`}
                        />
                      </div>

                      {/* Label — visible only for the active look (unchanged behaviour) */}
                      <div
                        className={`transition-opacity duration-300 ${
                          activeLook
                            ? "opacity-100"
                            : "pointer-events-none invisible opacity-0"
                        }`}
                        aria-hidden={!activeLook}
                      >
                        {/* Look name — matches FeaturedLooksGrid typography */}
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-primary">
                          {look.name}
                        </p>
                        <p className="mt-1 text-[10px] text-text-secondary">
                          {look.description}
                        </p>
                        {/* Active indicator bar — matches FeaturedLooksGrid */}
                        <span className="mx-auto mt-3 block h-0.5 w-7 bg-accent" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next arrow */}
            <button
              type="button"
              aria-label="Next look"
              onClick={() => shift(1)}
              className="z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-text-secondary/50 text-lg text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
