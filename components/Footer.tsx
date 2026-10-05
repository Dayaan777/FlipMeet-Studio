"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import ReferralSection from "@/components/ReferralSection";

function PackagingFlyer() {
  const [shockKey, setShockKey] = useState(0);

  const trigger = useCallback(() => {
    setShockKey((k) => k + 1);
  }, []);

  return (
    <>
      <style>{`
        @keyframes shock {
          0%   { transform: translate(0,0) rotate(0deg); }
          10%  { transform: translate(-12px,-10px) rotate(-6deg); }
          20%  { transform: translate(14px, 8px) rotate(7deg); }
          30%  { transform: translate(-10px, 12px) rotate(-5deg); }
          40%  { transform: translate(14px,-8px) rotate(7deg); }
          50%  { transform: translate(-12px, 6px) rotate(-6deg); }
          60%  { transform: translate(10px,-10px) rotate(5deg); }
          70%  { transform: translate(-8px, 8px) rotate(-4deg); }
          80%  { transform: translate(6px,-6px) rotate(3deg); }
          90%  { transform: translate(-3px, 3px) rotate(-1deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }
        .flyer-shock {
          animation: shock 0.45s ease-in-out forwards;
        }
      `}</style>
      <div
        className="relative w-44 md:w-52 aspect-[2/3] cursor-pointer select-none"
        onClick={trigger}
        onMouseEnter={trigger}
        onFocus={trigger}
        tabIndex={0}
        role="button"
        aria-label="FlipMeet Studio Packaging Flyer"
      >
        <Image
          key={shockKey}
          src="/images/packaging-flyer.png"
          alt="FlipMeet Studio Packaging"
          fill
          className={`object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)]${shockKey > 0 ? " flyer-shock" : ""}`}
          sizes="(max-width: 768px) 176px, 208px"
        />
      </div>
    </>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 800);
  };

  return (
    <footer className="relative z-50 px-6 py-16 md:py-24 border-t border-base-border bg-base-bg">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

        {/* Col 1: Brand & Mission */}
        <div className="md:col-span-4 flex flex-col justify-between">
          <div>
            <Link href="/" className="font-display text-2xl tracking-widest text-text-primary uppercase font-bold">
              FLIPMEET STUDIO
            </Link>
            <p className="text-text-secondary text-xs leading-relaxed mt-4 max-w-sm pr-4">
              Built for the new generation of hustlers, creators, and everyday game changers. We create affordable luxury streetwear with oversized fits, premium fabrics, and bold graphics.
            </p>
            <p className="text-text-primary text-[10px] uppercase tracking-[0.2em] font-bold mt-6">
              Clothing for real connections.
            </p>
          </div>
          <p className="text-text-secondary/50 text-[10px] uppercase tracking-widest mt-12 md:mt-auto">
            &copy; {new Date().getFullYear()} FlipMeet Studio. All rights reserved.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div className="md:col-span-2">
          <p className="font-bold text-text-primary text-xs tracking-widest uppercase mb-6">Quick Links</p>
          <div className="flex flex-col gap-4 text-xs text-text-secondary">
            <Link href="/track" className="hover:text-accent transition-colors w-fit text-accent font-medium">Track Order</Link>
            <a href="/terms" className="hover:text-accent transition-colors w-fit">Terms &amp; Conditions</a>
            <a href="/privacy" className="hover:text-accent transition-colors w-fit">Privacy Policy</a>
            <a href="/shipping" className="hover:text-accent transition-colors w-fit">Shipping Policy</a>
            <a href="/returns" className="hover:text-accent transition-colors w-fit">Returns &amp; Exchange</a>
            <a
              href="https://www.instagram.com/flipmeet.studio?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors w-fit flex items-center gap-2"
              aria-label="FlipMeet Studio on Instagram"
            >
              {/* Instagram icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
          </div>
        </div>

        {/* Col 3: Newsletter */}
        <div className="md:col-span-2">
          <p className="font-bold text-text-primary text-xs tracking-widest uppercase mb-6">Stay Updated</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-xs text-text-secondary mb-2 leading-relaxed">
              Join the community. Be first to know about drops.
            </p>
            <div className="flex">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === "loading" || status === "success"}
                className="bg-base-surface border border-base-border rounded-sm px-3 py-2.5 text-xs text-text-primary flex-1 min-w-0 focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                aria-label="Join waitlist"
                className="bg-accent hover:bg-accent-dim transition-colors px-4 py-2.5 rounded-sm ml-2 text-text-primary font-bold shadow-[0_0_15px_rgba(255,168,56,0.15)] hover:shadow-[0_0_20px_rgba(255,168,56,0.3)] disabled:opacity-50 flex items-center justify-center min-w-[42px]"
              >
                {status === "loading" ? "..." : "→"}
              </button>
            </div>
            {status === "success" && (
              <p className="text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-300">
                ✓ Thanks for joining! We&apos;ll be in touch.
              </p>
            )}
          </form>
        </div>

        {/* Col 4: Referral */}
        <ReferralSection />

        {/* Col 5: Packaging Flyer */}
        <div className="md:col-span-2 flex justify-center md:justify-end items-center mt-8 md:mt-0">
          <PackagingFlyer />
        </div>

      </div>
    </footer>
  );
}
