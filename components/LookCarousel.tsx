"use client";

import Image from "next/image";
import { useState } from "react";
import type { Drop } from "@/data/drops";

export default function LookCarousel({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const count = drop.looks.length;
  const imageOffsets: Record<string, number> = {
    "look-02": 18,
    "look-03": 24,
  };
  const shift = (direction: number) => setActive((index) => (index + direction + count) % count);
  const relative = (index: number) => ((index - active + Math.ceil(count / 2)) % count) - Math.ceil(count / 2);

  return (
    <section className="overflow-hidden border-b border-base-border px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-center text-xs tracking-widest text-accent">THE COLLECTION</p>
        <h2 className="mb-14 text-center font-display text-3xl text-text-primary md:text-4xl">{drop.name} - {count} OUTFITS</h2>
        <div className="relative">
          <div className="flex items-center gap-4 md:gap-8">
            <button type="button" aria-label="Previous look" onClick={() => shift(-1)} className="z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-base-border text-lg text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary">←</button>
            <div className="min-w-0 flex-1">
              <div className="relative mx-auto h-[30rem] w-full max-w-4xl [perspective:1200px] sm:h-[34rem]" aria-live="polite">
                <div aria-hidden="true" className="pointer-events-none absolute bottom-[7.25rem] left-1/2 z-0 h-[4.5rem] w-[104%] -translate-x-1/2 rounded-[50%] bg-[linear-gradient(116deg,rgba(255,255,255,0)_8%,rgba(255,255,255,0.16)_25%,rgba(255,255,255,0.055)_39%,rgba(255,255,255,0)_54%),radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.15)_0%,rgba(113,46,33,0.55)_17%,rgba(34,27,25,0.98)_44%,rgba(12,12,12,1)_73%,rgba(2,2,2,1)_100%)] shadow-[0_10px_18px_rgba(0,0,0,0.8),0_0_42px_rgba(255,77,30,0.12),0_0_80px_rgba(255,77,30,0.08),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_3px_5px_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(255,255,255,0.22),inset_0_-3px_0_rgba(0,0,0,0.96),inset_0_-10px_14px_rgba(0,0,0,0.78)] [transform:translateX(-50%)_perspective(900px)_rotateX(62deg)_rotateZ(-2deg)] after:absolute after:inset-[3px] after:rounded-[50%] after:bg-[linear-gradient(112deg,transparent_16%,rgba(255,255,255,0.11)_30%,rgba(255,255,255,0.025)_43%,transparent_56%),radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.09),transparent_40%,rgba(0,0,0,0.34)_100%)] sm:bottom-[7.75rem] sm:h-20 sm:w-[104%]" />
                {drop.looks.map((look, index) => {
                  const position = relative(index);
                  const distance = Math.abs(position);
                  const activeLook = position === 0;
                  const side = position < 0 ? -1 : 1;
                  const transform = activeLook ? "translate3d(0, 18px, 80px) rotateY(0deg) scale(1)" : distance === 1 ? `translate3d(${side * 30}%, 18px, -50px) rotateY(${side * -16}deg) scale(0.78)` : `translate3d(${side * (42 + Math.min(distance - 2, 2) * 5)}%, 18px, -${130 + distance * 25}px) rotateY(${side * -24}deg) scale(${Math.max(0.54, 0.66 - (distance - 2) * 0.05)})`;
                  const opacity = activeLook ? 1 : distance === 1 ? 0.62 : Math.max(0.22, 0.38 - (distance - 2) * 0.05);
                  return (
                    <button type="button" key={look.id} onClick={() => setActive(index)} aria-label={`Show ${look.name}`} aria-current={activeLook ? "true" : undefined} className="absolute inset-0 flex flex-col items-center text-center transition-[transform,opacity,filter] duration-500 ease-out" style={{ transform, opacity, zIndex: count - distance, transformOrigin: "center 76%", filter: activeLook ? "none" : `blur(${Math.min(distance, 2) * 0.35}px)` }}>
                      <div className="relative mb-5 flex h-80 w-full max-w-[18rem] items-end justify-center sm:h-96 sm:max-w-[21rem]" style={{ transform: `translateY(${imageOffsets[look.id] ?? 0}px)` }}>
                        <div className={`absolute bottom-2 h-4/5 w-3/5 rounded-[45%] blur-2xl transition-all duration-500 ${activeLook ? "scale-125 bg-accent/20" : "bg-text-secondary/10"}`} />
                        <Image src={look.images[0]} alt={`${look.name} — ${look.description}`} fill sizes="(min-width: 768px) 28rem, 75vw" className={`object-contain transition-all duration-500 ${activeLook ? "drop-shadow-[0_0_24px_rgba(255,77,30,0.45)]" : ""}`} />
                      </div>
                      <div className={`transition-opacity duration-300 ${activeLook ? "opacity-100" : "pointer-events-none invisible opacity-0"}`} aria-hidden={!activeLook}>
                        <p className="text-sm text-text-primary">{look.name}</p>
                        <p className="mt-1 text-xs text-text-secondary">{look.description}</p>
                        <span className="mx-auto mt-3 block h-0.5 w-8 bg-accent" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="button" aria-label="Next look" onClick={() => shift(1)} className="z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-base-border text-lg text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary">→</button>
          </div>
        </div>
      </div>
    </section>
  );
}
