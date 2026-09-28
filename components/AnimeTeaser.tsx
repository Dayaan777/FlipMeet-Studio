"use client";

import Image from "next/image";
import { DARK_BLUR_DATA_URL } from "@/lib/image-placeholder";
import Link from "next/link";
import { useState, useRef } from "react";
import type { Drop } from "@/data/drops";
import PlatformRing from "@/components/PlatformRing";

const OUTFITS = [
  {
    id: "anime-op-flame-outfit",
    name: "OP Flame Outfit",
    description: "Premium anime archive look featuring custom One Piece flame collar jersey and matching wide-leg trousers.",
    images: ["/images/products/anime-op-flame-outfit.png"]
  },
  {
    id: "anime-gojo-outfit",
    name: "Gojo Outfit",
    description: "Premium anime archive look featuring custom Jujutsu Kaisen Gojo jersey and matching multi-pocket cargo pants.",
    images: ["/images/products/anime-gojo-outfit.png"]
  },
  {
    id: "anime-luffy-blue-outfit",
    name: "Luffy Blue Flame Outfit",
    description: "Premium anime archive look featuring custom One Piece Luffy blue flame v-neck jersey and matching light blue denim cargos.",
    images: ["/images/products/anime-luffy-blue-outfit.png"]
  },
  {
    id: "anime-robin-purple-outfit",
    name: "Robin Purple Outfit",
    description: "Premium anime archive look featuring custom Nico Robin purple jersey and matching white wide-leg trousers.",
    images: ["/images/products/anime-robin-purple-outfit.png"]
  },
  {
    id: "anime-zoro-green-outfit",
    name: "Zoro Green Outfit",
    description: "Premium anime archive look featuring custom Roronoa Zoro green jersey and matching dark green wide-leg track pants.",
    images: ["/images/products/anime-zoro-green-outfit.png"]
  }
];

