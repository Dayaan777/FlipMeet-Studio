"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const LOOKS = [
  {
    id: "anime-op-flame-outfit",
    slabLabel: "01  PINK FLAME",
    character: "PINK FLAME",
    series: "ONE PIECE",
    image: "/images/products/anime-op-flame-outfit.png",
    defaultPoster: "/images/anime/posters/pink-flame-default.png",
    hoverPoster: "/images/anime/posters/pink-flame-hover.png",
    color: "#F43F5E",
    glow: "rgba(244, 63, 94, 0.4)",
  },
  {
    id: "anime-gojo-outfit",
    slabLabel: "02  SATORU",
    character: "SATORU",
    series: "JUJUTSU KAISEN",
    image: "/images/products/anime-gojo-outfit.png",
    defaultPoster: "/images/anime/posters/satoru-default.png",
    hoverPoster: "/images/anime/posters/satoru-hover.png",
    color: "#A855F7",
    glow: "rgba(168, 85, 247, 0.4)",
  },
  {
    id: "anime-luffy-blue-outfit",
    slabLabel: "03  LUFFY",
    character: "LUFFY",
    series: "ONE PIECE",
    image: "/images/products/anime-luffy-blue-outfit.png",
    defaultPoster: "/images/anime/posters/luffy-default.png",
    hoverPoster: "/images/anime/posters/luffy-hover.png",
    color: "#3B82F6",
    glow: "rgba(59, 130, 246, 0.4)",
  },
  {
    id: "anime-robin-purple-outfit",
    slabLabel: "04  NICO ROBIN",
    character: "NICO ROBIN",
    series: "ONE PIECE",
    image: "/images/products/anime-robin-purple-outfit.png",
    defaultPoster: "/images/anime/posters/nico-robin-default.png",
    hoverPoster: "/images/anime/posters/nico-robin-hover.png",
    color: "#A855F7",
    glow: "rgba(168, 85, 247, 0.4)",
  },
  {
    id: "anime-zoro-green-outfit",
    slabLabel: "05  ZORO",
    character: "ZORO",
    series: "ONE PIECE",
    image: "/images/products/anime-zoro-green-outfit.png",
    defaultPoster: "/images/anime/posters/zoro-default.png",
    hoverPoster: "/images/anime/posters/zoro-hover.png",
    color: "#22C55E",
    glow: "rgba(34, 197, 94, 0.4)",
  },
] as const;

