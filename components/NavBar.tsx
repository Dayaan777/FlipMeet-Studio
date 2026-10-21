"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useCartStore } from "@/lib/cart-store";

const LINKS = [
  { label: "SHOP",    href: "/shop" },
  { label: "ANIME",   href: "/anime" },
  { label: "MAKE YOUR OUTFIT", href: "/make-your-own" },
  { label: "PROCESS", href: "/process" },
  { label: "TRACK ORDER", href: "/track" },
];

export default function NavBar({ mobileSolid = false }: { mobileSolid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemCount = useCartStore((s) => s.items.length);
  const [cartBump, setCartBump] = useState(false);
  const prevCountRef = useRef(itemCount);

  // Gender toggle state
  const [gender, setGender] = useState<"male" | "female">("male");

  useEffect(() => {
    const syncGender = () => {
      try {
        const stored = localStorage.getItem("fm_gender") as "male" | "female";
        if (stored) setGender(stored);
      } catch {}
    };

    syncGender();
    window.addEventListener("themechange", syncGender);
    window.addEventListener("storage", syncGender);

    return () => {
      window.removeEventListener("themechange", syncGender);
      window.removeEventListener("storage", syncGender);
    };
  }, []);

  const toggleGender = () => {
    const newGender = gender === "male" ? "female" : "male";
    setGender(newGender);
    try {
      localStorage.setItem("fm_gender", newGender);
      document.documentElement.dataset.theme = newGender;
      window.dispatchEvent(new Event("themechange"));
    } catch {}
  };

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      prevCountRef.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll);
    // Call once on mount to set initial state
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close the drawer whenever navigation changes, including client-side route transitions.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll while the drawer is open and restore it on close/unmount.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const isProcess = pathname === "/process";
  const isHome    = pathname === "/";

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          "translate-y-0 opacity-100"
        } ${
          scrolled && !isProcess
            ? "bg-base-bg/90 backdrop-blur border-b border-base-border"
            : mobileSolid
              ? "max-md:bg-base-bg/95 max-md:backdrop-blur-md max-md:border-b max-md:border-base-border bg-transparent"
              : "bg-transparent"
        }`}
      >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
        <Link href="/" className="group flex items-center">
          <span className="font-display text-2xl font-normal tracking-[0.16em] text-text-primary uppercase group-hover:text-accent transition-colors">
            HT <span className="font-serif italic lowercase text-accent font-light text-xl">x</span> STUDIO
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.22em] text-[#e2ded9] font-semibold drop-shadow-sm">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-text-primary transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions: Account + Cart + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {/* Gender Toggle */}
          <button 
            onClick={toggleGender}
            className="relative hidden sm:flex items-center h-[32px] w-[110px] rounded-full border border-base-border bg-base-surface/80 p-0.5 backdrop-blur-sm transition-colors hover:border-accent/40 overflow-hidden"
            aria-label="Toggle Gender Theme"
          >
            {/* Slider Pill */}
            <div 
              className={`absolute top-0.5 bottom-0.5 w-[50px] rounded-full bg-gradient-to-r from-accent to-accent-dim shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                gender === 'female' ? 'translate-x-[54px]' : 'translate-x-0'
              }`}
            />
            
            <div className="relative z-10 flex w-full justify-between pointer-events-none">
              <span className={`text-[10px] w-full text-center font-bold tracking-widest transition-colors duration-300 ${gender === 'male' ? 'text-base-bg' : 'text-text-secondary'}`}>
                MEN
              </span>
              <span className={`text-[10px] w-full text-center font-bold tracking-widest transition-colors duration-300 ${gender === 'female' ? 'text-base-bg' : 'text-text-secondary'}`}>
                WOMEN
              </span>
            </div>
          </button>

          {/* Cart link */}
          <a
            href="/cart"
            className={`relative text-[11px] uppercase tracking-[0.2em] border rounded-full px-4 py-1.5 text-text-primary bg-base-surface/50 transition-all ${
              cartBump
                ? "border-accent text-accent shadow-[0_0_12px_rgba(194,120,71,0.3)]"
                : "border-base-border hover:border-accent/60 hover:bg-base-surface"
            }`}
          >
            CART{" "}
            <span
              className={`inline-block tabular-nums ${cartBump ? "animate-cart-bump text-accent" : ""}`}
            >
              ({itemCount})
            </span>
          </a>

          {/* Mobile hamburger button */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-text-primary text-2xl leading-none px-1"
          >
            {mobileMenuOpen ? "✕" : "≡"}
          </button>
        </div>
      </nav>

    </header>

    {/* Render outside the backdrop-filtered header so fixed positioning stays viewport-relative. */}
    {mobileMenuOpen &&
      typeof document !== "undefined" &&
      createPortal(
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-label="Mobile navigation"
          className="fixed inset-x-0 top-[73px] bottom-0 z-[60] overflow-y-auto bg-base-bg/95 backdrop-blur-xl md:hidden border-t border-base-border animate-in fade-in duration-200"
        >
          <div className="flex min-h-full flex-col justify-between p-6">
            <div className="space-y-6">
              {/* Navigation links */}
              <ul className="space-y-4 pt-4 text-sm font-display tracking-widest text-text-secondary">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile drawer footer */}
            <div className="border-t border-base-border pt-4">
              <p className="mt-2 text-[10px] tracking-widest text-text-secondary/60">
                HT X STUDIO © 2026. BUILT FOR THE CULTURE.
              </p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
