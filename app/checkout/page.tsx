"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/cart-store";
import { useOrderStore, Order } from "@/lib/order-store";
import { drops } from "@/data/drops";

export default function CheckoutPage() {
  const { items, clear } = useCartStore();
  const { createOrder } = useOrderStore();

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

  const total = items.reduce((sum, item) => sum + (item.price || 18500) * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPhoneError("");

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      alert("Please fill in all contact and delivery details.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    if (!/^\d+$/.test(phone.trim())) {
      setPhoneError("Phone number must contain numbers only (no letters or symbols).");
      return;
    }

    if (phone.trim().length < 8) {
      setPhoneError("Phone number must be at least 8 digits.");
      return;
    }

    setIsSubmitting(true);

    const orderItems = items.map((item) => {
      const look = drop.looks.find((l) => l.id === item.lookId);
      return {
        lookId: item.lookId,
        product_id: item.lookId,
        name: item.name,
        size: item.size,
        price: item.price || 18500,
        price_at_purchase: item.price || 18500,
        quantity: item.quantity,
        image: look?.images[0] || "/images/looks/look-01.jpg",
      };
    });

    const calculatedTotal = total > 0 ? total : 18500;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          shipping_address: address.trim(),
          notes: notes.trim(),
          total: calculatedTotal,
          items: orderItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order.");
      }

      const newOrder = createOrder({
        id: data.order?.id,
        customerId: `guest-${Date.now().toString(36)}`,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: address.trim(),
        dropId: "drop-001",
        items: orderItems,
        total: calculatedTotal,
        deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
        notes: notes.trim(),
      });

      clear();
      setCompletedOrder(newOrder);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error placing order.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = (order: Order) => {
    const summary = order.items
      .map((i) => `• ${i.name} [Size: ${i.size}] x${i.quantity}`)
      .join("\n");

    const message = encodeURIComponent(
      `*NEW FLIPMEET ORDER: ${order.id}*\n` +
      `--------------------------------\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Phone:* ${order.customerPhone}\n` +
      `*Address:* ${order.shippingAddress}\n` +
      `\n*Items:*\n${summary}\n` +
      `\n*Total:* PKR ${order.total.toLocaleString()}\n` +
      `*Delivery Window:* 20–30 Oct 2026\n` +
      (order.notes ? `*Notes:* ${order.notes}\n` : "") +
      `\n_Please confirm my Drop 001 order._`
    );

    return `https://wa.me/?text=${message}`;
  };

  // SUCCESS CONFIRMATION SCREEN
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
              Your garment allocation has been recorded in our production ledger. Please finalize confirmation directly via WhatsApp.
            </p>

            <div className="my-6 rounded-sm border border-base-border bg-base-bg p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-text-secondary">
                <span>Customer</span>
                <span className="text-text-primary font-bold">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Total Amount</span>
                <span className="text-accent font-bold font-display">
                  PKR {completedOrder.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Delivery Window</span>
                <span className="text-text-primary">20–30 Oct 2026</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={getWhatsAppLink(completedOrder)}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-sm bg-emerald-600 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-emerald-500 transition-colors"
              >
                CONFIRM VIA WHATSAPP NOW 💬
              </a>

              <Link
                href="/drop/drop-001"
                className="block w-full rounded-sm border border-base-border bg-base-bg py-3 text-xs font-bold uppercase tracking-widest text-text-primary hover:border-text-secondary transition-colors"
              >
                RETURN TO DROP 001 →
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // EMPTY CART CHECK
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
              Add garments from Drop 001 to your bag before checking out.
            </p>
            <Link
              href="/drop/drop-001"
              className="inline-block rounded-sm bg-accent px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors"
            >
              EXPLORE DROP 001
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
              DROP 001 // FINAL STEP
            </p>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary mt-1">
              CHECKOUT
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">


                {/* Contact & Delivery Form */}
                <div className="rounded-sm border border-base-border bg-base-surface/80 p-6 backdrop-blur-sm space-y-4">
                  <h2 className="font-display text-base font-bold uppercase tracking-wide text-text-primary border-b border-base-border pb-3">
                    Contact & Delivery Details
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
                          emailError ? "border-red-500 focus:border-red-500" : "border-base-border focus:border-accent"
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
                          (e.ctrlKey && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x")) ||
                          (e.metaKey && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
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
                        phoneError ? "border-red-500 focus:border-red-500" : "border-base-border focus:border-accent"
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
                  {isSubmitting ? "PLACING ORDER..." : "PLACE ORDER & CONFIRM VIA WHATSAPP →"}
                </button>
              </form>
            </div>

            {/* Right 1 Col: Summary */}
            <div>
              <div className="rounded-sm border border-base-border bg-base-surface/80 p-6 backdrop-blur-sm sticky top-28 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                  ORDER SUMMARY
                </p>

                <div className="divide-y divide-base-border/50 max-h-72 overflow-y-auto">
                  {items.map((item, idx) => {
                    const look = drop.looks.find((l) => l.id === item.lookId);
                    const img = look?.images[0] || "/images/looks/look-01.jpg";
                    const price = item.price || 18500;

                    return (
                      <div key={idx} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-sm border border-base-border bg-base-bg overflow-hidden shrink-0">
                            <Image src={img} alt={item.name} fill className="object-contain" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-text-primary">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-text-secondary">
                              Size: <strong className="text-text-primary">{item.size}</strong> • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <p className="font-display text-xs font-bold text-text-primary">
                          PKR {(price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-base-border pt-4 space-y-2 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-emerald-400 font-bold">COMPLIMENTARY</span>
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
                  <span className="font-display text-xl font-bold text-accent">
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