export default function AnimeDropReveal() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouchRef = useRef(false);

  // Close active hover state if touching outside carousel on mobile
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (isTouchRef.current) {
          setHoveredIndex(null);
        }
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // When dragging finger over cards on mobile, hover the card currently beneath finger
  const handleTouchMove = (e: React.TouchEvent) => {
    isTouchRef.current = true;
    const touch = e.touches[0];
    if (!touch) return;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target) return;
    const card = target.closest<HTMLElement>("[data-look-index]");
    if (card && card.dataset.lookIndex !== undefined) {
      const idx = parseInt(card.dataset.lookIndex, 10);
      if (!isNaN(idx) && idx !== hoveredIndex) {
        setHoveredIndex(idx);
      }
    }
  };

  // When scrolling/swiping through the carousel, hover the card nearest center
  const handleScroll = () => {
    if (!containerRef.current || !isTouchRef.current) return;
    const container = containerRef.current;
    const cards = container.querySelectorAll<HTMLElement>("[data-look-index]");
    if (!cards.length) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = -1;
    let minDistance = Infinity;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(containerCenter - cardCenter);
      if (dist < minDistance) {
        minDistance = dist;
        const idx = parseInt(card.dataset.lookIndex || "-1", 10);
        if (!isNaN(idx) && idx !== -1) closestIndex = idx;
      }
    });

    if (closestIndex !== -1 && closestIndex !== hoveredIndex) {
      setHoveredIndex(closestIndex);
    }
  };

  const handleCardClick = (e: React.MouseEvent, index: number) => {
    if (isTouchRef.current) {
      if (hoveredIndex !== index) {
        // First tap: light up this card with full color & glow
        e.preventDefault();
        setHoveredIndex(index);
      }
      // If already active, let it proceed to /product/${look.id}
    }
  };

  return (
    <section
      className="overflow-hidden px-6 py-10 sm:px-8 sm:py-14"
      aria-labelledby="anime-drop-reveal-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* ── Section Header (matches Editorial Archive style) ── */}
        <div className="mb-10 text-center md:mb-14">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-accent">
            05 LOOKS
          </p>
          <h2
            id="anime-drop-reveal-heading"
            className="font-display text-3xl tracking-wide text-[#1c1510] md:text-4xl"
          >
            THE ANIME COLLECTION
          </h2>
          <p className="mt-2 text-xs tracking-wider text-[#4e4034]">
            <span className="hidden [@media(hover:hover)]:inline">
              HOVER A LOOK TO LIGHT IT UP
            </span>
            <span className="[@media(hover:hover)]:hidden">
              TOUCH A LOOK TO LIGHT IT UP
            </span>
          </p>
        </div>

        {/* ── 5 Cards Layout (Desktop: 5 cols; Tablet: 3 + 2 centered; Mobile: horizontal scroll-snap) ── */}
        <div
          ref={containerRef}
          onTouchMove={handleTouchMove}
          onScroll={handleScroll}
          className="
            flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 pb-6 scrollbar-none
            md:overflow-visible md:snap-none md:flex-wrap md:justify-center md:gap-x-6 md:gap-y-12 md:px-0 md:pb-0
            lg:grid lg:grid-cols-5 lg:gap-4 xl:gap-6 lg:justify-items-center
          "
        >
          {LOOKS.map((look, i) => {
            const isActive = hoveredIndex === i || focusedIndex === i;

            return (
              <Link
                key={look.id}
                href={`/product/${look.id}`}
                data-look-index={i}
                onClick={(e) => handleCardClick(e, i)}
                onTouchStart={() => {
                  isTouchRef.current = true;
                  setHoveredIndex(i);
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") {
                    isTouchRef.current = false;
                    setHoveredIndex(i);
                  }
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") {
                    setHoveredIndex(null);
                  }
                }}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setFocusedIndex(null)}
                className="group relative block w-[220px] shrink-0 snap-center outline-none transition-none md:w-[220px] lg:w-full lg:max-w-[250px]"
                aria-label={`View ${look.slabLabel} outfit`}
              >
                {/* Fixed aspect-ratio stage matching 250px x 536px architecture */}
                <div className="relative aspect-[250/536] w-full select-none">
                  {/* Hover ambient color splash behind poster (stays dimmer than the outfit) */}
                  <div
                    className="pointer-events-none absolute left-1/2 top-[4%] h-[62%] w-[96%] -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(ellipse at center, ${look.glow} 0%, transparent 72%)`,
                      opacity: isActive ? 0.7 : 0,
                    }}
                    aria-hidden="true"
                  />

                  {/* 1. Back Layer: Character Poster (centered, 210px x 340px at 250px container, straight, no tilt) */}
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 h-[63.43%] w-[84%] -translate-x-1/2 select-none"
                    style={{
                      filter: "drop-shadow(6px 10px 14px rgba(0,0,0,0.45))",
                    }}
                  >
                    {/* Default monochrome concrete-toned poster */}
                    <Image
                      src={look.defaultPoster}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 185px, (max-width: 1024px) 210px, 210px"
                      className="object-contain object-top transition-opacity duration-300"
                      style={{ opacity: isActive ? 0 : 1 }}
                      priority={i < 2}
                    />
                    {/* Hover full-color poster */}
                    <Image
                      src={look.hoverPoster}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 185px, (max-width: 1024px) 210px, 210px"
                      className="object-contain object-top transition-opacity duration-300"
                      style={{ opacity: isActive ? 1 : 0 }}
                      priority={i < 2}
                    />
                  </div>

                  {/* 2. Middle Layer: Outfit Image (centered in front, 410px tall, starts 1/4 down poster, pants hang below poster) */}
                  <div
                    className="pointer-events-none absolute left-1/2 top-[15.86%] z-10 h-[76.49%] w-full -translate-x-1/2 select-none"
                    style={{
                      filter: "drop-shadow(10px 10px 10px rgba(0,0,0,0.6))",
                    }}
                  >
                    <Image
                      src={look.image}
                      alt={`${look.character} outfit`}
                      fill
                      sizes="(max-width: 640px) 220px, (max-width: 1024px) 250px, 250px"
                      className="object-contain object-bottom"
                      priority={i < 2}
                    />
                  </div>

                  {/* 3. Front Layer: Concrete Slab (250px wide, feet overlap lighter top face by ~6px) */}
                  <div className="pointer-events-none absolute bottom-0 inset-x-0 z-20 h-[9.33%] w-full select-none">
                    {/* Soft blurred shadow under each slab */}
                    <div
                      className="pointer-events-none absolute -bottom-2 inset-x-2 h-3.5 rounded-full bg-black/45 blur-md"
                      aria-hidden="true"
                    />

                    {/* Slab image */}
                    <div className="relative h-full w-full">
                      <Image
                        src="/images/anime/posters/concrete-slab.png"
                        alt=""
                        fill
                        sizes="(max-width: 640px) 220px, 250px"
                        className="object-fill select-none"
                        priority
                      />

                      {/* 4. Slab Label: Live text centered on front vertical face (bottom ~70% of slab) */}
                      <div className="absolute inset-x-0 bottom-0 top-[28%] flex items-center justify-center px-1 text-center">
                        <span className="select-none font-sans text-[11px] font-bold uppercase leading-none tracking-[0.25em] text-[#2c2621] sm:text-[12px] lg:text-[13px] whitespace-nowrap">
                          {look.slabLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
