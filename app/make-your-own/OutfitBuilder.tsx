"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
};

interface OutfitBuilderProps {
  tops: Product[];
  bottoms: Product[];
}

// ─── AI Verdict ────────────────────────────────────────────────────────────────

function getAIVerdict(top: Product, bottomItem: Product): string {
  const topName = top.name.toLowerCase();
  const bottomName = bottomItem.name.toLowerCase();

  const keywords: string[] = [];
  const tips: string[] = [];
  let confidence = 8;

  // Top keyword analysis
  if (topName.includes("polo")) {
    keywords.push("polo vibes");
    tips.push("tuck the polo halfway for that intentional streetwear finish");
    confidence = Math.max(confidence, 9);
  }
  if (topName.includes("jersey")) {
    keywords.push("athletic archive energy");
    tips.push("let the jersey hang loose — don't tuck, let it breathe");
    confidence = Math.max(confidence, 9);
  }
  if (topName.includes("oversized")) {
    keywords.push("oversized silhouette dominance");
    tips.push("balance the volume with slim-tapered bottoms");
  }
  if (topName.includes("graphic") || topName.includes("print")) {
    keywords.push("loud graphic storytelling");
    tips.push("keep accessories minimal — the graphic speaks loud enough");
  }
  if (topName.includes("anime") || topName.includes("manga")) {
    keywords.push("archive anime culture flex");
    tips.push("cop some clean white forces to keep the energy pure");
    confidence = Math.max(confidence, 10);
  }
  if (topName.includes("stripe") || topName.includes("striped")) {
    keywords.push("classic stripe structure");
    tips.push("go monochrome on the bottom to let the stripes lead");
  }

  // Bottom keyword analysis
  if (bottomName.includes("denim") || bottomName.includes("jean")) {
    keywords.push("denim stacking");
    tips.push("stack the denim slightly above clean white low-tops");
    confidence = Math.max(confidence, 9);
  }
  if (bottomName.includes("cargo")) {
    keywords.push("utility cargo layering");
    tips.push("add a crossbody bag to complete the functional aesthetic");
    confidence = Math.max(confidence, 9);
  }
  if (bottomName.includes("jogger") || bottomName.includes("sweat")) {
    keywords.push("comfort-flex movement");
    tips.push("pair with chunky sneakers to elevate the casual base");
  }
  if (bottomName.includes("trouser") || bottomName.includes("pant")) {
    keywords.push("structured trouser architecture");
    tips.push("let the trouser crease define the look — iron it sharp");
  }
  if (bottomName.includes("wide") || bottomName.includes("baggy")) {
    keywords.push("wide-leg silhouette power");
    tips.push("keep the top tucked or cropped to avoid swallowing the frame");
    confidence = Math.max(confidence, 9);
  }
  if (bottomName.includes("black")) {
    keywords.push("all-black foundation");
    tips.push("black-on-black with a pop of white sole hits every time");
  }

  // Default fallbacks
  if (keywords.length === 0) {
    keywords.push("clean streetwear composition");
  }
  const tip =
    tips.length > 0
      ? tips[0]
      : "finish the look with white low-tops and you're done";

  const keywordStr = keywords.slice(0, 2).join(" meets ");

  return `We're reading: ${top.name} locked in with ${bottomItem.name}. This is a statement look. The ${keywordStr} gives serious archive energy. ${tip.charAt(0).toUpperCase() + tip.slice(1)}. Confidence rating: ${confidence}/10.`;
}

