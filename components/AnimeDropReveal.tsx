"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Each look: backdrop card (always full color) + garment PNG (silhouette → revealed)
// Platform ring color is character-specific
const LOOKS = [
  {
    id: "anime-op-flame-outfit",
    name: "LOOK 01",
    character: "OP FLAME",
    series: "ONE PIECE",
    image: "/images/products/anime-op-flame-outfit.png",
    card: "/images/anime/cards/doflamingo-card.jpg",
    color: "#F43F5E",
    glow: "rgba(244, 63, 94, 0.4)",
    dimRing: "rgba(244, 63, 94, 0.12)",
  },
  {
    id: "anime-gojo-outfit",
    name: "LOOK 02",
    character: "GOJO",
    series: "JUJUTSU KAISEN",
    image: "/images/products/anime-gojo-outfit.png",
    card: "/images/anime/cards/gojo-card.jpg",
    color: "#A855F7",
    glow: "rgba(168, 85, 247, 0.4)",
    dimRing: "rgba(168, 85, 247, 0.1)",
  },
  {
    id: "anime-luffy-blue-outfit",
    name: "LOOK 03",
    character: "LUFFY BLUE",
    series: "ONE PIECE",
    image: "/images/products/anime-luffy-blue-outfit.png",
    card: "/images/anime/cards/luffy-card.jpg",
    color: "#3B82F6",
    glow: "rgba(59, 130, 246, 0.4)",
    dimRing: "rgba(59, 130, 246, 0.12)",
  },
  {
    id: "anime-robin-purple-outfit",
    name: "LOOK 04",
    character: "ROBIN",
    series: "ONE PIECE",
    image: "/images/products/anime-robin-purple-outfit.png",
    card: "/images/anime/cards/robin-card.jpg",
    color: "#A855F7",
    glow: "rgba(168, 85, 247, 0.4)",
    dimRing: "rgba(168, 85, 247, 0.1)",
  },
  {
    id: "anime-zoro-green-outfit",
    name: "LOOK 05",
    character: "ZORO",
    series: "ONE PIECE",
    image: "/images/products/anime-zoro-green-outfit.png",
    card: "/images/anime/cards/zoro-card.jpg",
    color: "#22C55E",
    glow: "rgba(34, 197, 94, 0.4)",
    dimRing: "rgba(34, 197, 94, 0.12)",
  }
] as const;

export default function AnimeDropReveal() {
 const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
 const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
     ANIME DROP 001 05 LOOKS
    </h2>

    {/* ── 5 looks in a straight horizontal row ── */}
    {/* Horizontally scrollable on mobile, full grid on large screens */}
    <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0">
     <div className="flex gap-3 md:gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
      {LOOKS.map((look, i) => {
       const isFocused = focusedIndex === i;
       const isActive = isFocused || hoveredIndex === i;

       return (
        <Link
         key={look.id}
         href={`/product/${look.id}`}
         onPointerEnter={() => setHoveredIndex(i)}
         onPointerLeave={() => setHoveredIndex(null)}
         onPointerDown={(event) => {
          if (event.pointerType === "touch") {
           event.preventDefault();
           setFocusedIndex(i);
          }
         }}
         className="group contents"
        >
         <div
          className="flex w-[162px] flex-col sm:w-[185px] lg:w-auto"
         >
         {/* ── Portrait card: backdrop (always color) + garment (silhouette → revealed) ── */}
         <div
          className={`relative aspect-[9/16] overflow-hidden rounded-sm border transition-all duration-700 group-hover:brightness-100 group-focus-visible:brightness-100 ${isActive ? "brightness-100" : "brightness-[0.65]"}`}
          style={{
           borderColor: isActive ? `${look.color}55` : "rgba(255,255,255,0.06)",
           boxShadow: isActive ? `0 0 28px 3px ${look.glow}, inset 0 0 0 1px ${look.color}25` : "none",
          }}
         >
          {/* Backdrop card ALWAYS full color, regardless of reveal state */}
          <Image
           src={look.card}
           alt=""
           aria-hidden="true"
           fill
           sizes="(max-width: 640px) 162px, (max-width: 1024px) 185px, 20vw"
           className="object-cover object-center transition-[filter] duration-700 group-hover:brightness-100 group-focus-visible:brightness-100"
           style={{ filter: isActive ? "brightness(1)" : "brightness(0.65)" }}
           priority={i === 0}
          />

          {/* Garment cutout */}
          <div className="absolute inset-0 p-[5%]">
           <Image
            src={look.image}
            alt={`${look.series} ${look.character} jersey`}
            fill
            sizes="(max-width: 640px) 162px, (max-width: 1024px) 185px, 20vw"
            className="object-contain object-bottom transition-[filter] duration-700 group-hover:brightness-100 group-focus-visible:brightness-100"
            style={{
             filter: isActive ? "brightness(1)" : "brightness(0.65)",
             padding: "4%",
            }}
           />
          </div>

          {/* Revealed: character-colored glow at bottom of card */}
          <div
           className="absolute inset-x-0 bottom-0 h-[30%] pointer-events-none transition-opacity duration-700"
           style={{
            background: `linear-gradient(to top, ${look.glow} 0%, transparent 100%)`,
            opacity: isActive ? 1 : 0,
           }}
          />
         </div>

         {/* ── Platform ring glowing ellipse in character color ── */}
         <div className="relative mt-0.5 h-7 select-none" aria-hidden="true">
          <svg
           viewBox="0 0 200 28"
           className="absolute inset-0 h-full w-full"
          >
           <defs>
            {/* Glow filter unique per look to avoid ID collisions */}
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
            stroke={isActive ? look.color : look.dimRing}
            strokeWidth={isActive ? 2.8 : 1}
            opacity={isActive ? 0.9 : 0.35}
            filter={isActive ? `url(#rg-${look.id})` : undefined}
            style={{ transition: "stroke 0.7s ease, stroke-width 0.7s ease, opacity 0.7s ease" }}
           />
           {/* Inner specular ring */}
           <ellipse
            cx="100"
            cy="18"
            rx="70"
            ry="7.5"
            fill="none"
            stroke={isActive ? look.color : look.dimRing}
            strokeWidth="1"
            opacity={isActive ? 0.4 : 0.18}
            style={{ transition: "stroke 0.7s ease, opacity 0.7s ease" }}
           />
          </svg>

          {/* Floor bloom beneath the ring */}
          <div
           className="absolute inset-x-[8%] bottom-0 h-full pointer-events-none transition-opacity duration-700"
           style={{
            background: `radial-gradient(ellipse at 50% 80%, ${look.glow} 0%, transparent 70%)`,
            filter: "blur(5px)",
            opacity: isActive ? 1 : 0,
           }}
          />
         </div>

         {/* ── Character label ── */}
         <div className="mt-2.5 text-center space-y-0.5">
          <p
           className="text-[9px] font-bold uppercase tracking-[0.22em] transition-colors duration-700"
           style={{ color: isActive ? look.color : "#252525" }}
          >
           {look.series}
          </p>
          <p
           className="text-[11px] font-bold uppercase tracking-widest transition-colors duration-700"
           style={{ color: isActive ? "#ffffff" : "#252525" }}
          >
           {look.character}
          </p>
          <p
           className="text-[8px] tracking-[0.14em] transition-colors duration-700"
           style={{ color: isActive ? "#6b6b6b" : "#1a1a1a" }}
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

   </div>
  </section>
 );
}
