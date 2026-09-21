"use client";

import Image from "next/image";
import { useState } from "react";
import AnimeStage from "@/components/AnimeStage";

const ANIME_LOOKS = [
  {
    id: "anime-look-01",
    name: "LOOK 01",
    character: "ZORO",
    series: "ONE PIECE",
    image: "/images/anime/looks/zoro.png",
    card: "/images/anime/cards/zoro-card.jpg",
  },
  {
    id: "anime-look-02",
    name: "LOOK 02",
    character: "LUFFY",
    series: "ONE PIECE",
    image: "/images/anime/looks/luffy.png",
    card: "/images/anime/cards/luffy-card.jpg",
  },
  {
    id: "anime-look-03",
    name: "LOOK 03",
    character: "ROBIN",
    series: "ONE PIECE",
    image: "/images/anime/looks/robin.png",
    card: "/images/anime/cards/robin-card.jpg",
  },
  {
    id: "anime-look-04",
    name: "LOOK 04",
    character: "GOJO",
    series: "JUJUTSU KAISEN",
    image: "/images/anime/looks/gojo.png",
    card: "/images/anime/cards/gojo-card.jpg",
  },
  {
    id: "anime-look-05",
    name: "LOOK 05",
    character: "DOFLAMINGO",
    series: "ONE PIECE",
    image: "/images/anime/looks/doflamingo.png",
    card: "/images/anime/cards/doflamingo-card.jpg",
  },
];

export default function AnimeDropCarousel() {
  const [active, setActive] = useState(0);
  const count = ANIME_LOOKS.length;

  const shift = (dir: number) =>
    setActive((i) => (i + dir + count) % count);

  const relative = (index: number) =>
    ((index - active + Math.ceil(count / 2)) % count) - Math.ceil(count / 2);

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
                {/* ── Custom Two-Tier Stone Stage (Raised Center Pedestal, Glowing Rim, Fog, Wet Reflection & Edge Rocks) ── */}
                <AnimeStage className="bottom-[4.75rem] sm:bottom-[5.25rem]" />

                {/* Outfit cards — real look cutouts */}
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
                      aria-label={`Show ${item.series} / ${item.character}`}
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
                      {/* Look image standing on stage — backdrop card + garment cutout */}
                      <div className="relative mb-5 flex h-80 w-full max-w-[18rem] items-end justify-center sm:h-96 sm:max-w-[21rem]">
                        {/* Backdrop card — character art, sits behind the garment */}
                        <div className="absolute inset-0">
                          <Image
                            src={item.card}
                            alt=""
                            aria-hidden="true"
                            fill
                            sizes="(min-width: 768px) 28rem, 75vw"
                            className={`object-contain object-bottom transition-all duration-500 ${
                              isActive
                                ? "opacity-100 brightness-100"
                                : "opacity-100 brightness-50 contrast-90"
                            }`}
                          />
                        </div>

                        {/* Garment cutout — sits in front of card */}
                        <div className="relative h-full w-full p-2 sm:p-3">
                          <Image
                            src={item.image}
                            alt={`${item.series} / ${item.character} — ${item.name}`}
                            fill
                            sizes="(min-width: 768px) 28rem, 75vw"
                            priority={isActive}
                            className={`object-contain object-bottom transition-all duration-500 ${
                              isActive
                                ? "drop-shadow-[0_0_26px_rgba(255,77,30,0.45)] brightness-105"
                                : "brightness-75 contrast-90"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Active look label */}
                      <div
                        className={`transition-opacity duration-300 ${
                          isActive ? "opacity-100" : "pointer-events-none invisible opacity-0"
                        }`}
                        aria-hidden={!isActive}
                      >
                        <p className="text-[11px] font-bold tracking-[0.28em] text-accent uppercase">
                          {item.series} / {item.character}
                        </p>
                        <p className="mt-1 text-[12px] font-bold uppercase tracking-widest text-text-primary">
                          {item.name}
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