export default function AnimeTeaser({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const count = OUTFITS.length;

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  // Per-look vertical offset corrections
  const imageOffsets: Record<string, number> = {};

  const shift = (direction: number) =>
    setActive((index) => (index + direction + count) % count);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    const threshold = 40;

    if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        shift(1);
      } else {
        shift(-1);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    setTimeout(() => {
      isSwiping.current = false;
    }, 120);
  };

  // Signed relative position: 0 = active, ±1 = adjacent, ±2+ = background
  const relative = (index: number) =>
    ((index - active + Math.ceil(count / 2)) % count) - Math.ceil(count / 2);

  return (
    <section
      className="relative overflow-hidden border-b border-base-border bg-black"
      aria-labelledby="anime-carousel-heading"
    >
      {/* ── Cinematic Background Layer ── */}
      {/* Left side anime artwork */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[45%] select-none">
        <Image
          src="/images/anime-hero.png"
          alt=""
          fill
          aria-hidden="true"
          sizes="45vw"
          className="object-cover object-right opacity-20"
          style={{ maskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
        />
        {/* Red ink slash overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-transparent" />
      </div>

      {/* Right side torii/atmosphere */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[40%] select-none">
        <div className="absolute inset-0 bg-gradient-to-l from-red-950/15 via-transparent to-transparent" />
        {/* Subtle right vignette */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
      </div>

      {/* Full background dark vignette to keep center readable */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

      {/* Dramatic red/orange floor glow beneath the stage */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-72 w-[60%]">
        <div className="h-full w-full rounded-[50%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(220,38,38,0.25)_0%,rgba(255,80,0,0.12)_40%,transparent_70%)] blur-[1px]" />
      </div>

      {/* ── Decorative Japanese Typography ── */}
      {/* Left vertical kanji */}
      <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 select-none hidden md:block" aria-hidden="true">
        <p
          className="text-[11px] font-light tracking-[0.4em] text-white/15 uppercase"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.5em" }}
        >
          ア&nbsp;ニ&nbsp;メ
        </p>
        <div className="mt-4 h-16 w-[1px] bg-gradient-to-b from-white/10 to-transparent mx-auto" />
      </div>

      {/* Right vertical Japanese text — "夢は終わらない" (Dreams never end) */}
      <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 select-none hidden md:block" aria-hidden="true">
        <p
          className="text-[11px] font-light text-white/12"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.4em" }}
        >
          夢は終わらない
        </p>
        <div className="mt-4 h-16 w-[1px] bg-gradient-to-b from-white/10 to-transparent mx-auto" />
      </div>

      {/* Bottom-left FLIPMEET STUDIO editorial label */}
      <div className="pointer-events-none absolute bottom-10 left-6 select-none hidden md:block" aria-hidden="true">
        <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/15 leading-5">
          FLIPMEET<br />STUDIO
        </p>
        <div className="mt-2 h-[1px] w-8 bg-white/10" />
      </div>

      {/* Bottom-right cross-hair grid mark */}
      <div className="pointer-events-none absolute bottom-10 right-6 select-none hidden md:block" aria-hidden="true">
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-mono tracking-widest text-white/15">+</span>
          <div className="flex gap-[3px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[8px] w-[1px] bg-white/10" />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="relative mx-auto max-w-7xl px-6 py-20">

        {/* Section header */}
        <p className="mb-2 text-center text-xs tracking-[0.28em] text-accent">THE COLLECTION</p>
        <h2
          id="anime-carousel-heading"
          className="mb-2 text-center font-display text-3xl tracking-wide text-text-primary md:text-4xl"
        >
          ANIME
        </h2>
        {/* Accent underline bar */}
        <div className="mx-auto mb-14 h-[2px] w-10 bg-accent" />

        {/* ── 3D Carousel Stage ── */}
        <div className="relative">
          <div className="relative flex items-center gap-4 pb-14 md:gap-8 md:pb-0">

            {/* Prev arrow — desktop: extreme left edge; mobile: bottom-left */}
            <button
              type="button"
              aria-label="Previous look"
              onClick={() => shift(-1)}
              className="absolute bottom-0 left-1/2 z-20 flex h-10 w-10 shrink-0 -translate-x-[calc(100%+0.75rem)] items-center justify-center rounded-full border border-white/20 bg-black/40 text-lg text-white/60 backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_12px_rgba(255,80,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:static md:translate-x-0"
            >
              ←
            </button>

            <div className="min-w-0 flex-1">
              {/* Stage container — perspective 3-D depth stack */}
              <div
                className="relative mx-auto h-[30rem] w-full max-w-4xl [perspective:1200px] sm:h-[34rem] touch-pan-y"
                aria-live="polite"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
              >
                {/* Platform ring — now with dramatic accent-colored bloom */}
                <PlatformRing
                  bloomX={50}
                  className="bottom-[6.75rem] sm:bottom-[7.25rem]"
                />

                {/* Outfit cards */}
                {OUTFITS.map((look, index) => {
                  const position = relative(index);
                  const distance = Math.abs(position);
                  const activeLook = position === 0;
                  const side = position < 0 ? -1 : 1;

                  const transform = activeLook
                    ? "translate3d(0, 18px, 80px) rotateY(0deg) scale(1)"
                    : distance === 1
                    ? `translate3d(${side * 30}%, 18px, -50px) rotateY(${side * -16}deg) scale(0.78)`
                    : `translate3d(${side * (42 + Math.min(distance - 2, 2) * 5)}%, 18px, -${130 + distance * 25}px) rotateY(${side * -24}deg) scale(${Math.max(0.54, 0.66 - (distance - 2) * 0.05)})`;

                  const opacity = activeLook
                    ? 1
                    : distance === 1
                    ? 0.58
                    : Math.max(0.18, 0.34 - (distance - 2) * 0.05);

                  return (
                    <Link
                      href={`/product/${look.id}`}
                      key={look.id}
                      aria-label={`View ${look.name}`}
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
                      {/* Outfit image */}
                      <div
                        className="relative mb-5 flex h-80 w-full max-w-[18rem] items-end justify-center sm:h-96 sm:max-w-[21rem]"
                        style={{
                          transform: `translateY(${imageOffsets[look.id] ?? 0}px)`,
                        }}
                      >
                        <Image
                          src={look.images[0]}
                          alt={`${look.name} – ${look.description}`}
                          fill
                          priority={activeLook}
                          loading={distance <= 1 ? "eager" : "lazy"}
                          placeholder="blur"
                          blurDataURL={DARK_BLUR_DATA_URL}
                          sizes="(min-width: 640px) 336px, 85vw"
                          className="object-contain object-bottom transition-all duration-500"
                          style={
                            activeLook
                              ? {
                                  filter:
                                    "drop-shadow(0 0 32px rgb(var(--accent) / 0.55)) drop-shadow(0 0 8px rgba(220,38,38,0.4))",
                                }
                              : undefined
                          }
                        />
                      </div>

                      {/* Label — visible only for the active look */}
                      <div
                        className={`transition-opacity duration-300 ${
                          activeLook
                            ? "opacity-100"
                            : "pointer-events-none invisible opacity-0"
                        }`}
                        aria-hidden={!activeLook}
                      >
                        {/* Japanese "アニメ" accent label */}
                        <p className="mb-1 text-[9px] tracking-[0.5em] text-accent/60 font-light">
                          ア&nbsp;ニ&nbsp;メ
                        </p>
                        {/* Outfit name */}
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-primary">
                          {look.name}
                        </p>
                        <p className="mt-1 text-[10px] text-text-secondary max-w-xs mx-auto">
                          {look.description}
                        </p>
                        {/* Active indicator bar */}
                        <span className="mx-auto mt-3 block h-0.5 w-7 bg-accent" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Next arrow */}
            <button
              type="button"
              aria-label="Next look"
              onClick={() => shift(1)}
              className="absolute bottom-0 left-1/2 z-20 flex h-10 w-10 shrink-0 translate-x-3/4 items-center justify-center rounded-full border border-white/20 bg-black/40 text-lg text-white/60 backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_12px_rgba(255,80,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:static md:translate-x-0"
            >
              →
            </button>
          </div>

          {/* CTA Button */}
          <div className="mt-10 text-center">
            <Link
              href="/anime"
              className="inline-flex items-center gap-2 rounded-sm border border-accent bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-accent transition-all duration-300 hover:bg-accent hover:text-black hover:shadow-[0_0_30px_rgba(255,80,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              EXPLORE ANIME COLLECTION →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
