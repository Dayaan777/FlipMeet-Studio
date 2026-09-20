"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/lib/cart-store";

const LINKS = [
  { label: "DROP 001", href: "/drop/drop-001" },
  { label: "ANIME", href: "/anime" },
  { label: "ABOUT", href: "/about" },
  { label: "PROCESS", href: "/process" },
  { label: "STUDIO", href: "/studio" },
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
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-base-bg/90 backdrop-blur border-b border-base-border"
          : mobileSolid
            ? "max-md:bg-base-bg/95 max-md:backdrop-blur-md max-md:border-b max-md:border-base-border bg-transparent"
            : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-text-primary">
          FLIPMEET STUDIO
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8 text-xs tracking-widest text-text-secondary">
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
          {/* Cart link */}
          <a
            href="/cart"
            className={`relative text-xs tracking-widest border rounded-full px-4 py-2 text-text-primary transition-colors ${
              cartBump
                ? "border-accent text-accent"
                : "border-base-border hover:border-text-secondary"
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

      {/* Mobile slide-out drawer menu */}
      {mobileMenuOpen && (
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
                FLIPMEET STUDIO © 2026. BUILT FOR THE CULTURE.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
