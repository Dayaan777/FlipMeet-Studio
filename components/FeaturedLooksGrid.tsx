"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Drop, Look } from "@/data/drops";
import PlatformRing from "@/components/PlatformRing";

function FeaturedLook({ look, active, onSelect }: { look: Look; active: boolean; onSelect: () => void }) {
 return (
  <div
   onClick={onSelect}
   className={`group relative flex min-w-0 flex-1 flex-col stone-frame rounded-[2px] overflow-hidden transition-all duration-300 ${
    active ? "ring-1 ring-accent/70 shadow-[0_16px_40px_rgba(0,0,0,0.7)]" : "opacity-80 hover:opacity-100"
   }`}
  >
   <Link href={`/product/${look.id}`} aria-label={`View ${look.name}`} className="flex flex-col h-full">
    {/* Outfit image with ambient stone pedestal lighting */}
    <div className="relative h-64 sm:h-72 w-full p-4 flex items-center justify-center bg-gradient-to-b from-base-surface/40 via-base-surface/10 to-base-bg/60 overflow-hidden">
     <Image
      src={look.images[0]}
      alt={`${look.name} ${look.description}`}
      fill
      sizes="(min-width: 1024px) 20vw, 45vw"
      className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
     />
    </div>

    {/* Stone Bottom Price Tab with Title & Copper "+" Button */}
    <div className="stone-tab p-3 flex items-center justify-between gap-2 mt-auto">
     <div className="min-w-0 text-left">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-primary truncate group-hover:text-accent transition-colors">
       {look.name}
      </p>
      <p className="text-[10px] tracking-wide text-accent font-medium mt-0.5">
       PKR {look.price ? look.price.toLocaleString() : "5,490"}
      </p>
     </div>
     <span className="btn-copper-plus shrink-0" aria-hidden="true">
      +
     </span>
    </div>
   </Link>
  </div>
 );
}

export default function FeaturedLooksGrid({ drop }: { drop: Drop }) {
 const [focusedIndex, setFocusedIndex] = useState(0);
 const looks = (drop.looks || []).slice(0, 4);

 const moveFocus = (direction: number) => {
  if (!looks.length) return;
  setFocusedIndex((current) => (current + direction + looks.length) % looks.length);
 };

 if (!looks.length) return null;

 return (
  <section className="stone-divider overflow-hidden px-6 pb-24 pt-20" aria-labelledby="featured-looks-heading">
   <div className="mx-auto max-w-7xl">
    <p className="mb-2 text-center section-label">NEW COLLECTION</p>
    <h2 id="featured-looks-heading" className="text-balance text-center font-display text-3xl tracking-wide text-text-primary md:text-4xl">
     {drop.name} - FEATURED LOOKS
    </h2>

    <div className="relative mx-auto mt-10 max-w-6xl px-4 pb-16 sm:px-3 sm:pb-1">
     {/* Platform ring sits at the footer of the outfit grid */}
     <PlatformRing
      bloomX={looks.length > 1 ? (focusedIndex / (looks.length - 1)) * 100 : 50}
      className="bottom-[3.25rem] transition-[left] duration-300"
     />

     {/* Outfit grid */}
     <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 items-end gap-5 sm:gap-4 lg:gap-8">
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
      className="absolute bottom-0 left-1/2 z-20 flex size-10 -translate-x-[calc(100%+0.75rem)] items-center justify-center rounded-full border border-text-secondary/50 text-xl text-text-primary transition-colors hover:border-text-primary hover:bg-text-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:left-[-2.5rem] sm:top-1/2 sm:bottom-auto sm:translate-x-0 sm:-translate-y-1/2"
     >
      <span aria-hidden="true">←</span>
     </button>
     <button
      type="button"
      aria-label="Next featured look"
      onClick={() => moveFocus(1)}
      className="absolute bottom-0 left-1/2 z-20 flex size-10 translate-x-3/4 items-center justify-center rounded-full border border-text-secondary/50 text-xl text-text-primary transition-colors hover:border-text-primary hover:bg-text-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:right-[-2.5rem] sm:left-auto sm:top-1/2 sm:bottom-auto sm:translate-x-0 sm:-translate-y-1/2"
     >
      <span aria-hidden="true">→</span>
     </button>
    </div>

    {/* CTA to view look details */}
    <div className="mt-12 text-center">
     <Link
      href={`/product/${looks[focusedIndex]?.id || looks[0]?.id || ""}`}
      className="btn-copper"
     >
      EXPLORE THE COLLECTION →
     </Link>
    </div>
   </div>
  </section>
 );
}
