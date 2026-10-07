"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { DARK_BLUR_DATA_URL } from "@/lib/image-placeholder";

// ── Types ─────────────────────────────────────────────────────────────────

type SizeVariant = {
  size: string;
  stock: number;
  isDefault?: boolean;
};

type AnimeProduct = {
  id: string;
  name: string;
  price: number;
  old_price?: number;
  images: string[];
  category: string;
  sizeVariants?: SizeVariant[];
};

// ── Bundle definitions (5 outfits) ────────────────────────────────────────

const BUNDLE_ITEMS: {
  topId: string;
  bottomId: string;
  topName: string;
  bottomName: string;
  topImg: string;
  bottomImg: string;
}[] = [
  {
    topId: "anime-luffy-blue-jersey",
    bottomId: "anime-luffy-blue-outfit",
    topName: "Luffy Blue Jersey",
    bottomName: "Light Blue Cargo Denim",
    topImg: "/images/products/anime-luffy-blue-jersey.png",
    bottomImg: "/images/products/anime-luffy-blue-outfit.png",
  },
  {
    topId: "anime-gojo-jersey",
    bottomId: "anime-gojo-outfit",
    topName: "Gojo Jersey",
    bottomName: "Black Cargos",
    topImg: "/images/products/anime-gojo-jersey.png",
    bottomImg: "/images/products/anime-gojo-outfit.png",
  },
  {
    topId: "anime-robin-purple-jersey",
    bottomId: "anime-robin-purple-outfit",
    topName: "Robin Purple Jersey",
    bottomName: "White Wide-Leg Pants",
    topImg: "/images/products/anime-robin-purple-jersey.png",
    bottomImg: "/images/products/anime-robin-purple-outfit.png",
  },
  {
    topId: "anime-zoro-green-jersey",
    bottomId: "anime-zoro-green-outfit",
    topName: "Zoro Green Jersey",
    bottomName: "Green Track Pants",
    topImg: "/images/products/anime-zoro-green-jersey.png",
    bottomImg: "/images/products/anime-zoro-green-outfit.png",
  },
  {
    topId: "anime-op-flame-jersey",
    bottomId: "anime-op-flame-outfit",
    topName: "OP Flame Jersey",
    bottomName: "Black Track Pants",
    topImg: "/images/products/anime-op-flame-jersey.png",
    bottomImg: "/images/products/anime-op-flame-outfit.png",
  },
];

const TOP_SIZES = ["S", "M", "L", "XL"];
const WAIST_SIZES = ["28", "30", "32", "34", "36"];

// ── Sub-components ────────────────────────────────────────────────────────

