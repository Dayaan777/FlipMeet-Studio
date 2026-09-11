"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/lib/auth-store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const { login, loginAsDemo, isAuthenticated, user } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated && user) {
    if (typeof window !== "undefined") {
      router.push(user.role === "admin" && next === "/account" ? "/dashboard" : next);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);

      if (res.success) {
        if (email.toLowerCase().includes("admin")) {
          router.push("/dashboard");
        } else {
          router.push(next);
        }
      } else {
        setError(res.error || "Invalid credentials.");
      }
    }, 400);
  };

  const handleDemo = (role: "customer" | "admin") => {
    loginAsDemo(role);
    if (role === "admin") {
      router.push("/dashboard");
    } else {
      router.push(next);
    }
  };

  return (
    <div className="w-full max-w-md rounded-sm border border-base-border bg-base-surface/80 p-8 backdrop-blur-md">
      <div className="text-center mb-8">
        <p className="text-accent text-[10px] tracking-[0.28em] uppercase font-bold mb-2">
          FLIPMEET STUDIO
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary">
          ACCESS ACCOUNT
        </h1>
        <p className="text-xs text-text-secondary mt-2">
          Sign in to track pre-orders, manage drop delivery, and view receipts.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-sm border border-accent/40 bg-accent/10 px-4 py-3 text-xs text-accent">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-1.5 font-medium">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="collector@domain.com"
            className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-medium">
              Password
            </label>
            <span className="text-[10px] text-text-secondary/60 cursor-pointer hover:text-text-secondary">
              Forgot?
            </span>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-sm border border-base-border bg-base-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-accent py-3.5 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? "AUTHENTICATING..." : "SIGN IN"}
        </button>
      </form>

      {/* Demo Quick Logins for Instant Testing */}
      <div className="mt-8 border-t border-base-border pt-6">
        <p className="text-center text-[10px] uppercase tracking-widest text-text-secondary/70 mb-3">
          Or Test With One-Click Demo
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDemo("customer")}
            className="rounded-sm border border-base-border bg-base-bg py-2.5 px-3 text-[11px] font-bold tracking-wider text-text-primary hover:border-text-secondary transition-colors"
          >
            👤 Demo Collector
          </button>
          <button
            type="button"
            onClick={() => handleDemo("admin")}
            className="rounded-sm border border-accent/40 bg-accent/10 py-2.5 px-3 text-[11px] font-bold tracking-wider text-accent hover:bg-accent hover:text-text-primary transition-colors"
          >
            ⚡ Studio Admin
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-text-secondary mt-6">
        Don&apos;t have an account?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-accent hover:underline font-bold">
          Register for Drop 001
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <NavBar />
      <main className="relative min-h-screen bg-base-bg px-6 pt-32 pb-20 flex items-center justify-center">
        {/* Subtle orange ambient glow in background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,77,30,0.1)_0%,transparent_70%)] blur-2xl"
        />

        <Suspense fallback={<div className="text-xs text-text-secondary tracking-widest">LOADING...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
