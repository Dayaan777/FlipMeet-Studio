"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/cart-store";
import { useOrderStore, Order } from "@/lib/order-store";
import { supabase } from "@/lib/supabase";
import { drops } from "@/data/drops";

// ---------------------------------------------------------------------------
// Bundle collapsible (reused from cart page pattern)
// ---------------------------------------------------------------------------
function BundleIncludesList({
  bundleSizes,
}: {
  bundleSizes: Array<{ outfitName: string; topSize: string; waist: string }>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-accent hover:text-accent-dim transition-colors font-bold"
      >
        Includes {open ? "▴" : "▾"}
      </button>
      {open && (
        <ul className="mt-1.5 space-y-1 pl-3 border-l border-base-border">
          {bundleSizes.map((bs, i) => (
            <li key={i} className="text-[9px] text-text-secondary leading-relaxed">
              <span className="text-text-primary font-semibold">{bs.outfitName}</span>{" "}
              — Top: <strong className="text-text-primary">{bs.topSize}</strong> / Waist:{" "}
              <strong className="text-text-primary">{bs.waist}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checkout Page
// ---------------------------------------------------------------------------
export default function CheckoutPage() {
  const {
    items,
    clear,
    referralCode,
    referralDiscountPct,
    referralCategories,
    clearReferral,
  } = useCartStore();
  const { createOrder } = useOrderStore();
  const [clientOrderId] = useState(() => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FM-2026-${timestamp}${random}`;
  });

  const drop = drops[0];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [referralRemovedMsg, setReferralRemovedMsg] = useState("");

  const [province, setProvince] = useState("Sindh");
  const [shippingRates, setShippingRates] = useState<Record<string, number> | null>(null);
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    async function loadRates() {
      try {
        const { data } = await supabase
          .from("products")
          .select("description")
          .eq("id", "system-shipping-rates")
          .single();
        if (data && data.description) {
          try {
            const parsed = JSON.parse(data.description);
            const rates: Record<string, number> = {};
            for (const p in parsed) {
              const rawVal = String(parsed[p]).replace(/[^\d.-]/g, "");
              rates[p] = Number(rawVal) || 0;
            }
            setShippingRates(rates);
          } catch (parseError) {
            console.error("Failed to parse shipping rates JSON:", parseError);
          }
        }
      } catch (e) {
        console.error("Failed to fetch shipping rates:", e);
      }
    }
    loadRates();
  }, []);

  useEffect(() => {
    if (shippingRates) {
      const matchKey = Object.keys(shippingRates).find(
        (k) => k.toLowerCase().trim() === province.toLowerCase().trim()
      );
      if (matchKey && typeof shippingRates[matchKey] === "number") {
        setShippingCost(shippingRates[matchKey]);
      } else {
        setShippingCost(0);
      }
    } else {
      setShippingCost(0);
    }
  }, [province, shippingRates]);

  // ── Price helpers ──────────────────────────────────────────────────────────
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

  const itemsSubtotal = items.reduce(
    (sum, item) => sum + (item.price || 18500) * item.quantity,
    0
  );

  const discountedItemsSubtotal = items.reduce((sum, item) => {
    const base = item.price || 18500;
    return sum + itemDiscountedPrice(base, item.category) * item.quantity;
  }, 0);

  const discountAmount = Math.round(itemsSubtotal - discountedItemsSubtotal);
  const total = Math.round(discountedItemsSubtotal + shippingCost);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPhoneError("");
    setReferralRemovedMsg("");

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      alert("Please fill in all contact and delivery details.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError(
        "Please enter a valid email address (e.g. name@domain.com)."
      );
      return;
    }

    if (!/^\d+$/.test(phone.trim())) {
      setPhoneError(
        "Phone number must contain numbers only (no letters or symbols)."
      );
      return;
    }

    if (phone.trim().length < 8) {
      setPhoneError("Phone number must be at least 8 digits.");
      return;
    }

    setIsSubmitting(true);

    const orderItems = items.map((item) => ({
      lookId: item.lookId,
      product_id: item.lookId,
      name: item.name,
      size: item.size,
      price: item.price || 18500,
      price_at_purchase: item.price || 18500,
      quantity: item.quantity,
      image: item.image || "/images/products/stwd-shirt.png",
      isBundle: item.isBundle ?? false,
      bundleSizes: item.bundleSizes ?? null,
      category: item.category,
    }));

  const calculatedTotal = total > 0 ? total : 18500;

  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        shipping_address: `${province} — ${address.trim()}`,
        notes: notes.trim(),
        total: calculatedTotal,
        items: orderItems,
        referral_code: referralCode || undefined,
        orderId: clientOrderId,
      }),
    });

    const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order.");
      }

      // If server didn't apply the referral code despite us sending one
      if (referralCode && !data.referralApplied) {
        setReferralRemovedMsg(
          "Your code was not valid at checkout and was removed."
        );
        clearReferral();
      }

      const newOrder = createOrder({
        id: data.order?.id,
        customerId: `guest-${Date.now().toString(36)}`,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: `${province} — ${address.trim()}`,
        dropId: "drop-001",
        items: orderItems,
        total: calculatedTotal,
        deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
        notes: notes.trim(),
      });

      clear();
      setCompletedOrder(newOrder);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error placing order.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── SUCCESS CONFIRMATION SCREEN ────────────────────────────────────────────
  if (completedOrder) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-base-bg px-4 sm:px-6 pt-36 pb-24 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-sm border border-base-border bg-base-surface/90 p-6 sm:p-8 text-center backdrop-blur-md">
            <span className="size-12 rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center mx-auto text-xl text-emerald-400 mb-4">
              ✓
            </span>

            <p className="text-accent text-[10px] tracking-[0.28em] uppercase font-bold">
              ORDER CONFIRMED // ALLOCATION RESERVED
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-text-primary mt-1">
              ORDER {completedOrder.id}
            </h1>

            <p className="text-xs text-text-secondary mt-3">
              Your order has been placed and an order receipt is on its way to{" "}
              <span className="text-text-primary font-bold">
                {completedOrder.customerEmail}
              </span>
              . We&apos;ll be in touch before dispatch.
            </p>

            <div className="my-6 rounded-sm border border-base-border bg-base-bg p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-text-secondary">
                <span>Customer</span>
                <span className="text-text-primary font-bold">
                  {completedOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Total Amount</span>
                <span className="text-accent font-bold font-display tracking-widest">
                  PKR {completedOrder.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Delivery Window</span>
                <span className="text-text-primary">20–30 Oct 2026</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/shop"
                className="block w-full rounded-sm bg-accent py-3.5 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors text-center"
              >
                RETURN TO COLLECTION →
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── EMPTY CART CHECK ───────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-base-bg px-6 pt-36 pb-20 flex items-center justify-center">
          <div className="w-full max-w-md text-center rounded-sm border border-base-border bg-base-surface/80 p-8">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-text-primary">
              NO ITEMS IN BAG
            </h1>
            <p className="text-xs text-text-secondary mt-2 mb-6">
              Add garments to your bag before checking out.
            </p>
            <Link
              href="/shop"
              className="inline-block rounded-sm bg-accent px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors"
            >
              EXPLORE THE COLLECTION
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg px-4 sm:px-6 pt-32 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 border-b border-base-border pb-6">
            <p className="text-accent text-[10px] tracking-[0.28em] uppercase font-bold">
              FINAL STEP
            </p>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary mt-1">
              CHECKOUT
            </h1>
          </div>

          {/* Referral code removed warning */}
          {referralRemovedMsg && (
            <div className="mb-6 rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-400">
              {referralRemovedMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left 2 Cols: Form ─────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact & Delivery Form */}
                <div className="rounded-sm border border-base-border bg-base-surface/80 p-6 backdrop-blur-sm space-y-4">
                  <h2 className="font-display text-base font-bold uppercase tracking-wide text-text-primary border-b border-base-border pb-3">
                    Contact &amp; Delivery Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Zaid Ali"
                        className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        placeholder="zaid@domain.com"
                        className={`w-full rounded-sm border bg-base-bg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                          emailError
                            ? "border-red-500 focus:border-red-500"
                            : "border-base-border focus:border-accent"
                        }`}
                        required
                      />
                      {emailError && (
                        <p className="mt-1 text-xs text-red-400">{emailError}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                      Phone Number (Numbers only) *
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phone}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/\D/g, "");
                        setPhone(numeric);
                        if (phoneError) setPhoneError("");
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" ||
                          e.key === "Delete" ||
                          e.key === "Tab" ||
                          e.key === "Escape" ||
                          e.key === "Enter" ||
                          e.key === "ArrowLeft" ||
                          e.key === "ArrowRight" ||
                          e.key === "Home" ||
                          e.key === "End" ||
                          (e.ctrlKey &&
                            (e.key === "a" ||
                              e.key === "c" ||
                              e.key === "v" ||
                              e.key === "x")) ||
                          (e.metaKey &&
                            (e.key === "a" ||
                              e.key === "c" ||
                              e.key === "v" ||
                              e.key === "x"))
                        ) {
                          return;
                        }
                        if (!/^[0-9]$/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasteData = e.clipboardData.getData("text");
                        const numericOnly = pasteData.replace(/\D/g, "");
                        setPhone((prev) => prev + numericOnly);
                        if (phoneError) setPhoneError("");
                      }}
                      placeholder="03218841920"
                      className={`w-full rounded-sm border bg-base-bg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                        phoneError
                          ? "border-red-500 focus:border-red-500"
                          : "border-base-border focus:border-accent"
                      }`}
                      required
                    />
                    {phoneError && (
                      <p className="mt-1 text-xs text-red-400">{phoneError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                      Shipping Address (Pakistan Delivery) *
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors mb-3"
                      required
                    >
                      <option value="Sindh">Sindh</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Punjab">Punjab</option>
                      <option value="KPK">KPK</option>
                    </select>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Full street address, building/house #, area, city"
                      className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Call upon dispatch, deliver between 2pm-6pm"
                      className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-sm bg-accent py-4 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "PLACING ORDER..." : "PLACE ORDER →"}
                </button>
              </form>
            </div>

            {/* ── Right 1 Col: Summary ──────────────────────────────────── */}
            <div>
              <div className="rounded-sm border border-base-border bg-base-surface/80 p-6 backdrop-blur-sm sticky top-28 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                  ORDER SUMMARY
                </p>

                {/* Applied referral code pill */}
                {referralCode && (referralDiscountPct || 0) > 0 && (
                  <div className="flex items-center justify-between gap-2 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[10px]">
                    <p className="text-emerald-400">
                      <span className="font-bold">
                        {referralCode.toUpperCase()}
                      </span>{" "}
                      — {referralDiscountPct}% off
                    </p>
                    <button
                      type="button"
                      onClick={clearReferral}
                      className="text-text-secondary hover:text-red-400 transition-colors font-bold"
                      aria-label="Remove referral"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Item list */}
                <div className="divide-y divide-base-border/50 max-h-72 overflow-y-auto">
                  {items.map((item, idx) => {
                    const img =
                      item.image || "/images/products/stwd-shirt.png";
                    const basePrice = item.price || 18500;
                    const discountedPrice = itemDiscountedPrice(
                      basePrice,
                      item.category
                    );
                    const hasDiscount = discountedPrice < basePrice;

                    return (
                      <div key={idx} className="py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="relative size-12 rounded-sm border border-base-border bg-base-bg overflow-hidden shrink-0">
                              <Image
                                src={img}
                                alt={item.name}
                                fill
                                sizes="48px"
                                className="object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-widest text-text-primary">
                                {item.isBundle ? "ANIME PACK 5 IN 1" : item.name}
                              </p>
                              {item.isBundle ? (
                                <>
                                  <p className="text-[9px] text-accent tracking-widest uppercase">
                                    Bundle
                                  </p>
                                  {item.bundleSizes && item.bundleSizes.length > 0 && (
                                    <BundleIncludesList
                                      bundleSizes={item.bundleSizes}
                                    />
                                  )}
                                </>
                              ) : (
                                <p className="text-[10px] text-text-secondary">
                                  Size:{" "}
                                  <strong className="text-text-primary">
                                    {item.size}
                                  </strong>{" "}
                                  • Qty: {item.quantity}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {hasDiscount ? (
                              <>
                                <p className="font-display text-xs font-bold text-emerald-400 tracking-widest">
                                  PKR{" "}
                                  {(
                                    discountedPrice * item.quantity
                                  ).toLocaleString()}
                                </p>
                                <p className="text-[9px] text-text-secondary line-through">
                                  PKR{" "}
                                  {(basePrice * item.quantity).toLocaleString()}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-display text-xs font-bold text-text-primary tracking-widest">
                                  PKR{" "}
                                  {(basePrice * item.quantity).toLocaleString()}
                                </p>
                                {item.oldPrice && item.oldPrice > basePrice && (
                                  <p className="text-[9px] text-text-secondary line-through">
                                    PKR{" "}
                                    {(
                                      item.oldPrice * item.quantity
                                    ).toLocaleString()}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals breakdown */}
                <div className="border-t border-base-border pt-4 space-y-2 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-text-primary font-bold">
                      PKR {itemsSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {referralCode && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>
                        Referral {referralCode.toUpperCase()} (−
                        {referralDiscountPct}%)
                      </span>
                      <span className="font-bold">
                        &minus; PKR {discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery ({province})</span>
                    {shippingCost > 0 ? (
                      <span className="text-text-primary font-bold">
                        PKR {shippingCost.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">
                        COMPLIMENTARY
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Window</span>
                    <span className="text-text-primary">20–30 Oct 2026</span>
                  </div>
                </div>

                <div className="border-t border-base-border pt-4 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-primary">
                    Total
                  </span>
                  <span className="font-display text-xl font-bold text-accent tracking-widest">
                    PKR {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
