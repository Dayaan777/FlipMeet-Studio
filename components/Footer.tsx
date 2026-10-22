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
        aria-label="HT x Studio Packaging Flyer"
      >
        <Image
          key={shockKey}
          src="/images/packaging-flyer.png"
          alt="HT x Studio Packaging"
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
            <Link href="/" className="font-display text-2xl tracking-[0.16em] text-text-primary uppercase font-normal">
              HT <span className="font-serif italic lowercase text-accent font-light text-xl">x</span> STUDIO <span className="text-text-secondary/50 font-sans text-xs ml-2 tracking-widest">/ STUDIO</span>
            </Link>
            <p className="text-text-secondary text-xs leading-relaxed mt-4 max-w-sm pr-4">
              Built for the new generation of hustlers, creators, and everyday game changers. Affordable luxury streetwear crafted from concrete and culture.
            </p>
            <p className="text-accent text-[11px] uppercase tracking-[0.24em] font-semibold mt-4">
              Clothing for real connections.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-8 md:mt-auto">
            <a
              href="https://www.instagram.com/flipmeet.studio?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="size-8 rounded-[2px] border border-base-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
              aria-label="Instagram"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <p className="text-text-secondary/50 text-[10px] uppercase tracking-widest">
              &copy; {new Date().getFullYear()} HT x Studio. All rights reserved.
            </p>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="md:col-span-2">
          <p className="font-semibold text-text-primary text-[10px] tracking-[0.26em] uppercase mb-5">Quick Links</p>
          <div className="flex flex-col gap-3 text-xs text-text-secondary">
            <Link href="/shop" className="hover:text-accent transition-colors w-fit">Collection</Link>
            <Link href="/shop" className="hover:text-accent transition-colors w-fit">Men</Link>
            <Link href="/shop" className="hover:text-accent transition-colors w-fit">Women</Link>
            <Link href="/anime" className="hover:text-accent transition-colors w-fit">Lookbook</Link>
            <Link href="/track" className="hover:text-accent transition-colors w-fit text-accent font-medium">Track Order</Link>
            {/* <Link href="/process" className="hover:text-accent transition-colors w-fit">Outlet</Link> */}
          </div>
        </div>

        {/* Col 3: Newsletter */}
        <div className="md:col-span-3">
          <p className="font-semibold text-text-primary text-[10px] tracking-[0.26em] uppercase mb-5">Newsletter</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === "loading" || status === "success"}
                className="bg-base-surface/90 border border-base-border rounded-[2px] px-3.5 py-2.5 text-xs text-text-primary flex-1 min-w-0 focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                aria-label="Subscribe"
                className="btn-copper-plus shrink-0"
              >
                {status === "loading" ? "..." : "+"}
              </button>
            </div>
            {status === "success" && (
              <p className="text-accent text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-300 mt-1">
                ✓ Welcome to the collective.
              </p>
            )}
            <p className="text-[11px] text-text-secondary/70 mt-2 italic tracking-wide">
              Clothing for real connections.
            </p>
          </form>
        </div>

        {/* Col 4: Referral */}
        <ReferralSection className="md:col-span-3" />

      </div>
    </footer>
  );
}
