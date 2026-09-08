"use client";

import Image from "next/image";
import { useState } from "react";
import type { Drop } from "@/data/drops";

export default function LookCarousel({ drop }: { drop: Drop }) {
  const [active, setActive] = useState(0);
  const count = drop.looks.length;
  const shift = (direction: number) => setActive((index) => (index + direction + count) % count);
  const relative = (index: number) => ((index - active + Math.ceil(count / 2)) % count) - Math.ceil(count / 2);

  return (
    <section className="overflow-hidden border-b border-base-border px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-center text-xs tracking-widest text-accent">THE COLLECTION</p>
        <h2 className="mb-14 text-center font-display text-3xl text-text-primary md:text-4xl">{drop.name} - {count} OUTFITS</h2>
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-[8%] bottom-20 h-24 rounded-[50%] border border-text-secondary/60 shadow-[0_18px_24px_rgba(255,255,255,0.08),inset_0_8px_18px_rgba(255,255,255,0.08)] sm:inset-x-[14%]" />
          <div className="pointer-events-none absolute inset-x-[14%] bottom-12 h-10 rounded-[50%] bg-black/60 blur-xl sm:inset-x-[20%]" />
          <div className="flex items-center gap-4 md:gap-8">
            <button type="button" aria-label="Previous look" onClick={() => shift(-1)} className="z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-base-border text-lg text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary">←</button>
            <div className="min-w-0 flex-1">
              <div className="relative mx-auto h-[30rem] w-full max-w-4xl [perspective:1200px] sm:h-[34rem]" aria-live="polite">
                {drop.looks.map((look, index) => {
                  const position = relative(index);
                  const distance = Math.abs(position);
                  const activeLook = position === 0;
                  const side = position < 0 ? -1 : 1;
                  const transform = activeLook ? "translate3d(0, 0, 80px) rotateY(0deg) scale(1)" : distance === 1 ? `translate3d(${side * 30}%, 0, -50px) rotateY(${side * -16}deg) scale(0.78)` : `translate3d(${side * (42 + Math.min(distance - 2, 2) * 5)}%, 0, -${130 + distance * 25}px) rotateY(${side * -24}deg) scale(${Math.max(0.54, 0.66 - (distance - 2) * 0.05)})`;
                  const opacity = activeLook ? 1 : distance === 1 ? 0.62 : Math.max(0.22, 0.38 - (distance - 2) * 0.05);
                  return (
                    <button type="button" key={look.id} onClick={() => setActive(index)} aria-label={`Show ${look.name}`} aria-current={activeLook ? "true" : undefined} className="absolute inset-0 flex flex-col items-center text-center transition-[transform,opacity,filter] duration-500 ease-out" style={{ transform, opacity, zIndex: count - distance, filter: activeLook ? "none" : `blur(${Math.min(distance, 2) * 0.35}px)` }}>
                      <div className="relative mb-5 flex h-80 w-full max-w-[18rem] items-end justify-center sm:h-96 sm:max-w-[21rem]">
                        <div className={`absolute bottom-2 h-4/5 w-3/5 rounded-[45%] blur-2xl transition-all duration-500 ${activeLook ? "scale-125 bg-accent/20" : "bg-text-secondary/10"}`} />
                        <Image src={look.images[0]} alt={`${look.name} — ${look.description}`} fill sizes="(min-width: 768px) 28rem, 75vw" className={`object-contain transition-all duration-500 ${activeLook ? "drop-shadow-[0_0_24px_rgba(255,77,30,0.45)]" : ""}`} />
                      </div>
                      <p className="text-sm text-text-primary">{look.name}</p>
                      <p className="mt-1 text-xs text-text-secondary">{look.description}</p>
                      <span className={`mx-auto mt-3 block h-0.5 transition-all duration-300 ${activeLook ? "w-8 bg-accent" : "w-1.5 rounded-full bg-text-secondary"}`} />
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
