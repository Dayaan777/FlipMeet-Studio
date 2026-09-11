"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/lib/auth-store";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const { register, isAuthenticated } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sizePreference, setSizePreference] = useState("L");
  const [notifyDrop, setNotifyDrop] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    if (typeof window !== "undefined") {
      router.push(next);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = register({
        name,
        email,
        phone,
        address,
        sizePreference,
        notifyDrop,
      }, password);

      setLoading(false);

      if (res.success) {
        router.push(next);
      } else {
        setError(res.error || "Registration failed. Please try again.");
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-lg rounded-sm border border-base-border bg-base-surface/80 p-8 backdrop-blur-md">
      <div className="text-center mb-8">
        <p className="text-accent text-[10px] tracking-[0.28em] uppercase font-bold mb-2">
          JOIN THE CULTURE
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary">
          CREATE ACCOUNT
        </h1>
        <p className="text-xs text-text-secondary mt-2">
          Store your shipping details for fast drop checkout and track Drop 001 pieces.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-sm border border-accent/40 bg-accent/10 px-4 py-3 text-xs text-accent">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zaid Ali"
              className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collector@domain.com"
              className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
            />
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
              className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
            Delivery Address
          </label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address, city, postal code"
            className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-2 font-medium">
            Preferred Fit / Size
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

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="notify"
            checked={notifyDrop}
            onChange={(e) => setNotifyDrop(e.target.checked)}
            className="size-4 accent-accent rounded"
          />
          <label htmlFor="notify" className="text-xs text-text-secondary cursor-pointer">
            Get instant WhatsApp & email notification when new limited drops open.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-accent py-3.5 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? "CREATING PROFILE..." : "CREATE ACCOUNT"}
        </button>
      </form>

      <p className="text-center text-xs text-text-secondary mt-6">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent hover:underline font-bold">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <NavBar />
      <main className="relative min-h-screen bg-base-bg px-6 pt-32 pb-20 flex items-center justify-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,77,30,0.1)_0%,transparent_70%)] blur-2xl"
        />

        <Suspense fallback={<div className="text-xs text-text-secondary tracking-widest">LOADING...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