function SizePill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-colors ${
        selected
          ? "border-accent bg-accent/15 text-accent"
          : "border-base-border text-text-secondary hover:border-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}

/** One row in the "different sizes" popup step */
function BundleRow({
  item,
  topSize,
  waistSize,
  onTopSize,
  onWaistSize,
  idx,
}: {
  item: (typeof BUNDLE_ITEMS)[0];
  topSize: string;
  waistSize: string;
  onTopSize: (s: string) => void;
  onWaistSize: (s: string) => void;
  idx: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-sm border border-base-border bg-base-surface/50 p-3">
      {/* Images */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative w-10 h-10 rounded-sm border border-base-border bg-base-bg overflow-hidden">
          <Image
            src={item.topImg}
            alt={item.topName}
            fill
            sizes="40px"
            className="object-contain object-bottom"
          />
        </div>
        <div className="relative w-10 h-10 rounded-sm border border-base-border bg-base-bg overflow-hidden">
          <Image
            src={item.bottomImg}
            alt={item.bottomName}
            fill
            sizes="40px"
            className="object-contain object-bottom"
          />
        </div>
        <div className="min-w-0 hidden sm:block">
          <p className="text-[10px] font-bold text-text-primary truncate">
            Outfit {idx + 1}
          </p>
          <p className="text-[9px] text-text-secondary truncate">
            {item.topName}
          </p>
        </div>
      </div>

      <p className="text-[10px] font-bold text-text-primary sm:hidden">
        Outfit {idx + 1} — {item.topName}
      </p>

      {/* Size selectors */}
      <div className="flex flex-1 flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
        <div className="flex flex-col gap-1">
          <p className="text-[9px] uppercase tracking-widest text-text-secondary">
            Top Size
          </p>
          <div className="flex gap-1">
            {TOP_SIZES.map((sz) => (
              <SizePill
                key={sz}
                label={sz}
                selected={topSize === sz}
                onClick={() => onTopSize(sz)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[9px] uppercase tracking-widest text-text-secondary">
            Waist
          </p>
          <div className="flex gap-1 flex-wrap">
            {WAIST_SIZES.map((sz) => (
              <SizePill
                key={sz}
                label={`${sz}"`}
                selected={waistSize === sz}
                onClick={() => onWaistSize(sz)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Individual product "Add to Cart" card (unchanged from original) */
function IndividualCard({
  product,
  waist = false,
}: {
  product: AnimeProduct;
  waist?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState(
    product.sizeVariants?.find((v) => v.isDefault && v.stock > 0)?.size ||
      product.sizeVariants?.find((v) => v.stock > 0)?.size ||
      "M"
  );
  const [selectedWaist, setSelectedWaist] = useState("30");
  const [added, setAdded] = useState(false);

  const availableSizes =
    product.sizeVariants && product.sizeVariants.length > 0
      ? product.sizeVariants.filter((v) => v.stock > 0).map((v) => v.size)
      : TOP_SIZES;

  const img = product.images?.[0] || "/images/products/stwd-shirt.png";

  const handleAdd = () => {
    const size = waist ? `${selectedSize} / ${selectedWaist}` : selectedSize;
    addItem({
      lookId: product.id,
      name: product.name,
      size,
      price: product.price,
      oldPrice: product.old_price,
      quantity: 1,
      image: img,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="rounded-sm border border-base-border bg-base-surface/60 p-3 flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-sm border border-base-border bg-base-bg shrink-0 overflow-hidden">
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="56px"
            className="object-contain object-bottom"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-text-primary text-[11px] font-bold tracking-widest truncate">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-accent text-[11px] font-bold">
              PKR {product.price.toLocaleString()}
            </p>
            {product.old_price && product.old_price > product.price && (
              <p className="text-[10px] text-text-secondary line-through">
                PKR {product.old_price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {availableSizes.map((sz) => (
          <SizePill
            key={sz}
            label={sz}
            selected={selectedSize === sz}
            onClick={() => setSelectedSize(sz)}
          />
        ))}
      </div>

      {waist && (
        <div>
          <p className="text-[9px] uppercase tracking-widest text-text-secondary mb-1">
            Waist
          </p>
          <div className="flex flex-wrap gap-1.5">
            {WAIST_SIZES.map((sz) => (
              <SizePill
                key={sz}
                label={`${sz}"`}
                selected={selectedWaist === sz}
                onClick={() => setSelectedWaist(sz)}
              />
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm bg-accent hover:bg-accent-dim text-base-bg transition-colors"
      >
        {added ? "✓ ADDED" : "ADD TO CART"}
      </button>
    </div>
  );
}

// ── Buy Bundle Popup ──────────────────────────────────────────────────────

function BuyBundlePopup({
  bundleProduct,
  onClose,
}: {
  bundleProduct: { id: string; name: string; price: number; images?: string[] } | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [step, setStep] = useState<1 | 2>(1);
  const [sizeMode, setSizeMode] = useState<"same" | "different" | null>(null);

  // Same-size state
  const [sameTopSize, setSameTopSize] = useState("");
  const [sameWaist, setSameWaist] = useState("");

  // Different-size state
  const [topSizes, setTopSizes] = useState<string[]>(["", "", "", "", ""]);
  const [waistSizes, setWaistSizes] = useState<string[]>(["", "", "", "", ""]);

  const canContinue =
    sizeMode === "same"
      ? sameTopSize !== "" && sameWaist !== ""
      : sizeMode === "different"
      ? topSizes.every((s) => s !== "") && waistSizes.every((s) => s !== "")
      : false;

  const bundlePrice = bundleProduct?.price ?? 14995;

  const handleBuyBundle = () => {
    if (!canContinue) return;
    const sizes =
      sizeMode === "same"
        ? BUNDLE_ITEMS.map((item) => ({
            outfitName: item.topName,
            topSize: sameTopSize,
            waist: sameWaist,
          }))
        : BUNDLE_ITEMS.map((item, i) => ({
            outfitName: item.topName,
            topSize: topSizes[i],
            waist: waistSizes[i],
          }));

    addItem({
      lookId: bundleProduct?.id || "anime-bundle-5-outfits",
      name: bundleProduct?.name || "ANIME PACK 5 IN 1",
      size:
        sizeMode === "same"
          ? `${sameTopSize} / ${sameWaist}"`
          : "Multiple sizes",
      price: bundlePrice,
      isBundle: true,
      bundleSizes: sizes,
      quantity: 1,
      image: bundleProduct?.images?.[0] || "/images/anime-bundle.png",
      category: "Bundles",
    });

    onClose();
    router.push("/checkout");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-2xl bg-base-surface border border-base-border rounded-t-xl md:rounded-sm shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        {/* ── Step 1: Choose mode ── */}
        {step === 1 && (
          <div>
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-text-primary mb-6">
              How would you like to order?
            </h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setSizeMode("same");
                  setStep(2);
                }}
                className="flex flex-col gap-1 rounded-sm border border-base-border bg-base-bg hover:border-accent p-5 text-left transition-colors"
              >
                <span className="text-sm font-bold uppercase tracking-widest text-text-primary">
                  Same size for all 5 outfits
                </span>
                <span className="text-[10px] text-accent font-bold">
                  Quickest
                </span>
              </button>
              <button
                onClick={() => {
                  setSizeMode("different");
                  setStep(2);
                }}
                className="flex flex-col gap-1 rounded-sm border border-base-border bg-base-bg hover:border-accent p-5 text-left transition-colors"
              >
                <span className="text-sm font-bold uppercase tracking-widest text-text-primary">
                  Different size for each outfit
                </span>
                <span className="text-[10px] text-text-secondary">
                  Customise each of the 5 pieces individually
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Choose sizes ── */}
        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary mb-5 transition-colors"
            >
              ← Back
            </button>

            {sizeMode === "same" && (
              <div className="space-y-5">
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-text-primary">
                  Choose one size for all 5 outfits
                </h3>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
                    Top Size
                  </p>
                  <div className="flex gap-2">
                    {TOP_SIZES.map((sz) => (
                      <SizePill
                        key={sz}
                        label={sz}
                        selected={sameTopSize === sz}
                        onClick={() => setSameTopSize(sz)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">
                    Waist Size
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {WAIST_SIZES.map((sz) => (
                      <SizePill
                        key={sz}
                        label={`${sz}"`}
                        selected={sameWaist === sz}
                        onClick={() => setSameWaist(sz)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {sizeMode === "different" && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-text-primary mb-4">
                  Choose a size for each outfit
                </h3>
                {BUNDLE_ITEMS.map((item, i) => (
                  <BundleRow
                    key={item.topId}
                    item={item}
                    idx={i}
                    topSize={topSizes[i]}
                    waistSize={waistSizes[i]}
                    onTopSize={(s) =>
                      setTopSizes((prev) =>
                        prev.map((v, j) => (j === i ? s : v))
                      )
                    }
                    onWaistSize={(s) =>
                      setWaistSizes((prev) =>
                        prev.map((v, j) => (j === i ? s : v))
                      )
                    }
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleBuyBundle}
              disabled={!canContinue}
              className={`mt-6 w-full py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all duration-200 ${
                canContinue
                  ? "bg-accent hover:bg-accent-dim text-base-bg shadow-[0_0_20px_rgba(255,168,56,0.25)]"
                  : "bg-base-surface border border-base-border text-text-secondary/50 cursor-not-allowed"
              }`}
            >
              {canContinue ? "Continue to Checkout →" : "Select all sizes to continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function AnimeBundle() {
  const [bundleProduct, setBundleProduct] = useState<{
    id: string;
    name: string;
    price: number;
    old_price?: number;
    images: string[];
  } | null>(null);
  const [individualProducts, setIndividualProducts] = useState<AnimeProduct[]>(
    []
  );
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [showPopup, setShowPopup] = useState(false);
  const [showIndividual, setShowIndividual] = useState(false);

  // Fetch bundle + individual products from server
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/anime-products");
        if (res.ok) {
          const data = await res.json();
          if (data.bundle) setBundleProduct(data.bundle);
          if (data.products) setIndividualProducts(data.products);
        }
      } catch {
        // silent fallback — hardcoded prices used via bundlePrice below
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchData();
  }, []);

  const bundlePrice = bundleProduct?.price ?? 14995;
  const bundleOldPrice = bundleProduct?.old_price;
  const savings =
    bundleOldPrice && bundleOldPrice > bundlePrice
      ? bundleOldPrice - bundlePrice
      : null;

  const jerseys = individualProducts.filter(
    (p) =>
      (p.category && p.category.includes("Jerseys")) && BUNDLE_ITEMS.some((b) => b.topId === p.id)
  );
  const outfits = individualProducts.filter(
    (p) =>
      (p.category && p.category.includes("Outfits")) &&
      BUNDLE_ITEMS.some((b) => b.bottomId === p.id)
  );

  return (
    <div className="w-full">
      {/* ── Top Row: Text and Image ── */}
      <div className="flex flex-col md:flex-row md:items-start gap-8 lg:gap-12">
        {/* LEFT: Text column */}
        <div className="w-full md:w-[40%] flex flex-col gap-5 shrink-0 ">
          {/* Label */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
              LIMITED BUNDLE
            </span>
          </div>

          {/* Title */}
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-widest text-text-primary leading-none">
              ANIME PACK
            </h2>
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-widest text-accent leading-none">
              5 IN 1
            </h2>
          </div>

          {/* Description */}
          <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
            5 complete outfits (jersey + pants) in one order.
          </p>

          {/* Price block */}
          {loadingProducts ? (
            <div className="h-10 w-48 bg-base-surface/60 rounded-sm animate-pulse" />
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-display text-3xl font-bold text-accent">
                PKR {bundlePrice.toLocaleString()}
              </p>
              {bundleOldPrice && bundleOldPrice > bundlePrice && (
                <p className="text-base text-text-secondary line-through">
                  PKR {bundleOldPrice.toLocaleString()}
                </p>
              )}
              {savings && (
                <span className="rounded-sm bg-accent/10 border border-accent/30 px-2.5 py-1 text-[10px] font-bold text-accent uppercase tracking-widest">
                  SAVE PKR {savings.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Shipping line */}
          <p className="text-[10px] text-text-secondary">
            5 outfits · Ships together
          </p>
        </div>

        {/* RIGHT: Image column (Swipeable on mobile) */}
        <div className="w-full md:w-[60%] flex-1 relative ">
          <div className="overflow-x-auto no-scrollbar w-full relative group">
            {/* Mobile swipe hint */}
            <div className="absolute right-4 top-4 bg-black/70 text-white text-[10px] px-3 py-1.5 rounded-full md:hidden pointer-events-none z-10 font-bold tracking-widest">
              SWIPE ↔
            </div>
            
            <div className="relative min-w-[600px] md:min-w-0 w-full h-[340px] md:h-[400px]">
              <Image
                src={bundleProduct?.images?.[0] || "/images/anime-bundle.png"}
                alt="Anime Pack – 5 Outfits"
                fill
                sizes="(min-width: 768px) 60vw, 600px"
                className="object-contain object-left md:object-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA Buttons Row (Below both) ── */}
      <div className="flex flex-col gap-3 w-full mt-8">
        {bundleProduct && bundlePrice > 0 ? (
          <button
            type="button"
            onClick={() => setShowPopup(true)}
            className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-sm bg-accent hover:bg-accent-dim text-base-bg transition-all duration-200 shadow-[0_0_20px_rgba(255,168,56,0.25)] hover:shadow-[0_0_32px_rgba(255,168,56,0.4)]"
          >
            BUY BUNDLE →
          </button>
        ) : (
          !loadingProducts && (
            <p className="text-sm text-text-secondary font-bold uppercase tracking-widest py-4 text-center">
              SOLD OUT
            </p>
          )
        )}

        <button
          type="button"
          onClick={() => setShowIndividual((v) => !v)}
          className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] rounded-sm border border-base-border text-text-primary hover:border-accent hover:text-accent transition-all duration-200"
        >
          {showIndividual ? "HIDE INDIVIDUAL" : "BUY INDIVIDUALLY"}
        </button>
      </div>

      {/* ── Individual products (revealed below on "BUY INDIVIDUALLY") ── */}
      {showIndividual && (
        <div className="mt-10 pt-8 border-t border-base-border">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent mb-6">
            Individual Pieces
          </p>
          {loadingProducts ? (
            <p className="text-text-secondary text-xs py-8 text-center">
              Loading products...
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {jerseys.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-3">
                    Jerseys
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {jerseys.map((p) => (
                      <IndividualCard key={p.id} product={p} waist={false} />
                    ))}
                  </div>
                </div>
              )}
              {outfits.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-3">
                    Full Outfits
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {outfits.map((p) => (
                      <IndividualCard key={p.id} product={p} waist={true} />
                    ))}
                  </div>
                </div>
              )}
              {jerseys.length === 0 && outfits.length === 0 && (
                <p className="text-text-secondary text-xs py-8 text-center">
                  No individual products found.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Buy Bundle Popup ── */}
      {showPopup && (
        <BuyBundlePopup
          bundleProduct={bundleProduct}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
