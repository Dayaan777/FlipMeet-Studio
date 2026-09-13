"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href =
          window.location.pathname === "/admin/login"
            ? "/admin"
            : window.location.pathname;
      } else {
        setError(data.error || "Incorrect password.");
        setLoading(false);
      }
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-bg text-text-primary flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Header Branding */}
        <div className="mb-8 text-center">
          <span className="text-[10px] uppercase font-bold tracking-[0.28em] text-accent">
            RESTRICTED // STUDIO
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider text-text-primary mt-2">
            ADMIN ACCESS
          </h1>
          <p className="text-xs text-text-secondary mt-1.5">
            Enter password to unlock administrative route.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 rounded-sm border border-accent/40 bg-accent/10 px-4 py-2.5 text-xs text-accent text-center font-bold">
            {error}
          </div>
        )}

        {/* Password Form: only a single password input, no username */}
        <form
          action="/api/admin/login"
          method="POST"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[10px] uppercase tracking-widest text-text-secondary mb-2 font-medium"
            >
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              required
              className="w-full rounded-sm border border-base-border bg-base-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-accent py-3.5 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-accent-dim transition-colors disabled:opacity-50"
          >
            {loading ? "VERIFYING..." : "ENTER →"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] tracking-widest text-text-secondary/50">
          FLIPMEET STUDIO © 2026
        </p>
      </div>
    </div>
  );
}
