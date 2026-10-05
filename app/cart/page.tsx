"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/cart-store";

// ---------------------------------------------------------------------------
// Bundle collapsible sub-list
// ---------------------------------------------------------------------------
function BundleIncludesList({
  bundleSizes,
}: {
  bundleSizes: Array<{ outfitName: string; topSize: string; waist: string }>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-accent font-bold hover:text-accent-dim transition-colors"
      >
        Includes {open ? "▴" : "▾"}
      </button>
      {open && (
        <ul className="mt-2 space-y-1 pl-3 border-l border-base-border">
          {bundleSizes.map((bs, i) => (
            <li key={i} className="text-[10px] text-text-secondary leading-relaxed">
              <span className="text-text-primary font-semibold">{bs.outfitName}</span>
              {" "}&mdash; Top: <strong className="text-text-primary">{bs.topSize}</strong> / Waist:{" "}
              <strong className="text-text-primary">{bs.waist}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CartPage() {
  const {
    items,
    removeItem,
    clear,
    referralCode,
    referralDiscountPct,
    referralCategories,
    clearReferral,
  } = useCartStore();

  // ── Price computation ──────────────────────────────────────────────────────
  const isAllCategories =
    !referralCategories ||
    referralCategories.length === 0 ||
    referralCategories.includes("All categories");

  function itemDiscountedPrice(price: number, category?: string): number {
    if (!referralCode || !referralDiscountPct) return price;
    const eligible =
      isAllCategories || (category && referralCategories!.includes(category));
    if (!eligible) return price;
    return Math.round(price * (1 - referralDiscountPct / 100));
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 18500) * item.quantity,
    0
  );

  const discountedSubtotal = items.reduce((sum, item) => {
    const base = item.price || 18500;
    const discounted = itemDiscountedPrice(base, item.category);
    return sum + discounted * item.quantity;
  }, 0);

  const discountAmount = Math.round(subtotal - discountedSubtotal);
  const total = discountedSubtotal;

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg px-4 sm:px-6 pt-32 pb-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 border-b border-base-border pb-6 flex items-center justify-between">
            <div>
              <p className="text-accent text-[10px] tracking-[0.28em] uppercase font-bold">
                SECURE YOUR CUT
              </p>
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary mt-1">
                BAG ({items.length})
              </h1>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-xs text-text-secondary hover:text-accent tracking-widest uppercase transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-sm border border-base-border bg-base-surface/50 p-12 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-text-primary">
                Your bag is empty
              </p>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                Explore the six limited chapters and select your size before the window closes.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-sm bg-accent px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors"
              >
                EXPLORE SHOP
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* ── Item List ──────────────────────────────────────────────── */}
              <div className="md:col-span-2 space-y-4">
                {/* Referral banner */}
                {referralCode && (referralDiscountPct || 0) > 0 && (
                  <div className="flex items-center justify-between gap-3 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs">
                    <p className="text-emerald-400">
                      <span className="font-bold">Code {referralCode.toUpperCase()}</span> applied
                      {" "}— {referralDiscountPct}% off{" "}
                      {isAllCategories
                        ? "all items"
                        : (referralCategories ?? []).join(", ")}
                    </p>
                    <button
                      type="button"
                      onClick={clearReferral}
                      className="text-text-secondary hover:text-red-400 transition-colors text-xs font-bold"
                      aria-label="Remove referral code"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {items.map((item, idx) => {
                  const img = item.image || "/images/products/stwd-shirt.png";
                  const basePrice = item.price || 18500;
                  const discountedPrice = itemDiscountedPrice(
                    basePrice,
                    item.category
                  );
                  const hasDiscount = discountedPrice < basePrice;

                  return (
                    <div
                      key={`${item.lookId}-${item.size}-${idx}`}
                      className="flex items-start justify-between gap-4 rounded-sm border border-base-border bg-base-surface/70 p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="relative size-16 sm:size-20 rounded-sm border border-base-border bg-base-bg overflow-hidden shrink-0">
                          <Image
                            src={img}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 64px, 80px"
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-primary">
                            {item.name}
                          </p>
                          {item.isBundle ? (
                            <>
                              <p className="text-[10px] text-accent tracking-widest uppercase mt-0.5">
                                BUNDLE — QTY 1
                              </p>
                              {item.bundleSizes && item.bundleSizes.length > 0 && (
                                <BundleIncludesList bundleSizes={item.bundleSizes} />
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-text-secondary">
                                Size:{" "}
                                <strong className="text-text-primary">
                                  {item.size}
                                </strong>{" "}
                                • Qty: {item.quantity}
                              </p>
                              <p className="text-[10px] text-accent tracking-widest uppercase mt-1">
                                Limited Run (100 pieces)
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {hasDiscount ? (
                          <>
                            <p className="font-display text-sm sm:text-base font-bold text-emerald-400 tracking-widest">
                              PKR{" "}
                              {(discountedPrice * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-text-secondary line-through">
                              PKR {(basePrice * item.quantity).toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 justify-end">
                            <p className="font-display text-sm sm:text-base font-bold text-text-primary tracking-widest">
                              PKR {(basePrice * item.quantity).toLocaleString()}
                            </p>
                            {item.oldPrice && item.oldPrice > basePrice && (
                              <p className="text-[10px] text-text-secondary line-through">
                                PKR{" "}
                                {(item.oldPrice * item.quantity).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeItem(item.lookId, item.size)}
                          className="mt-2 text-[10px] uppercase tracking-widest text-text-secondary hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Order Summary & Checkout CTA ───────────────────────────── */}
              <div className="rounded-sm border border-base-border bg-base-surface/80 p-6 h-fit backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">
                  ORDER SUMMARY
                </p>

                <div className="space-y-3 text-xs border-b border-base-border pb-4">
                  <div className="flex justify-between text-text-secondary">
                    <span>Items Subtotal</span>
                    <span className="font-display text-text-primary font-bold tracking-widest">
                      PKR {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {referralCode && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>
                        Code {referralCode.toUpperCase()} (−{referralDiscountPct}%)
                      </span>
                      <span className="font-bold">
                        &minus; PKR {discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-text-secondary">
                    <span>Est. Delivery</span>
                    <span className="text-text-primary">20–30 Oct 2026</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-primary">
                    Total
                  </span>
                  <span className="font-display text-xl font-bold text-accent tracking-widest">
                    PKR {total.toLocaleString()}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full rounded-sm bg-accent py-3.5 text-center text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors"
                >
                  PROCEED TO CHECKOUT →
                </Link>

                <p className="text-[10px] text-center text-text-secondary mt-3">
                  Order confirmation receipt sent directly to your email.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
