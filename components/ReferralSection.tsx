"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

export default function ReferralSection({
  className = "md:col-span-2",
  title = "Referral Code",
  subtitle = "Have a referral code? Enter it below.",
  formLayout = "col",
}: {
  className?: string;
  title?: string;
  subtitle?: string;
  formLayout?: "col" | "row";
}) {
  const {
    referralCode,
    referralDiscountPct,
    referralCategories,
    setReferral,
    clearReferral,
  } = useCartStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"invalid" | "paused" | "">("");

  // ── Applied state — show pill with remove button ─────────────────────────
  if (referralCode) {
    const cats = referralCategories ?? [];
    const catText = cats.includes("All categories")
      ? "all products"
      : cats.join(", ");
    const msg =
      referralDiscountPct && referralDiscountPct > 0
        ? `Code ${referralCode} applied: ${referralDiscountPct}% off ${catText}`
        : `Referral code ${referralCode} applied`;

    return (
      <div className={className}>
        <p className="font-bold text-text-primary text-xs tracking-widest uppercase mb-3">
          {title}
        </p>
        <div className="flex items-center justify-between gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <p className="text-xs text-emerald-400 font-medium">✓ {msg}</p>
          <button
            type="button"
            onClick={clearReferral}
            className="text-text-secondary hover:text-red-400 text-xs font-bold transition-colors shrink-0"
            aria-label="Remove referral code"
          >
            ✕ Remove
          </button>
        </div>
      </div>
    );
  }

  // ── Input state ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = input.trim().toUpperCase();
    if (!code || loading) return;

    setLoading(true);
    setError("");
    setErrorType("");

    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.success) {
        setReferral(
          data.code,
          data.discountPercent ?? 0,
          data.categories ?? ["All categories"]
        );
        setInput("");
      } else {
        const isPaused = data.message?.toLowerCase().includes("paused");
        setErrorType(isPaused ? "paused" : "invalid");
        setError(data.message || "Invalid referral code. Please try again.");
      }
    } catch {
      setErrorType("invalid");
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <p className="font-bold text-text-primary text-xs tracking-widest uppercase mb-3">
        {title}
      </p>
      <p className="text-xs text-text-secondary mb-3 leading-relaxed">
        {subtitle}
      </p>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-2 ${
          formLayout === "row" ? "sm:flex-row sm:items-start" : ""
        }`}
      >
        <div className={`flex ${formLayout === "row" ? "flex-1" : ""}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value.toUpperCase());
              setError("");
              setErrorType("");
            }}
            placeholder="e.g. SARA10"
            disabled={loading}
            className="bg-base-surface border border-base-border rounded-sm px-3 py-2.5 text-xs text-text-primary flex-1 min-w-0 focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/50 disabled:opacity-50 font-mono uppercase tracking-widest"
            maxLength={20}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-accent hover:bg-accent-dim transition-colors px-4 py-2.5 rounded-sm ml-2 text-text-primary font-bold text-xs tracking-widest disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "..." : "Apply"}
          </button>
        </div>

        {error && (
          <p
            className={`text-xs font-medium ${
              errorType === "paused" ? "text-amber-400" : "text-red-400"
            } ${formLayout === "row" ? "sm:mt-2.5" : ""}`}
          >
            ✕ {error}
          </p>
        )}
      </form>
    </div>
  );
}
