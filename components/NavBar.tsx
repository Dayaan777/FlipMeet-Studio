"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";

const LINKS = [
  { label: "DROP 001", href: "/drop/drop-001" },
  { label: "ABOUT", href: "/about" },
  { label: "PROCESS", href: "/process" },
  { label: "STUDIO", href: "/studio" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.items.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

        <ul className="hidden md:flex items-center gap-8 text-xs tracking-widest text-text-secondary">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="hover:text-text-primary transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="/cart"
            className="text-xs tracking-widest border border-base-border rounded-full px-4 py-2 text-text-primary hover:border-text-secondary transition-colors"
          >
            CART ({itemCount})
          </a>
          <button type="button" aria-label="Open menu" className="text-text-primary text-xl leading-none">
            ≡
          </button>
        </div>
      </nav>
    </header>
  );
}
