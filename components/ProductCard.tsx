"use client";

import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  category?: string;
  description?: string;
  className?: string;
  variant?: "standard" | "pedestal";
}

/**
 * Reusable Brutalist Product Card matching the HT x Studio Mockup:
 * - standard: Stone frame with subtle concrete bevel & bottom price tab with "+" button
 * - pedestal: Upgraded 3D chipped-edge brutalist stone pedestal card for "Complete the Look" cross-sell grid
 */
export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  category,
  description,
  className = "",
  variant = "standard",
}: ProductCardProps) {
  if (variant === "pedestal") {
    return (
      <div
        className={`group relative flex flex-col rounded-[2px] transition-all duration-300 hover:scale-[1.015] hover:drop-shadow-[0_24px_45px_rgba(0,0,0,0.75)] ${className}`}
      >
        <Link href={`/product/${id}`} className="flex flex-col h-full">
          {/* Upper Dark Brutalist Stone Frame */}
          <div className="stone-frame relative aspect-[3/4] w-full p-5 flex items-center justify-center rounded-t-[2px] border border-[#3d332a] bg-gradient-to-b from-[#221c18] via-[#1a1613] to-[#12100e] overflow-hidden">
            {/* Top Tag Row */}
            <div className="absolute top-3 inset-x-3.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-text-secondary/75 z-10">
              <span className="font-semibold text-text-secondary">{category || "GARMENT"}</span>
              <span className="text-accent/80 font-bold">1 OF 100</span>
            </div>

            {/* Garment Visual */}
            <Image
              src={image || "/images/placeholder.jpg"}
              alt={name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105 drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
            />
          </div>

          {/* 3D Chipped-Edge Stone Pedestal Base */}
          <div className="relative rounded-b-[2px] border border-t-0 border-[#3d332a] overflow-hidden shadow-[0_18px_36px_rgba(0,0,0,0.65)]">
            {/* Background Texture of Chipped Stone Pedestal */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-luminosity filter contrast-125"
              style={{ backgroundImage: "url(/images/pedestal-card-riser.webp)" }}
            />
            {/* Dark stone tint overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#241e1a]/95 via-[#1a1614]/98 to-[#120f0d] pointer-events-none" />

            {/* Top highlighted stone ledge bevel */}
            <div className="relative z-10 w-full h-[3px] bg-gradient-to-r from-[#8a7b6b] via-[#5c4e40] to-[#362e26]" />

            {/* Content within Pedestal Face */}
            <div className="relative z-10 p-3.5 flex flex-col justify-between gap-1.5 min-h-[92px]">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary truncate group-hover:text-accent transition-colors">
                    {name}
                  </h3>
                  <span className="font-sans text-xs font-bold tracking-wide text-accent whitespace-nowrap">
                    PKR {price.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary/75 line-clamp-1 mt-0.5 leading-tight font-sans">
                  {description || "Limited edition studio piece crafted for the collection."}
                </p>
              </div>

              <div className="flex items-center justify-end text-[10px] font-bold uppercase tracking-[0.24em] text-text-primary group-hover:text-accent transition-colors pt-1">
                <span>VIEW PIECE &rarr;</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex flex-col stone-frame rounded-[2px] overflow-hidden transition-all duration-300 hover:border-accent/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7)] ${className}`}
    >
      <Link href={`/product/${id}`} className="flex flex-col h-full">
        {/* Stone Frame Image Container */}
        <div className="relative aspect-[3/4] w-full p-4 flex items-center justify-center bg-gradient-to-b from-base-surface/40 via-base-surface/10 to-base-bg/60 overflow-hidden">
          {category && (
            <span className="absolute top-2.5 left-2.5 text-[9px] uppercase tracking-[0.2em] text-text-secondary/70 z-10">
              {category}
            </span>
          )}
          <Image
            src={image || "/images/placeholder.jpg"}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        {/* Stone Bottom Price Tab with Title & Copper "+" Button */}
        <div className="stone-tab p-3 flex items-center justify-between gap-2 mt-auto">
          <div className="min-w-0 text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary truncate group-hover:text-accent transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] tracking-wide text-accent font-medium font-sans">
                PKR {price.toLocaleString()}
              </span>
              {oldPrice && oldPrice > price && (
                <span className="text-[9px] text-text-secondary/60 line-through">
                  PKR {oldPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <span
            className="btn-copper-plus shrink-0"
            aria-label={`View ${name}`}
          >
            +
          </span>
        </div>
      </Link>
    </div>
  );
}
