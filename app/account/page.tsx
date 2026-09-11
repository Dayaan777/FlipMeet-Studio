"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/lib/auth-store";
import { useOrderStore, OrderStatus } from "@/lib/order-store";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "PENDING CONFIRMATION",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
  },
  confirmed: {
    label: "CONFIRMED // IN QUEUE",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  in_production: {
    label: "IN PRODUCTION (LIMITED 100)",
    bg: "bg-accent/10",
    text: "text-accent",
    border: "border-accent/40",
  },
  shipped: {
    label: "DISPATCHED / SHIPPED",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  delivered: {
    label: "DELIVERED",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  cancelled: {
    label: "CANCELLED",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
  },
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile, loginAsDemo } = useAuthStore();
  const { getOrdersByCustomer } = useOrderStore();

  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "preferences">("orders");

  // Profile form local states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sizePreference, setSizePreference] = useState("L");
  const [notifyDrop, setNotifyDrop] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setSizePreference(user.sizePreference || "L");
      setNotifyDrop(user.notifyDrop ?? true);
    }
  }, [user]);

  // Check URL hash for tab on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#orders") {
      setActiveTab("orders");
    }
  }, []);

  const orders = user ? getOrdersByCustomer(user.id, user.email) : [];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      address,
      sizePreference,
      notifyDrop,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleWhatsAppInquiry = (orderId: string) => {
    const text = encodeURIComponent(
      `Hello FlipMeet Studio! I would like an update on my Drop 001 Pre-Order (${orderId}). Customer Name: ${user?.name || "Customer"}.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // If not authenticated, prompt for sign in
  if (!isAuthenticated || !user) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-base-bg px-6 pt-36 pb-20 flex items-center justify-center">
          <div className="w-full max-w-md text-center rounded-sm border border-base-border bg-base-surface/80 p-8">
            <p className="text-accent text-[10px] tracking-[0.28em] uppercase font-bold mb-2">
              SIGN IN REQUIRED
            </p>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary">
              COLLECTOR PORTAL
            </h1>
            <p className="text-xs text-text-secondary mt-3 mb-6">
              Sign in to view your active pre-orders, delivery schedule, and receipts.
            </p>
            <div className="space-y-3">
              <Link
                href="/login?next=/account"
                className="block w-full rounded-sm bg-accent py-3 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors"
              >
                SIGN IN TO ACCOUNT
              </Link>
              <button
                type="button"
                onClick={() => loginAsDemo("customer")}
                className="w-full rounded-sm border border-base-border bg-base-bg py-3 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
              >
                LOG IN AS DEMO COLLECTOR
              </button>
            </div>
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
        <div className="mx-auto max-w-6xl">
          {/* Admin Banner if Admin */}
          {user.role === "admin" && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-accent/40 bg-accent/10 px-5 py-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-accent animate-ping" />
                <p className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Studio Admin Privilege Active
                </p>
              </div>
              <Link
                href="/dashboard"
                className="rounded-sm bg-accent px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors"
              >
                Open Studio Dashboard →
              </Link>
            </div>
          )}

          {/* Account Profile Header */}
          <div className="relative mb-10 overflow-hidden rounded-sm border border-base-border bg-base-surface/80 p-6 sm:p-8 backdrop-blur-md">
            {/* Subtle glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,77,30,0.12)_0%,transparent_70%)] blur-2xl"
            />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-text-primary">
                    {user.name}
                  </h1>
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 text-[9px] font-bold tracking-widest text-accent uppercase">
                    {user.role === "admin" ? "Studio Admin" : "Drop 001 Collector"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">{user.email}</p>
                <p className="mt-0.5 text-[11px] text-text-secondary/70">
                  {user.phone || "No phone linked"} • Default Size: {user.sizePreference || "L"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="rounded-sm border border-base-border bg-base-bg px-4 py-2 text-xs tracking-widest text-text-secondary hover:text-accent hover:border-accent transition-colors"
                >
                  SIGN OUT
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8 flex gap-2 border-t border-base-border pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === "orders"
                    ? "border border-accent bg-accent/15 text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                Pre-Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === "profile"
                    ? "border border-accent bg-accent/15 text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                Shipping & Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preferences")}
                className={`rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === "preferences"
                    ? "border border-accent bg-accent/15 text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                Drop Alerts
              </button>
            </div>
          </div>

          {/* TAB 1: PRE-ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide text-text-primary">
                    Drop 001 Allocations & Pre-Orders
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Each garment is numbered and manufactured in a limited run of 100 pieces.
                  </p>
                </div>
                <Link
                  href="/drop/drop-001"
                  className="text-xs font-bold tracking-widest text-accent hover:underline hidden sm:block"
                >
                  EXPLORE DROP 001 →
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-sm border border-base-border bg-base-surface/50 p-12 text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-text-primary">
                    No active pre-orders found
                  </p>
                  <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                    Secure your looks from DROP 001 before the pre-order window closes on October 1st.
                  </p>
                  <Link
                    href="/drop/drop-001"
                    className="mt-6 inline-block rounded-sm bg-accent px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors"
                  >
                    PRE-ORDER DROP 001
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {orders.map((order) => {
                    const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

                    return (
                      <div
                        key={order.id}
                        className="rounded-sm border border-base-border bg-base-surface/70 p-5 sm:p-6 backdrop-blur-sm transition-colors hover:border-text-secondary/40"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-border pb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-display text-base font-bold text-text-primary">
                                {order.id}
                              </span>
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-secondary mt-1">
                              Ordered on {new Date(order.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-text-secondary">
                              EST. DELIVERY WINDOW
                            </p>
                            <p className="text-xs font-bold text-text-primary">
                              {new Date(order.deliveryWindow.start).toLocaleDateString("en-GB", {
                                month: "short",
                                day: "2-digit",
                              })}{" "}
                              –{" "}
                              {new Date(order.deliveryWindow.end).toLocaleDateString("en-GB", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="py-4 divide-y divide-base-border/50">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3">
                              <div className="flex items-center gap-4">
                                <div className="relative size-14 rounded-sm border border-base-border bg-base-bg overflow-hidden shrink-0">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-text-primary">
                                    {item.name}
                                  </p>
                                  <p className="text-[11px] text-text-secondary">
                                    Size: <span className="text-text-primary font-bold">{item.size}</span> • Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-xs font-display font-bold text-text-primary">
                                  PKR {(item.price * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-base-border pt-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-text-secondary">
                              DESTINATION
                            </p>
                            <p className="text-xs text-text-primary truncate max-w-md">
                              {order.shippingAddress}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-text-secondary block">
                                TOTAL PAID
                              </span>
                              <span className="font-display text-sm font-bold text-accent">
                                PKR {order.total.toLocaleString()}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleWhatsAppInquiry(order.id)}
                              className="rounded-sm border border-emerald-500/50 bg-emerald-500/10 px-3.5 py-2 text-[11px] font-bold tracking-wider text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
                            >
                              WhatsApp Receipt 💬
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SHIPPING & DETAILS */}
          {activeTab === "profile" && (
            <div className="rounded-sm border border-base-border bg-base-surface/70 p-6 sm:p-8 backdrop-blur-sm max-w-2xl">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-text-primary mb-1">
                Saved Shipping & Contact Profile
              </h2>
              <p className="text-xs text-text-secondary mb-6">
                These details will be pre-filled at checkout for instant one-click pre-order booking.
              </p>

              {saveSuccess && (
                <div className="mb-6 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-400 font-bold">
                  ✓ Profile details updated successfully!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full rounded-sm border border-base-border/50 bg-base-bg/50 px-4 py-2.5 text-sm text-text-secondary cursor-not-allowed"
                    />
                    <span className="text-[10px] text-text-secondary/60 mt-1 block">
                      Account email is fixed.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                      WhatsApp / Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
                    Default Shipping Address
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, Building, Area, City, Postal Code"
                    className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-2 font-medium">
                    Preferred Garment Size
                  </label>
                  <div className="flex gap-2">
                    {["S", "M", "L", "XL", "XXL"].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSizePreference(sz)}
                        className={`flex-1 rounded-sm border py-2 text-xs font-bold transition-all ${
                          sizePreference === sz
                            ? "border-accent bg-accent/15 text-accent"
                            : "border-base-border bg-base-bg text-text-secondary hover:border-text-secondary"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-sm bg-accent px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors mt-2"
                >
                  SAVE PROFILE
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: DROP PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="rounded-sm border border-base-border bg-base-surface/70 p-6 sm:p-8 backdrop-blur-sm max-w-2xl">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-text-primary mb-1">
                Drop Alerts & Exclusive Access
              </h2>
              <p className="text-xs text-text-secondary mb-6">
                Control how you receive early notifications when new limited chapters are published.
              </p>

              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-base-border pb-5">
                  <div>
                    <p className="text-xs font-bold text-text-primary">
                      Drop 002 Early VIP Access
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Receive an exclusive 1-hour pre-access link before public release.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyDrop}
                    onChange={(e) => {
                      setNotifyDrop(e.target.checked);
                      updateProfile({ notifyDrop: e.target.checked });
                    }}
                    className="size-5 accent-accent rounded"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 border-b border-base-border pb-5">
                  <div>
                    <p className="text-xs font-bold text-text-primary">
                      WhatsApp Dispatch Notifications
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Get instant ping on WhatsApp with courier tracking number upon shipment.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="size-5 accent-accent rounded"
                  />
                </div>

                <div className="rounded-sm border border-base-border bg-base-bg p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    Privacy Guarantee
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Your contact information is strictly used for order fulfillment via WhatsApp and private drop drops. We never sell or share data.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
