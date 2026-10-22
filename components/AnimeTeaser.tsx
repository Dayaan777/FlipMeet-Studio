"use client";

import Image from "next/image";
import { DARK_BLUR_DATA_URL } from "@/lib/image-placeholder";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { Drop } from "@/data/drops";

const OUTFITS = [
  {
    id: "anime-op-flame-outfit",
    name: "OP Flame Outfit",
    description: "Premium anime archive look featuring custom One Piece flame collar jersey and matching wide-leg trousers.",
    images: ["/images/products/anime-op-flame-outfit.png"],
    accent: "#F43F5E", // Pink
  },
  {
    id: "anime-gojo-outfit",
    name: "Gojo Outfit",
    description: "Premium anime archive look featuring custom Jujutsu Kaisen Gojo jersey and matching multi-pocket cargo pants.",
    images: ["/images/products/anime-gojo-outfit.png"],
    accent: "#A855F7", // Purple
  },
  {
    id: "anime-luffy-blue-outfit",
    name: "Luffy Blue Flame Outfit",
    description: "Premium anime archive look featuring custom One Piece Luffy blue flame v-neck jersey and matching light blue denim cargos.",
    images: ["/images/products/anime-luffy-blue-outfit.png"],
    accent: "#3B82F6", // Blue
  },
  {
    id: "anime-robin-purple-outfit",
    name: "Robin Purple Outfit",
    description: "Premium anime archive look featuring custom Nico Robin purple jersey and matching white wide-leg trousers.",
    images: ["/images/products/anime-robin-purple-outfit.png"],
    accent: "#C084FC", // Light Purple
  },
  {
    id: "anime-zoro-green-outfit",
    name: "Zoro Green Outfit",
    description: "Premium anime archive look featuring custom Roronoa Zoro green jersey and matching dark green wide-leg track pants.",
    images: ["/images/products/anime-zoro-green-outfit.png"],
    accent: "#22C55E", // Green
  },
];