// ─── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  selected,
  onClick,
}: {
  product: Product;
  selected: boolean;
  onClick: () => void;
}) {
  const imgSrc =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/images/placeholder.jpg";

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col rounded-sm overflow-hidden border transition-all duration-200 text-left w-full ${
        selected
          ? "border-accent shadow-[0_0_12px_rgba(255,168,56,0.2)]"
          : "border-base-border hover:border-text-secondary"
      }`}
    >
      {/* Thumbnail — square, object-contain so nothing crops */}
      <div className="relative w-full aspect-square bg-base-bg overflow-hidden flex items-end justify-center">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 40vw, 12vw"
          className="object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
        />
        {selected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center z-10">
            <span className="text-black text-[10px] font-black">✓</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="px-2 py-1.5 bg-base-surface flex-1 border-t border-base-border">
        <p className="text-text-primary text-[10px] font-display leading-tight line-clamp-2">
          {product.name}
        </p>
        <p className="text-accent text-[9px] mt-0.5 font-bold tracking-wide">
          PKR {product.price.toLocaleString()}
        </p>
      </div>
    </button>
  );
}

// ─── Accordion ─────────────────────────────────────────────────────────────────

function AccordionSection({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-base-border">
      {/* Header toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-xs tracking-[0.2em] text-text-primary uppercase">
            {title}
          </span>
          <span className="bg-accent/15 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
            {count}
          </span>
        </div>
        <span
          className={`text-text-secondary text-sm transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          ▾
        </span>
      </button>

      {/* Scrollable content — each section independent */}
      {open && (
        <div
          className="fm-scroll overflow-y-auto px-4 pb-4"
          style={{ maxHeight: "320px" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Preview Card ──────────────────────────────────────────────────────────────

function PreviewCard({
  product,
  label,
}: {
  product: Product | null;
  label: string;
}) {
  if (!product) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative w-full aspect-[3/4] border-2 border-dashed border-base-border rounded-sm flex flex-col items-center justify-center gap-2 bg-base-surface">
          <span className="text-text-secondary/40 text-3xl">
            {label === "Select a Top" ? "👕" : "👖"}
          </span>
          <p className="text-text-secondary/50 text-[10px] tracking-[0.2em] uppercase">
            {label}
          </p>
        </div>
        <p className="text-text-secondary/40 text-[10px] text-center tracking-widest uppercase">
          —
        </p>
      </div>
    );
  }

  const imgSrc =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/images/placeholder.jpg";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden bg-base-surface border border-accent shadow-[0_0_20px_rgba(255,168,56,0.15)]">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 28vw"
          className="object-cover"
        />
      </div>
      <p className="text-text-primary text-xs font-display text-center leading-snug">
        {product.name}
      </p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function OutfitBuilder({ tops, bottoms }: OutfitBuilderProps) {
  const [selectedTop, setSelectedTop] = useState<Product | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<Product | null>(null);
  const [topsOpen, setTopsOpen] = useState(true);
  const [bottomsOpen, setBottomsOpen] = useState(false);

  const verdict =
    selectedTop && selectedBottom
      ? getAIVerdict(selectedTop, selectedBottom)
      : null;

  function handleReset() {
    setSelectedTop(null);
    setSelectedBottom(null);
    setTopsOpen(true);
    setBottomsOpen(false);
  }

  return (
    <>
      {/* Global custom scrollbar for this page to remove Windows white scrollbars */}
      <style>{`
        .fm-scroll::-webkit-scrollbar { width: 4px; }
        .fm-scroll::-webkit-scrollbar-track { background: transparent; }
        .fm-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }
        .fm-scroll::-webkit-scrollbar-thumb:hover { background: #555; }
        .fm-scroll { scrollbar-width: thin; scrollbar-color: #333 transparent; }
      `}</style>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
        {/* ── LEFT PANEL ────────────────────────────────────────────── */}
        <aside className="w-full md:w-[40%] bg-base-surface border-b md:border-b-0 md:border-r border-base-border flex flex-col md:sticky md:top-[73px] md:h-[calc(100vh-73px)]">
          {/* Header */}
          <div className="px-4 py-4 border-b border-base-border shrink-0">
            <p className="text-[10px] tracking-[0.25em] uppercase text-accent font-bold">
              Build Your Look
            </p>
          </div>

          {/* Accordions — scrollable */}
          <div className="flex-1 flex flex-col">
          {/* TOPS */}
          <AccordionSection
            title="Tops"
            count={tops.length}
            open={topsOpen}
            onToggle={() => setTopsOpen((p) => !p)}
          >
            <div className="grid grid-cols-2 gap-3 mt-1">
              {tops.length === 0 ? (
                <p className="col-span-2 text-text-secondary/50 text-xs text-center py-4">
                  No tops available.
                </p>
              ) : (
                tops.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selected={selectedTop?.id === product.id}
                    onClick={() =>
                      setSelectedTop((prev) =>
                        prev?.id === product.id ? null : product
                      )
                    }
                  />
                ))
              )}
            </div>
          </AccordionSection>

          {/* BOTTOMS */}
          <AccordionSection
            title="Bottoms"
            count={bottoms.length}
            open={bottomsOpen}
            onToggle={() => setBottomsOpen((p) => !p)}
          >
            <div className="grid grid-cols-2 gap-3 mt-1">
              {bottoms.length === 0 ? (
                <p className="col-span-2 text-text-secondary/50 text-xs text-center py-4">
                  No bottoms available.
                </p>
              ) : (
                bottoms.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selected={selectedBottom?.id === product.id}
                    onClick={() =>
                      setSelectedBottom((prev) =>
                        prev?.id === product.id ? null : product
                      )
                    }
                  />
                ))
              )}
            </div>
          </AccordionSection>
        </div>

        {/* Sticky Summary Bar */}
        <div className="sticky bottom-0 border-t border-base-border bg-base-surface px-4 py-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-text-secondary/60 mb-1">
            Selected
          </p>
          <p className="text-xs text-text-primary font-display leading-snug">
            <span className={selectedTop ? "text-accent" : "text-text-secondary/40"}>
              {selectedTop ? selectedTop.name : "— Top"}
            </span>
            <span className="text-text-secondary/40 mx-2">+</span>
            <span className={selectedBottom ? "text-accent" : "text-text-secondary/40"}>
              {selectedBottom ? selectedBottom.name : "— Bottom"}
            </span>
          </p>
        </div>
      </aside>

      {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
      <main className="w-full md:w-[60%] bg-base-bg overflow-y-auto fm-scroll">
        <div className="px-4 md:px-8 py-8 flex flex-col gap-8 max-w-2xl mx-auto">

          {/* Section label */}
          <p className="text-[10px] tracking-[0.25em] uppercase text-accent font-bold">
            Your Look
          </p>

          {/* Unified Outfit Preview Card */}
          <div className="relative w-full max-w-xs mx-auto rounded-sm overflow-hidden border border-base-border bg-base-surface shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            {/* TOP half */}
            <div className="relative w-full aspect-square bg-base-bg overflow-hidden">
              {selectedTop ? (
                <Image
                  src={selectedTop.images?.[0] ?? "/images/placeholder.jpg"}
                  alt={selectedTop.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 380px"
                  className="object-contain object-bottom"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 border-b border-dashed border-base-border">
                  <span className="text-4xl opacity-20">👕</span>
                  <p className="text-text-secondary/40 text-[10px] tracking-[0.2em] uppercase">Select a Top</p>
                </div>
              )}
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold">TOP</span>
                {selectedTop && <span className="text-[9px] text-accent/80 font-bold uppercase tracking-widest truncate max-w-[180px]">{selectedTop.name}</span>}
              </div>
            </div>

            {/* Seamless divider line */}
            <div className="w-full h-[1px] bg-base-border" />

            {/* BOTTOM half */}
            <div className="relative w-full aspect-square bg-base-bg overflow-hidden">
              {selectedBottom ? (
                <Image
                  src={selectedBottom.images?.[0] ?? "/images/placeholder.jpg"}
                  alt={selectedBottom.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 380px"
                  className="object-contain object-top"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <span className="text-4xl opacity-20">👖</span>
                  <p className="text-text-secondary/40 text-[10px] tracking-[0.2em] uppercase">Select a Bottom</p>
                </div>
              )}
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold">BOTTOM</span>
                {selectedBottom && <span className="text-[9px] text-accent/80 font-bold uppercase tracking-widest truncate max-w-[180px]">{selectedBottom.name}</span>}
              </div>
            </div>

            {/* Accent glow border when both selected */}
            {selectedTop && selectedBottom && (
              <div className="absolute inset-0 pointer-events-none rounded-sm border border-accent shadow-[inset_0_0_30px_rgba(255,168,56,0.05)]" />
            )}
          </div>

          {/* AI STYLE ADVISOR */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-accent font-bold">
              AI Style Advisor
            </p>

            {/* Chat bubble card */}
            <div className="bg-base-surface border border-base-border rounded-sm p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="shrink-0 w-9 h-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-lg">
                  ⚡
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  {!selectedTop && !selectedBottom && (
                    <p className="text-text-secondary text-sm leading-relaxed">
                      Select your top and bottom to get a style verdict.
                    </p>
                  )}
                  {selectedTop && !selectedBottom && (
                    <p className="text-text-secondary text-sm leading-relaxed">
                      <span className="text-accent font-bold">
                        {selectedTop.name}
                      </span>{" "}
                      is locked in. Select your bottom to complete the look.
                    </p>
                  )}
                  {!selectedTop && selectedBottom && (
                    <p className="text-text-secondary text-sm leading-relaxed">
                      <span className="text-accent font-bold">
                        {selectedBottom.name}
                      </span>{" "}
                      is locked in. Select your top to complete the look.
                    </p>
                  )}
                  {verdict && (
                    <p className="text-text-primary text-sm leading-relaxed">
                      {verdict}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={handleReset}
                  className="text-[11px] tracking-[0.15em] uppercase border border-base-border text-text-secondary hover:border-text-secondary hover:text-text-primary transition-colors px-4 py-2 rounded-sm"
                >
                  Generate New Look
                </button>

                {selectedTop && selectedBottom && (
                  <Link
                    href={`/product/${selectedTop.id}`}
                    className="text-[11px] tracking-[0.15em] uppercase bg-accent text-base-bg font-bold px-4 py-2 rounded-sm hover:bg-accent-dim transition-colors shadow-[0_0_15px_rgba(255,168,56,0.2)] hover:shadow-[0_0_22px_rgba(255,168,56,0.35)]"
                  >
                    Shop This Outfit
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
