"use client";

import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="px-6 py-12">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between gap-8">
        <div>
          <p className="font-display text-xl text-text-primary">FLIPMEET STUDIO</p>
          <p className="text-text-secondary text-xs mt-1">
            © {new Date().getFullYear()} FlipMeet Studio. All rights reserved.
          </p>
        </div>

        <div className="flex gap-6 text-xs text-text-secondary">
          <a href="/terms" className="hover:text-text-primary transition-colors">TERMS</a>
          <a href="/privacy" className="hover:text-text-primary transition-colors">PRIVACY</a>
          <a href="/shipping" className="hover:text-text-primary transition-colors">SHIPPING</a>
          <a href="/returns" className="hover:text-text-primary transition-colors">RETURNS</a>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-2"
        >
          <p className="text-xs text-text-secondary">
            STAY UPDATED — Join the waitlist for Drop 002
          </p>
          <div className="flex">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-base-surface border border-base-border rounded-sm px-4 py-2 text-sm text-text-primary flex-1 min-w-0"
            />
            <button
              type="submit"
              aria-label="Join waitlist"
              className="bg-accent hover:bg-accent-dim transition-colors px-4 py-2 rounded-sm ml-2 text-text-primary"
            >
              →
            </button>
          </div>
        </form>
      </div>
    </footer>
  );
}
