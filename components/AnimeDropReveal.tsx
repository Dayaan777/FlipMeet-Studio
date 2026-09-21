"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Each look: backdrop card (always full color) + garment PNG (silhouette → revealed)
// Platform ring color is character-specific
const LOOKS = [
  {
    id: "anime-look-01",
    name: "LOOK 01",
    character: "ZORO",
    series: "ONE PIECE",
    image: "/images/anime/looks/zoro.png",
    card: "/images/anime/cards/zoro-card.jpg",
    color: "#22C55E",                      // Zoro – green
    glow: "rgba(34, 197, 94, 0.4)",
    dimRing: "rgba(34, 197, 94, 0.12)",
  },
  {
    id: "anime-look-02",
    name: "LOOK 02",
    character: "LUFFY",
    series: "ONE PIECE",
    image: "/images/anime/looks/luffy.png",
    card: "/images/anime/cards/luffy-card.jpg",
    color: "#3B82F6",                      // Luffy – red
    glow: "rgba(239, 68, 68, 0.4)",
    dimRing: "rgba(239, 68, 68, 0.1)",
  },
  {
    id: "anime-look-03",
    name: "LOOK 03",
    character: "ROBIN",
    series: "ONE PIECE",
    image: "/images/anime/looks/robin.png",
    card: "/images/anime/cards/robin-card.jpg",
    color: "#A855F7",                      // Robin – purple
    glow: "rgba(168, 85, 247, 0.4)",
    dimRing: "rgba(168, 85, 247, 0.1)",
  },
  {
    id: "anime-look-04",
    name: "LOOK 04",
    character: "GOJO",
    series: "JUJUTSU KAISEN",
    image: "/images/anime/looks/gojo.png",
    card: "/images/anime/cards/gojo-card.jpg",
    color: "#A855F7",                      // Gojo – violet/purple
    glow: "rgba(168, 85, 247, 0.4)",
    dimRing: "rgba(168, 85, 247, 0.1)",
  },
  {
    id: "anime-look-05",
    name: "LOOK 05",
    character: "DOFLAMINGO",
    series: "ONE PIECE",
    image: "/images/anime/looks/doflamingo.png",
    card: "/images/anime/cards/doflamingo-card.jpg",
    color: "#EC4899",                      // Doflamingo – hot pink
    glow: "rgba(236, 72, 153, 0.4)",
    dimRing: "rgba(236, 72, 153, 0.1)",
  },
] as const;

