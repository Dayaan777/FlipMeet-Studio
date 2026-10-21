"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import type { Drop } from "@/data/drops";
import PlatformRing from "@/components/PlatformRing";
import { DARK_BLUR_DATA_URL } from "@/lib/image-placeholder";

export default function LookCarousel({ drop }: { drop: Drop }) {
 const [active, setActive] = useState(0);
 const count = drop.looks.length;

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
  // If moving horizontally more than vertically, mark as swiping
  if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
   isSwiping.current = true;
  }
 };

 const handleTouchEnd = (e: React.TouchEvent) => {
  if (touchStartX.current === null || touchStartY.current === null) return;
  const diffX = e.changedTouches[0].clientX - touchStartX.current;
  const diffY = e.changedTouches[0].clientY - touchStartY.current;
  const threshold = 40; // minimum swipe distance in px

  if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY)) {
   if (diffX < 0) {
    shift(1); // Swipe Left -> Next
   } else {
    shift(-1); // Swipe Right -> Prev
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

 // Signed relative position: 0 = active, ±1 = adjacent, ±2+ = background
 const relative = (index: number) =>
  ((index - active + Math.ceil(count / 2)) % count) - Math.ceil(count / 2);

 return (
  <section
   className="overflow-hidden px-6 py-10 sm:py-14"
   aria-labelledby="look-carousel-heading"
  >
   <div className="mx-auto max-w-7xl">
    {/* ── Section header matches FeaturedLooksGrid typography ── */}
    <p className="mb-2 text-center text-xs font-extrabold tracking-[0.28em] text-[#78330a]">THE COLLECTION</p>
    <h2
     id="look-carousel-heading"
     className="mb-8 sm:mb-10 text-center font-display text-3xl font-extrabold tracking-wide text-[#0d0a08] md:text-4xl [font-variant-numeric:lining-nums_tabular-nums]"
    >
     {drop.name} {count} OUTFITS
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
        * Stage container perspective 3-D depth stack.
        * The platform ring sits at the very bottom of this container;
        * all outfit cards are positioned absolutely within it.
        */}
       <div
        className="relative mx-auto h-[30rem] w-full max-w-4xl [perspective:1200px] sm:h-[34rem] touch-pan-y"
        aria-live="polite"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
       >
        {/* ── Platform ring centred bloom (active is always position 0) ── */}
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

         // 3-D transform unchanged depth-stack logic, refined scale values
         const transform = activeLook
          ? "translate3d(0, 18px, 80px) rotateY(0deg) scale(1)"
          : distance === 1
          ? `translate3d(${side * 30}%, 18px, -50px) rotateY(${side * -16}deg) scale(0.78)`
          : `translate3d(${side * (42 + Math.min(distance - 2, 2) * 5)}%, 18px, -${130 + distance * 25}px) rotateY(${side * -24}deg) scale(${Math.max(0.54, 0.66 - (distance - 2) * 0.05)})`;

         // Opacity falloff slightly crisper than before
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
           onClick={(e) => {
            if (isSwiping.current) {
             e.preventDefault();
             e.stopPropagation();
            }
           }}
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
           {/* Outfit image object-bottom grounds feet on ring */}
           <div
            className="relative mb-5 flex h-80 w-full max-w-[18rem] items-end justify-center sm:h-96 sm:max-w-[21rem]"
            style={{
             transform: `translateY(${imageOffsets[look.id] ?? 0}px)`,
            }}
           >
            <Image
             src={look.images[0]}
             alt={`${look.name} ${look.description}`}
             fill
             sizes="(min-width: 640px) 336px, 85vw"
             priority={activeLook}
             loading={activeLook ? undefined : distance <= 1 ? "eager" : "lazy"}
             placeholder="blur"
             blurDataURL={DARK_BLUR_DATA_URL}
             className="object-contain object-bottom transition-all duration-500"
             style={activeLook ? { filter: "drop-shadow(0 0 24px rgb(var(--accent) / 0.45))" } : undefined}
            />
           </div>

           {/* Label visible only for the active look — moved below stage ring */}
           <div
            className={`mt-4 sm:mt-5 transition-opacity duration-300 ${
             activeLook
              ? "opacity-100"
              : "pointer-events-none invisible opacity-0"
            }`}
            aria-hidden={!activeLook}
           >
            {/* Look name matches FeaturedLooksGrid typography */}
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

     {/* CTA to view active look product page — moved up and styled with solid dark backing so mortar line cannot overlap */}
     <div className="mt-4 sm:mt-5 text-center relative z-20">
      <Link
       href={`/product/${drop.looks[active]?.id || drop.looks[0]?.id || ""}`}
       className="inline-flex items-center gap-2 rounded-sm border border-[#b86228] bg-[#181412] px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#f7eee4] shadow-md shadow-black/40 hover:bg-[#b86228] hover:text-[#141210] hover:border-[#b86228] hover:shadow-lg transition-all duration-200"
      >
       ORDER {drop.looks[active]?.name || "LOOK"} →
      </Link>
     </div>
    </div>
   </div>
  </section>
 );
}
