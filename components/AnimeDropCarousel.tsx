"use client";

import { useState } from "react";
import PlatformRing from "@/components/PlatformRing";

const ANIME_LOOKS = [
  { id: "anime-look-01", name: "LOOK 01", character: "EREN YEAGER", series: "ATTACK ON TITAN" },
  { id: "anime-look-02", name: "LOOK 02", character: "RORONOA ZORO", series: "ONE PIECE" },
  { id: "anime-look-03", name: "LOOK 03", character: "SATORU GOJO", series: "JUJUTSU KAISEN" },
  { id: "anime-look-04", name: "LOOK 04", character: "TANJIRO KAMADO", series: "DEMON SLAYER" },
  { id: "anime-look-05", name: "LOOK 05", character: "NARUTO UZUMAKI", series: "NARUTO" },
];

export default function AnimeDropCarousel() {
  const [active, setActive] = useState(0);
  const count = ANIME_LOOKS.length;

  const shift = (dir: number) =>
    setActive((i) => (i + dir + count) % count);

  const relative = (index: number) =>
    ((index - active + Math.ceil(count / 2)) % count) - Math.ceil(count / 2);

  const look = ANIME_LOOKS[active];

  return (
    <section
      className="overflow-hidden border-b border-base-border px-6 py-20 sm:py-28"
      aria-labelledby="anime-drop-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <p className="mb-1 text-center text-[10px] font-bold tracking-[0.34em] text-text-secondary">
          アニメコレクション
        </p>
        <p className="mb-2 text-center text-xs tracking-[0.28em] text-accent">
          THE ANIME COLLECTION
        </p>
        <h2
          id="anime-drop-heading"
          className="mb-14 text-center font-display text-3xl tracking-wide text-text-primary md:text-4xl"
        >
          ANIME DROP 001 — 05 LOOKS
        </h2>

        <div className="relative">
          <div className="relative flex items-center gap-4 pb-14 md:gap-8 md:pb-0">
            {/* Prev arrow */}
            <button
              type="button"
              aria-label="Previous look"
              onClick={() => shift(-1)}
              className="absolute bottom-0 left-1/2 z-20 flex h-10 w-10 shrink-0 -translate-x-[calc(100%+0.75rem)] items-center justify-center rounded-full border border-text-secondary/50 text-lg text-text-secondary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:static md:translate-x-0"
            >
              ←
            </button>

            <div className="min-w-0 flex-1">
              {/* Stage container with dark stone platform */}
              <div
                className="relative mx-auto h-[30rem] w-full max-w-4xl [perspective:1200px] sm:h-[34rem]"
                aria-live="polite"
              >
                {/* Dark stone floor surface — cracked texture via layered gradients */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[5%] bottom-[5.5rem] sm:bottom-[6rem] h-[72px] sm:h-[80px] rounded-[50%]"
                  style={{
                    background:
                      "radial-gradient(ellipse 90% 60% at 50% 90%, #1a1a1a 0%, #0d0d0d 55%, #060606 100%)",
                    boxShadow: "0 0 0 1px #1f1f1f, 0 0 60px 4px rgba(0,0,0,0.9)",
                  }}
                />
                {/* Cracked stone surface texture lines */}
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[5%] bottom-[5.5rem] sm:bottom-[6rem] h-[72px] sm:h-[80px] w-[90%] opacity-30"
                  viewBox="0 0 800 80"
                  preserveAspectRatio="none"
                >
                  <ellipse cx="400" cy="55" rx="392" ry="22" fill="none" stroke="#2a2a2a" strokeWidth="0.8" />
                  <ellipse cx="400" cy="55" rx="350" ry="18" fill="none" stroke="#1e1e1e" strokeWidth="0.5" />
                  {/* faint crack lines */}
                  <path d="M310 46 L295 58 L320 64" fill="none" stroke="#333" strokeWidth="0.4" />
                  <path d="M490 50 L510 60 L498 68" fill="none" stroke="#333" strokeWidth="0.4" />
                  <path d="M400 48 L388 56 L395 65 L410 60" fill="none" stroke="#333" strokeWidth="0.4" />
                </svg>

                {/* Soft overhead light beam — cinematic single-source key light */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[30%] h-[65%]"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 40%, transparent 80%)",
                  }}
                />

                {/* Base fog / mist at platform level */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-[4.5rem] sm:bottom-[5rem] h-16"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(255,255,255,0.035) 0%, rgba(180,180,200,0.015) 45%, transparent 75%)",
                    filter: "blur(6px)",
                  }}
                />

                {/* Platform Ring — reused from homepage */}
                <PlatformRing bloomX={50} className="bottom-[6.75rem] sm:bottom-[7.25rem]" />

                {/* Outfit cards — placeholder silhouettes */}
                {ANIME_LOOKS.map((item, index) => {
                  const position = relative(index);
                  const distance = Math.abs(position);
                  const isActive = position === 0;
                  const side = position < 0 ? -1 : 1;

                  const transform = isActive
                    ? "translate3d(0, 18px, 80px) rotateY(0deg) scale(1)"
                    : distance === 1
                    ? `translate3d(${side * 30}%, 18px, -50px) rotateY(${side * -16}deg) scale(0.78)`
                    : `translate3d(${side * (42 + Math.min(distance - 2, 2) * 5)}%, 18px, -${130 + distance * 25}px) rotateY(${side * -24}deg) scale(${Math.max(0.54, 0.66 - (distance - 2) * 0.05)})`;

                  const opacity = isActive
                    ? 1
                    : distance === 1
                    ? 0.55
                    : Math.max(0.15, 0.32 - (distance - 2) * 0.05);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setActive(index)}
                      aria-label={`Show ${item.name}`}
                      aria-current={isActive ? "true" : undefined}
                      className="absolute inset-0 flex flex-col items-center text-center transition-[transform,opacity,filter] duration-500 ease-out"
                      style={{
                        transform,
                        opacity,
                        zIndex: count - distance,
                        transformOrigin: "center 76%",
                        filter: isActive
                          ? "none"
                          : `blur(${Math.min(distance, 2) * 0.35}px)`,
                      }}
                    >
                      {/* Placeholder silhouette card */}
                      <div className="relative mb-5 flex h-80 w-full max-w-[18rem] items-end justify-center sm:h-96 sm:max-w-[21rem]">
                        {/* Dark stone pedestal under placeholder */}
                        <div
                          className="absolute bottom-0 inset-x-[18%] h-full rounded-sm overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(170deg, #181818 0%, #0e0e0e 50%, #080808 100%)",
                            boxShadow: isActive
                              ? "0 0 40px 4px rgba(255,77,30,0.18), inset 0 0 20px rgba(0,0,0,0.8)"
                              : "inset 0 0 20px rgba(0,0,0,0.8)",
                          }}
                        >
                          {/* Subtle vertical crack texture */}
                          <div className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(180deg, transparent 0px, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 19px)",
                            }}
                          />
                          {/* Placeholder label inside the card */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-40">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                              <span className="text-[10px] tracking-widest text-white/60 font-display">{String(index + 1).padStart(2, "0")}</span>
                            </div>
                            <div className="text-[8px] tracking-[0.2em] text-white/40 uppercase">LOOK COMING</div>
                          </div>
                          {/* Active glow rim */}
                          {isActive && (
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                boxShadow: "inset 0 0 0 1px rgba(255,77,30,0.35)",
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Active look label */}
                      <div
                        className={`transition-opacity duration-300 ${
                          isActive ? "opacity-100" : "pointer-events-none invisible opacity-0"
                        }`}
                        aria-hidden={!isActive}
                      >
                        <p className="text-[10px] tracking-[0.28em] text-accent uppercase font-bold">
                          {item.series}
                        </p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-text-primary">
                          {item.character}
                        </p>
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
              className="absolute bottom-0 left-1/2 z-20 flex h-10 w-10 shrink-0 translate-x-3/4 items-center justify-center rounded-full border border-text-secondary/50 text-lg text-text-secondary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:static md:translate-x-0"
            >
              →
            </button>
          </div>

          {/* Below-carousel: pagination + CTA */}
          <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10">
            {/* Pagination dots */}
            <div className="flex items-center gap-2">
              {ANIME_LOOKS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Go to look ${i + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    i === active
                      ? "w-6 h-1.5 bg-accent"
                      : "w-1.5 h-1.5 bg-text-secondary/40 hover:bg-text-secondary"
                  }`}
                />
              ))}
            </div>

            {/* Pagination counter */}
            <span className="text-[11px] font-bold tracking-[0.2em] text-text-secondary">
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>

            {/* VIEW LOOK CTA */}
            <a
              href={`#${ANIME_LOOKS[active].id}`}
              className="inline-flex items-center gap-2 rounded-sm border border-accent bg-accent/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-accent hover:bg-accent hover:text-text-primary transition-all duration-200"
            >
              VIEW LOOK →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
