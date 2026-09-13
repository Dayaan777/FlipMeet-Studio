"use client";

import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/cart-store";
import { drops } from "@/data/drops";

export default function CartPage() {
  const { items, removeItem, clear } = useCartStore();

  const drop = drops[0];

  const total = items.reduce((sum, item) => sum + (item.price || 18500) * item.quantity, 0);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg px-4 sm:px-6 pt-32 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 border-b border-base-border pb-6 flex items-center justify-between">
            <div>
              <p className="text-accent text-[10px] tracking-[0.28em] uppercase font-bold">
                DROP 001 // SECURE YOUR CUT
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
              <p className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Your bag is empty
              </p>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                Explore the six limited chapters of Drop 001 and select your size before the window closes.
              </p>
              <Link
                href="/drop/drop-001"
                className="mt-6 inline-block rounded-sm bg-accent px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors"
              >
                EXPLORE DROP 001
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Item List */}
              <div className="md:col-span-2 space-y-4">
                {items.map((item, idx) => {
                  const look = drop.looks.find((l) => l.id === item.lookId);
                  const img = look?.images[0] || "/images/looks/look-01.jpg";
                  const price = item.price || 18500;

                  return (
                    <div
                      key={`${item.lookId}-${item.size}-${idx}`}
                      className="flex items-center justify-between gap-4 rounded-sm border border-base-border bg-base-surface/70 p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative size-16 sm:size-20 rounded-sm border border-base-border bg-base-bg overflow-hidden shrink-0">
                          <Image src={img} alt={item.name} fill className="object-contain" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary">
                            {item.name}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Size: <strong className="text-text-primary">{item.size}</strong> • Qty: {item.quantity}
                          </p>
                          <p className="text-[10px] text-accent tracking-widest uppercase mt-1">
                            Limited Drop 001 Run (100 pieces)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-sm sm:text-base font-bold text-text-primary">
                          PKR {(price * item.quantity).toLocaleString()}
                        </p>
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

              {/* Order Summary & Checkout CTA */}
              <div className="rounded-sm border border-base-border bg-base-surface/80 p-6 h-fit backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">
                  ORDER SUMMARY
                </p>

                <div className="space-y-3 text-xs border-b border-base-border pb-4">
                  <div className="flex justify-between text-text-secondary">
                    <span>Items Subtotal</span>
                    <span className="font-display text-text-primary font-bold">
                      PKR {total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Courier Delivery (Pakistan)</span>
                    <span className="text-emerald-400 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Est. Delivery</span>
                    <span className="text-text-primary">20–30 Oct 2026</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-primary">
                    Total
                  </span>
                  <span className="font-display text-xl font-bold text-accent">
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