export default function AnimeTeaser({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const [markerOffset, setMarkerOffset] = useState(0);
  const [isLifted, setIsLifted] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const count = OUTFITS.length;

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  // Per-look vertical offset corrections
  const imageOffsets: Record<string, number> = {};

  const shift = (direction: number) => {
    setMarkerOffset(direction * 44);
    setIsLifted(false);
    setActive((index) => (index + direction + count) % count);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMarkerOffset(0);
    });
    const liftTimer = setTimeout(() => {
      setIsLifted(true);
    }, 40);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(liftTimer);
    };
  }, [active]);

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
    setTimeout(() => {
      isSwiping.current = false;
    }, 120);
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    setTimeout(() => {
      isSwiping.current = false;
    }, 120);
  };

  // Symmetric signed relative position: 0 = active, -1 = left, +1 = right, etc.
  const relative = (index: number) => {
    let diff = (index - active) % count;
    if (diff > count / 2) diff -= count;
    if (diff <= -count / 2) diff += count;
    return diff;
  };

  const activeAccent = OUTFITS[active]?.accent || "#F43F5E";

  return (
    <section
      className="overflow-hidden px-6 sm:px-8 py-10 sm:py-14"
      aria-labelledby="anime-carousel-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* ── Section header — matches typography ── */}
        <p className="mb-2 text-center text-xs font-extrabold tracking-[0.28em] text-[#78330a]">THE COLLECTION</p>
        <h2
          id="anime-carousel-heading"
          className="mb-8 sm:mb-10 text-center font-display text-3xl font-extrabold tracking-wide text-[#0d0a08] md:text-4xl"
        >
          ANIME
        </h2>

        <div className="relative">
          <div className="relative flex items-center gap-4 pb-14 md:gap-8 md:pb-0">
            {/* Prev arrow */}
            <button
              type="button"
              aria-label="Previous look"
              onClick={() => shift(-1)}
              className="absolute bottom-0 left-1/2 z-30 flex h-11 w-11 shrink-0 -translate-x-[calc(100%+0.85rem)] items-center justify-center rounded-full border border-[#b86228] bg-[#181412] text-xl font-bold text-[#f7eee4] shadow-md shadow-black/40 transition-all duration-200 hover:bg-[#b86228] hover:text-[#141210] hover:scale-105 active:scale-95 md:static md:translate-x-0 cursor-pointer"
            >
              ←
            </button>

            <div className="min-w-0 flex-1">
              {/*
               * Stage container — perspective 3-D depth stack.
               * The stationary concrete stage spans wide under all outfits,
               * with side outfits grounded comfortably on its top face surface.
               */}
              <div
                className="relative mx-auto h-[32rem] w-full max-w-5xl [perspective:1200px] sm:h-[36rem] touch-pan-y"
                aria-live="polite"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
              >
                {/* ── Floor / Bottom Area: subtle warm concrete floor band behind stage ── */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 right-0 top-[365px] sm:top-[415px] h-[60px] bg-gradient-to-b from-[rgba(180,155,130,0.32)] via-[rgba(180,155,130,0.16)] to-transparent z-0"
                />

                {/* ── Fixed Stationary Wide Concrete Stage & Floor Shadow ── */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 w-[88%] sm:w-[94%] max-w-[960px] aspect-[1832/256] top-[300px] sm:top-[348px] z-[1]"
                >
                  {/* Soft floor shadow: slightly larger behind the stage, shifted down ~8px */}
                  <div className="absolute -inset-x-[2%] top-[8px] -bottom-[8px]">
                    <Image
                      src="/stage/stage-ring-shadow.png"
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 960px, 95vw"
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Concrete stage ring: top face + side wall */}
                  <div className="absolute inset-0">
                    <Image
                      src="/stage/stage-ring.png"
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 960px, 95vw"
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* ── Active-Outfit Accent Marker: Painted Corner Brackets on Stage Top Face ── */}
                  <div
                    className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 z-[3] pointer-events-none transition-transform duration-350 ease-out motion-reduce:transition-none"
                    style={{
                      transform: `translate(calc(-50% + ${markerOffset}px), -50%)`,
                    }}
                  >
                    <svg
                      viewBox="0 0 200 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[155px] h-[20px] sm:w-[175px] sm:h-[22px]"
                    >
                      <path
                        d="M 16 1.25 H 1.25 V 16 M 184 1.25 H 198.75 V 16 M 198.75 8 V 22.75 H 184 M 1.25 8 V 22.75 H 16"
                        stroke={activeAccent}
                        strokeWidth="2.5"
                        strokeLinecap="square"
                        className="transition-[stroke] duration-350 ease-out motion-reduce:transition-none"
                      />
                    </svg>
                  </div>
                </div>

                {/* ── Outfit cards ── */}
                {OUTFITS.map((look, index) => {
                  const position = relative(index);
                  const distance = Math.abs(position);
                  const activeLook = position === 0;
                  const side = position < 0 ? -1 : 1;

                  // 3-D transform:
                  // Center outfit: base translateY is 30px (desktop) / 5px (mobile).
                  // Active lifts ~6px (24px desktop / -1px mobile) with springy ease-out.
                  // Cuffs land firmly inside the corner brackets and directly onto the stage top face!
                  const activeY = isMobile
                    ? (isLifted ? -31 : -25)
                    : (isLifted ? 24 : 30);
                  const sideY1 = isMobile ? -36 : 14;
                  const sideY2 = isMobile ? -40 : 10;

                  const transform = activeLook
                    ? `translate3d(0, ${activeY}px, 80px) rotateY(0deg) scale(1)`
                    : distance === 1
                    ? `translate3d(${side * 22}%, ${sideY1}px, -50px) rotateY(${side * -14}deg) scale(0.78)`
                    : `translate3d(${side * (36 + Math.min(distance - 2, 2) * 4)}%, ${sideY2}px, -${130 + distance * 25}px) rotateY(${side * -22}deg) scale(${Math.max(0.54, 0.64 - (distance - 2) * 0.05)})`;

                  // Opacity falloff — side outfits remain clearly visible down to hem (0.64 opacity)
                  const opacity = activeLook
                    ? 1
                    : distance === 1
                    ? 0.64
                    : Math.max(0.18, 0.32 - (distance - 2) * 0.05);

                  return (
                    <Link
                      href={`/product/${look.id}`}
                      key={look.id}
                      aria-label={`View ${look.name}`}
                      aria-current={activeLook ? "true" : undefined}
                      onClick={(e) => {
                        if (isSwiping.current) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      className="absolute inset-0 flex flex-col items-center text-center transition-[transform,opacity,filter] duration-400 motion-reduce:transition-none"
                      style={{
                        transform,
                        opacity,
                        zIndex: 10 + count - distance,
                        transformOrigin: "center 76%",
                        filter: activeLook
                          ? "none"
                          : `blur(${Math.min(distance, 2) * 0.35}px)`,
                        transitionTimingFunction: activeLook ? "cubic-bezier(0.34, 1.4, 0.64, 1)" : "ease-out",
                      }}
                    >
                      {/* Outfit wrapper — objects ground feet on stage top face */}
                      <div
                        className="relative mb-5 flex h-80 w-full max-w-[18rem] items-end justify-center sm:h-96 sm:max-w-[21rem]"
                        style={{
                          transform: `translateY(${imageOffsets[look.id] ?? 0}px)`,
                        }}
                      >
                        {/* 1. Deep Core Occlusion Shadow directly under hem — anchors cuffs with zero gap */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%] bg-[#000000] transition-all duration-400 motion-reduce:transition-none"
                          style={{
                            width: activeLook ? "58%" : distance === 1 ? "46%" : "36%",
                            height: activeLook ? (isLifted ? "5px" : "7px") : "5px",
                            filter: `blur(${activeLook ? (isLifted ? 2.5 : 1.5) : 2}px)`,
                            opacity: activeLook
                              ? (isLifted ? 0.78 : 0.96)
                              : distance === 1
                              ? 0.72
                              : 0.45,
                            transform: `translateX(-50%) translateY(2px) scale(${activeLook && isLifted ? 0.92 : 1})`,
                            transitionTimingFunction: "cubic-bezier(0.34, 1.4, 0.64, 1)",
                          }}
                        />

                        {/* 2. Soft Ambient Contact Shadow spreading onto concrete stage surface */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%] bg-[#080808] transition-all duration-400 motion-reduce:transition-none"
                          style={{
                            width: activeLook ? "74%" : distance === 1 ? "60%" : "44%",
                            height: activeLook ? (isLifted ? "9px" : "12px") : "8px",
                            filter: `blur(${activeLook ? (isLifted ? 5.5 : 4.5) : 4}px)`,
                            opacity: activeLook
                              ? (isLifted ? 0.68 : 0.88)
                              : distance === 1
                              ? 0.58
                              : 0.32,
                            transform: `translateX(-50%) translateY(4px) scale(${activeLook && isLifted ? 0.90 : 1})`,
                            transitionTimingFunction: "cubic-bezier(0.34, 1.4, 0.64, 1)",
                          }}
                        />

                        {/* Outfit image — translate-y offsets bottom transparent PNG padding so cuffs touch bottom-0 */}
                        <Image
                          src={look.images[0]}
                          alt={`${look.name} — ${look.description}`}
                          fill
                          priority={activeLook}
                          loading={distance <= 1 ? "eager" : "lazy"}
                          placeholder="blur"
                          blurDataURL={DARK_BLUR_DATA_URL}
                          sizes="(min-width: 640px) 336px, 85vw"
                          className="relative z-10 object-contain object-bottom translate-y-[9px] sm:translate-y-[11px] transition-all duration-500"
                        />
                      </div>

                      {/* Label — visible only for the active look — placed cleanly below stage side wall on floor */}
                      <div
                        className={`mt-14 sm:mt-18 transition-opacity duration-300 ${
                          activeLook
                            ? "opacity-100"
                            : "pointer-events-none invisible opacity-0"
                        }`}
                        aria-hidden={!activeLook}
                      >
                        {/* Look name — matches typography */}
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#0d0a08] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
                          {look.name}
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-[#1c1612] max-w-lg mx-auto leading-relaxed">
                          {look.description}
                        </p>
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
              className="absolute bottom-0 left-1/2 z-30 flex h-11 w-11 shrink-0 translate-x-[0.85rem] items-center justify-center rounded-full border border-[#b86228] bg-[#181412] text-xl font-bold text-[#f7eee4] shadow-md shadow-black/40 transition-all duration-200 hover:bg-[#b86228] hover:text-[#141210] hover:scale-105 active:scale-95 md:static md:translate-x-0 cursor-pointer"
            >
              →
            </button>
          </div>

          {/* CTA to view anime page — below stage container with solid dark backing */}
          <div className="mt-4 sm:mt-5 text-center relative z-20">
            <Link
              href="/anime"
              className="inline-flex items-center gap-2 rounded-sm border border-[#b86228] bg-[#181412] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#f7eee4] shadow-md shadow-black/40 hover:bg-[#b86228] hover:text-[#141210] hover:border-[#b86228] hover:shadow-lg transition-all duration-200"
            >
              EXPLORE ANIME COLLECTION →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