export default function AnimeDropReveal() {
  // Look at index i is revealed if i < revealedCount
  // Starts at 1 → Look 01 pre-revealed
  const [revealedCount, setRevealedCount] = useState(1);

  const canReveal = revealedCount < LOOKS.length;
  const reveal = () => setRevealedCount((c) => Math.min(c + 1, LOOKS.length));

  return (
    <section
      className="overflow-hidden border-b border-base-border px-4 py-20 sm:px-6 sm:py-28"
      aria-labelledby="anime-drop-reveal-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* ── Section header ── */}
        <p className="mb-1 text-center text-[10px] font-bold tracking-[0.34em] text-text-secondary">
          アニメコレクション
        </p>
        <p className="mb-2 text-center text-xs tracking-[0.28em] text-accent">
          THE ANIME COLLECTION
        </p>
        <h2
          id="anime-drop-reveal-heading"
          className="mb-14 text-center font-display text-3xl tracking-wide text-text-primary md:text-4xl"
        >
          ANIME DROP 001 — 05 LOOKS
        </h2>

        {/* ── 5 looks in a straight horizontal row ── */}
        {/* Horizontally scrollable on mobile, full grid on large screens */}
        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex gap-3 md:gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
            {LOOKS.map((look, i) => {
              const isRevealed = i < revealedCount;

              return (
                <Link
                  key={look.id}
                  href={isRevealed ? `/product/${look.id}` : "#reveal"}
                  onClick={(event) => {
                    if (!isRevealed) {
                      event.preventDefault();
                      reveal();
                    }
                  }}
                  className="contents"
                >
                  <div
                    className="flex w-[162px] flex-col sm:w-[185px] lg:w-auto"
                  >
                  {/* ── Portrait card: backdrop (always color) + garment (silhouette → revealed) ── */}
                  <div
                    className="relative aspect-[9/16] overflow-hidden rounded-sm transition-all duration-700"
                    style={{
                      border: `1px solid ${isRevealed ? look.color + "55" : "rgba(255,255,255,0.06)"}`,
                      boxShadow: isRevealed
                        ? `0 0 28px 3px ${look.glow}, inset 0 0 0 1px ${look.color}25`
                        : "none",
                    }}
                  >
                    {/* Backdrop card — ALWAYS full color, regardless of reveal state */}
                    <Image
                      src={look.card}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(max-width: 640px) 162px, (max-width: 1024px) 185px, 20vw"
                      className="object-cover object-center"
                      priority={i === 0}
                    />

                    {/* Dark vignette at the top & sides for unrevealed state */}
                    {!isRevealed && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse 80% 100% at 50% 40%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)",
                        }}
                      />
                    )}

                    {/* Garment cutout: black silhouette when unrevealed, full color when revealed */}
                    <div className="absolute inset-0 p-[5%]">
                      <Image
                        src={look.image}
                        alt={
                          isRevealed
                            ? `${look.series} — ${look.character} jersey`
                            : `Unrevealed look ${look.name}`
                        }
                        fill
                        sizes="(max-width: 640px) 162px, (max-width: 1024px) 185px, 20vw"
                        className="object-contain object-bottom transition-[filter] duration-700"
                        style={{
                          filter: isRevealed ? "none" : "brightness(0)",
                          padding: "4%",
                        }}
                      />
                    </div>

                    {/* Revealed: character-colored glow at bottom of card */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-[30%] pointer-events-none transition-opacity duration-700"
                      style={{
                        background: `linear-gradient(to top, ${look.glow} 0%, transparent 100%)`,
                        opacity: isRevealed ? 1 : 0,
                      }}
                    />
                  </div>

                  {/* ── Platform ring — glowing ellipse in character color ── */}
                  <div className="relative mt-0.5 h-7 select-none" aria-hidden="true">
                    <svg
                      viewBox="0 0 200 28"
                      className="absolute inset-0 h-full w-full"
                    >
                      <defs>
                        {/* Glow filter — unique per look to avoid ID collisions */}
                        <filter
                          id={`rg-${look.id}`}
                          x="-50%"
                          y="-100%"
                          width="200%"
                          height="400%"
                        >
                          <feGaussianBlur stdDeviation="2.5" result="blurred" />
                          <feMerge>
                            <feMergeNode in="blurred" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Outer halo ring */}
                      <ellipse
                        cx="100"
                        cy="18"
                        rx="95"
                        ry="11"
                        fill="none"
                        stroke={isRevealed ? look.color : "#1e1e1e"}
                        strokeWidth={isRevealed ? 2.8 : 1}
                        opacity={isRevealed ? 0.9 : 0.35}
                        filter={isRevealed ? `url(#rg-${look.id})` : undefined}
                        style={{ transition: "stroke 0.7s ease, stroke-width 0.7s ease, opacity 0.7s ease" }}
                      />
                      {/* Inner specular ring */}
                      <ellipse
                        cx="100"
                        cy="18"
                        rx="70"
                        ry="7.5"
                        fill="none"
                        stroke={isRevealed ? look.color : "#141414"}
                        strokeWidth="1"
                        opacity={isRevealed ? 0.4 : 0.18}
                        style={{ transition: "stroke 0.7s ease, opacity 0.7s ease" }}
                      />
                    </svg>

                    {/* Floor bloom beneath the ring */}
                    <div
                      className="absolute inset-x-[8%] bottom-0 h-full pointer-events-none transition-opacity duration-700"
                      style={{
                        background: `radial-gradient(ellipse at 50% 80%, ${look.glow} 0%, transparent 70%)`,
                        filter: "blur(5px)",
                        opacity: isRevealed ? 1 : 0,
                      }}
                    />
                  </div>

                  {/* ── Character label ── */}
                  <div className="mt-2.5 text-center space-y-0.5">
                    <p
                      className="text-[9px] font-bold uppercase tracking-[0.22em] transition-colors duration-700"
                      style={{ color: isRevealed ? look.color : "#252525" }}
                    >
                      {look.series}
                    </p>
                    <p
                      className="text-[11px] font-bold uppercase tracking-widest transition-colors duration-700"
                      style={{ color: isRevealed ? "#ffffff" : "#252525" }}
                    >
                      {look.character}
                    </p>
                    <p
                      className="text-[8px] tracking-[0.14em] transition-colors duration-700"
                      style={{ color: isRevealed ? "#6b6b6b" : "#1a1a1a" }}
                    >
                      {look.name}
                    </p>
                  </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Progress + reveal control ── */}
        <div className="mt-14 flex flex-col items-center gap-5">
          {/* Segmented progress bar — one segment per look, each in its character color */}
          <div className="flex items-center gap-1.5" aria-label="Reveal progress">
            {LOOKS.map((look, i) => (
              <div
                key={look.id}
                className="h-[3px] rounded-full transition-all duration-700"
                style={{
                  width: i < revealedCount ? "72px" : "40px",
                  background:
                    i < revealedCount ? look.color : "#1a1a1a",
                  boxShadow:
                    i < revealedCount ? `0 0 8px 1px ${look.glow}` : "none",
                }}
              />
            ))}
          </div>

          {/* Counter */}
          <p
            className="text-[11px] font-bold tracking-[0.22em] text-text-secondary uppercase"
            aria-live="polite"
          >
            {String(revealedCount).padStart(2, "0")} / 05 LOOKS REVEALED
          </p>

          {/* Reveal button / completion state */}
          {canReveal ? (
            <button
              type="button"
              onClick={reveal}
              className="inline-flex items-center gap-3 rounded-sm bg-accent px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-text-primary hover:bg-accent-dim transition-all duration-200 shadow-lg shadow-accent/20"
            >
              REVEAL LOOK {String(revealedCount + 1).padStart(2, "0")} →
            </button>
          ) : (
            <div className="inline-flex items-center gap-3 rounded-sm border border-white/20 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-text-secondary/60">
              ALL 05 LOOKS REVEALED
              <span className="text-accent">✓</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
