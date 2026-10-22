import Image from "next/image";
import Link from "next/link";
import {
  WallType,
  FRAMES,
  getProductWallType,
  getProductAccent,
  getProductVariant,
  getProductImageStyle,
} from "@/lib/brick-card-config";
import { DARK_BLUR_DATA_URL } from "@/lib/image-placeholder";

export interface BrickCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  setId?: string | null;
  priority?: boolean;
  type?: WallType;
  accent?: string;
  discountedPrice?: number;
  hasDiscount?: boolean;
  referralDiscountPct?: number;
}

export default function BrickCard({
  id,
  name,
  category,
  price,
  oldPrice,
  image,
  setId,
  priority = false,
  type,
  accent,
  discountedPrice,
  hasDiscount = false,
  referralDiscountPct,
}: BrickCardProps) {
  const wallType: WallType = type || getProductWallType(id, category);
  const cardAccent = accent || getProductAccent(setId);
  const { variant, isFlipped } = getProductVariant(id);
  const frame = FRAMES[wallType];

  // Insets compensation style so visible garment sits on floor line
  const productImgStyle = getProductImageStyle(id, wallType);

  // Clean category display (strips "All, " if present)
  const cleanCategory = category
    .split(/[,/]+/)
    .map((s) => s.trim())
    .filter((s) => s.toLowerCase() !== "all")
    .join(" / ") || "COLLECTION";

  return (
    <Link
      href={`/product/${id}`}
      className="group relative flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm select-none transition-transform duration-300 ease-out"
      aria-label={`View ${name}`}
    >
      {/* ── Brick Wall Frame Hole ── */}
      <div
        className={`brick-card ${isFlipped ? "is-flipped" : ""}`}
        data-type={wallType}
        style={
          {
            "--accent": cardAccent,
            "--bc-ratio": frame.ratio,
            "--slot-l": `${frame.slot.left}%`,
            "--slot-t": `${frame.slot.top}%`,
            "--slot-w": `${frame.slot.width}%`,
            "--slot-h": `${frame.slot.height}%`,
          } as React.CSSProperties
        }
      >
        {/* Layer 1: Back wall hole & bricks */}
        <div className="bc-layer bc-back">
          <Image
            src={`/brick-frames/${wallType}-${variant}-back.webp`}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain"
            priority={priority}
            aria-hidden
          />
        </div>

        {/* Layer 2: Ambient series accent glow clipped by hole mask */}
        <div
          className="bc-layer bc-glow"
          style={{
            maskImage: `url(/brick-frames/${wallType}-${variant}-mask.png)`,
            WebkitMaskImage: `url(/brick-frames/${wallType}-${variant}-mask.png)`,
          }}
          aria-hidden
        />

        {/* Layer 3: Product Cutout with insets compensation */}
        <div className="bc-slot">
          <div className="bc-product">
            <div style={productImgStyle}>
              <Image
                src={image}
                alt={`${name} cutout`}
                fill
                priority={priority}
                placeholder="blur"
                blurDataURL={DARK_BLUR_DATA_URL}
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-contain object-bottom pointer-events-none select-none"
              />
            </div>
          </div>
        </div>

        {/* Layer 4: Front rubble chunks overlapping garment feet */}
        <div className="bc-layer bc-front">
          <Image
            src={`/brick-frames/${wallType}-${variant}-front.webp`}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain"
            priority={priority}
            aria-hidden
          />
        </div>
      </div>

      {/* ── Product Info Below Frame (clean on concrete wall) ── */}
      <div className="mt-3.5 px-2 flex flex-col items-center text-center">
        {/* Category Label */}
        <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-[0.24em] text-text-secondary/80">
          {cleanCategory}
        </span>

        {/* Product Title */}
        <h3 className="mt-1 font-display text-sm sm:text-base font-bold uppercase tracking-wider text-text-primary transition-colors group-hover:text-accent line-clamp-1">
          {name}
        </h3>

        {/* Price display with referral discount awareness */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {hasDiscount && discountedPrice ? (
            <>
              <span className="font-sans text-xs sm:text-sm font-bold tracking-wide text-accent whitespace-nowrap">
                PKR {discountedPrice.toLocaleString()}
              </span>
              <span className="text-[10px] text-text-secondary/60 line-through whitespace-nowrap">
                PKR {Number(price).toLocaleString()}
              </span>
              {referralDiscountPct && (
                <span className="text-[7.5px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded-xs whitespace-nowrap">
                  SAVE {referralDiscountPct}%
                </span>
              )}
            </>
          ) : (
            <>
              <span className="font-sans text-xs sm:text-sm font-bold tracking-wide text-accent whitespace-nowrap">
                PKR {Number(price).toLocaleString()}
              </span>
              {oldPrice && oldPrice > price && (
                <span className="text-[10px] text-text-secondary/60 line-through whitespace-nowrap">
                  PKR {Number(oldPrice).toLocaleString()}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
