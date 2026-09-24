"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "fm_gender";

export default function GenderGate() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setVisible(false);
    } catch {
      setVisible(false);
    }
  }, []);

  function choose(gender: "male" | "female") {
    try {
      localStorage.setItem(STORAGE_KEY, gender);
      document.documentElement.dataset.theme = gender;
      
      // Instantly remove the CSS lock before React even re-renders
      const lockStyle = document.getElementById('fm-lock-style');
      if (lockStyle) lockStyle.remove();
      
      window.dispatchEvent(new Event("themechange"));
    } catch { /* ignore */ }
    setVisible(false);
  }

  // Once hydrated, if the user has a gender, unmount entirely to clean DOM
  if (mounted && !visible) return null;

  return (
    /* Full-screen backdrop — hidden by default, shown via injected CSS lock */
    <div
      id="fm-gender-gate"
      className="fixed inset-0 z-[200] items-center justify-center hidden"
      style={{ backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", background: "rgba(0,0,0,0.72)" }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="gender-gate-title"
    >
      {/* Modal card */}
      <div
        className="relative mx-4 w-full max-w-sm rounded-sm border border-base-border bg-base-surface px-8 py-10 text-center shadow-2xl"
        style={{ boxShadow: "0 0 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)" }}
      >
        {/* Wordmark */}
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.38em] text-text-secondary">
          FlipMeet Studio
        </p>

        {/* Headline */}
        <h1
          id="gender-gate-title"
          className="mb-2 font-display text-2xl font-bold uppercase tracking-wide text-text-primary"
        >
          Shop By Style
        </h1>
        <p className="mb-10 text-[11px] tracking-[0.12em] text-text-secondary">
          Select to personalise your experience
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => choose("male")}
            className="flex flex-1 flex-col items-center gap-3 rounded-sm border border-base-border bg-black px-4 py-7 transition-all duration-200 hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            {/* Male icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="11" cy="17" r="7.5" stroke="#9A9A9A" strokeWidth="1.8" />
              <path d="M17 11 L24 4 M20 4 H24 V8" stroke="#9A9A9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-text-primary">
              Male
            </span>
          </button>

          <button
            type="button"
            onClick={() => choose("female")}
            className="flex flex-1 flex-col items-center gap-3 rounded-sm border border-base-border bg-black px-4 py-7 transition-all duration-200 hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            {/* Female icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="11" r="7.5" stroke="#9A9A9A" strokeWidth="1.8" />
              <path d="M14 19 V26 M10 23 H18" stroke="#9A9A9A" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-text-primary">
              Female
            </span>
          </button>
        </div>

        {/* Fine print */}
        <p className="mt-8 text-[9px] tracking-[0.08em] text-text-secondary/50">
          You can change this at any time in your settings.
        </p>
      </div>
    </div>
  );
}
