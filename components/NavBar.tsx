"use client";

import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/lib/cart-store";
import { useAuthStore } from "@/lib/auth-store";

const LINKS = [
  { label: "DROP 001", href: "/drop/drop-001" },
  { label: "ABOUT", href: "/about" },
  { label: "PROCESS", href: "/process" },
  { label: "STUDIO", href: "/studio" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemCount = useCartStore((s) => s.items.length);
  const { user, isAuthenticated, logout } = useAuthStore();

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

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-base-bg/90 backdrop-blur border-b border-base-border" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
        <a href="/" className="font-display text-2xl font-bold tracking-tight text-text-primary">
          FLIPMEET STUDIO
        </a>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8 text-xs tracking-widest text-text-secondary">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="hover:text-text-primary transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions: Account + Cart + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {/* Account trigger / dropdown (Desktop) */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 text-xs tracking-widest border border-base-border rounded-full px-3.5 py-2 text-text-primary hover:border-text-secondary transition-colors"
                aria-expanded={accountMenuOpen}
                aria-label="User account menu"
              >
                <span className="size-2 rounded-full bg-accent" />
                <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                <span className="text-[9px] text-text-secondary">▾</span>
              </button>
            ) : (
              <a
                href="/login"
                className="text-xs tracking-widest border border-base-border rounded-full px-4 py-2 text-text-primary hover:border-text-secondary transition-colors"
              >
                ACCOUNT
              </a>
            )}

            {/* Dropdown Menu */}
            {accountMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-56 rounded-sm border border-base-border bg-base-surface/95 p-2 shadow-2xl backdrop-blur-md z-50">
                <div className="border-b border-base-border px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-primary truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">{user.email}</p>
                  <span className="mt-1 inline-block text-[9px] tracking-widest text-accent uppercase font-bold">
                    {user.role === "admin" ? "Studio Admin" : "Collector"}
                  </span>
                </div>

                <div className="py-1">
                  <a
                    href="/account"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block rounded-sm px-3 py-1.5 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    My Account
                  </a>
                  <a
                    href="/account#orders"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block rounded-sm px-3 py-1.5 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    My Pre-Orders
                  </a>
                  {user.role === "admin" && (
                    <a
                      href="/dashboard"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-sm px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent/10 transition-colors"
                    >
                      Admin Dashboard ⚡
                    </a>
                  )}
                </div>

                <div className="border-t border-base-border pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setAccountMenuOpen(false);
                    }}
                    className="w-full text-left rounded-sm px-3 py-1.5 text-xs text-text-secondary hover:bg-white/5 hover:text-accent transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart link */}
          <a
            href="/cart"
            className="text-xs tracking-widest border border-base-border rounded-full px-4 py-2 text-text-primary hover:border-text-secondary transition-colors"
          >
            CART ({itemCount})
          </a>

          {/* Mobile hamburger button */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-text-primary text-2xl leading-none px-1"
          >
            {mobileMenuOpen ? "✕" : "≡"}
          </button>
        </div>
      </nav>

      {/* Mobile slide-out drawer menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[73px] z-40 bg-base-bg/95 backdrop-blur-xl md:hidden border-t border-base-border animate-in fade-in duration-200">
          <div className="flex h-full flex-col justify-between p-6">
            <div className="space-y-6">
              {/* User badge on mobile */}
              {isAuthenticated && user ? (
                <div className="rounded-sm border border-base-border bg-base-surface/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-text-primary">
                        {user.name}
                      </p>
                      <p className="text-xs text-text-secondary">{user.email}</p>
                    </div>
                    <span className="text-[10px] tracking-widest text-accent uppercase font-bold">
                      {user.role === "admin" ? "Admin" : "Collector"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 rounded-sm border border-base-border bg-white/5 py-2 text-center text-xs tracking-widest text-text-primary"
                    >
                      ACCOUNT
                    </a>
                    {user.role === "admin" && (
                      <a
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 rounded-sm border border-accent/40 bg-accent/10 py-2 text-center text-xs font-bold tracking-widest text-accent"
                      >
                        DASHBOARD
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-sm border border-accent bg-accent/10 py-3 text-center text-xs font-bold tracking-widest text-accent hover:bg-accent hover:text-text-primary transition-colors"
                >
                  SIGN IN / REGISTER
                </a>
              )}

              {/* Navigation links */}
              <ul className="space-y-4 pt-4 text-sm font-display tracking-widest text-text-secondary">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block hover:text-text-primary transition-colors"
                  >
                    MY PRE-ORDERS
                  </a>
                </li>
                <li>
                  <a
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-accent/80 hover:text-accent transition-colors"
                  >
                    ADMIN DASHBOARD
                  </a>
                </li>
              </ul>
            </div>

            {/* Mobile drawer footer */}
            <div className="border-t border-base-border pt-4">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-xs tracking-widest text-text-secondary hover:text-accent transition-colors py-2"
                >
                  SIGN OUT
                </button>
              )}
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
