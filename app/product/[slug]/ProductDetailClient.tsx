"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/products";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M"
  );
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem({
      lookId: product.id,
      name: product.name,
      size: selectedSize,
      price: product.price || 18500,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const imageSrc = product.images && product.images.length > 0
    ? product.images[0]
    : `/images/looks/${product.id}.jpg`;

  return (
    <main className="min-h-screen bg-base-bg pt-28 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-xs tracking-widest text-text-secondary uppercase">
          <Link href="/" className="hover:text-text-primary transition-colors">
            HOME
          </Link>
          <span>/</span>
          <Link href="/drop/drop-001" className="hover:text-text-primary transition-colors">
            {product.category || "DROP 001"}
          </Link>
          <span>/</span>
          <span className="text-accent font-bold">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Image Display */}
          <div className="relative aspect-[3/4] w-full rounded-sm border border-base-border bg-base-surface overflow-hidden flex items-end justify-center p-6">
            <div className="absolute inset-0 bg-radial from-accent/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative h-full w-full flex items-end justify-center">
              <Image
                src={imageSrc}
                alt={`${product.name} — ${product.description}`}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain object-bottom drop-shadow-[0_0_30px_rgba(255,77,30,0.3)]"
              />
            </div>
            <div className="absolute top-4 left-4 rounded-full border border-base-border bg-base-bg/80 px-3 py-1 text-[10px] tracking-widest uppercase text-text-secondary backdrop-blur-sm">
              LIMITED EDITION // 100 UNITS
            </div>
          </div>

          {/* Product Details Column */}
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
                {product.category || "DROP 001"} // CHAPTER 01
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-text-primary mt-2">
                {product.name}
              </h1>
              <p className="text-sm text-text-secondary mt-2 tracking-wide">
                {product.description}
              </p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-2xl sm:text-3xl font-bold text-accent">
                  PKR {Number(product.price).toLocaleString()}
                </span>
                <span className="text-xs text-text-secondary tracking-widest uppercase">
                  COMPLIMENTARY NATIONWIDE SHIPPING
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="border-t border-b border-base-border py-6 space-y-3">
              <div className="flex justify-between text-xs tracking-widest uppercase">
                <span className="text-text-secondary">SELECT SIZE</span>
                <span className="text-text-primary font-bold">{selectedSize}</span>
              </div>
              <div className="flex gap-2.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all duration-200 ${
                      selectedSize === sz
                        ? "border-accent bg-accent text-text-primary shadow-[0_0_12px_rgba(255,77,30,0.4)]"
                        : "border-base-border bg-base-surface text-text-secondary hover:border-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock status & Pre-order window */}
            <div className="rounded-sm border border-base-border bg-base-surface/60 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary uppercase tracking-wider">Availability</span>
                <span className="text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {product.stock > 0 ? `${product.stock} PIECES ALLOCATED` : "SOLD OUT"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary uppercase tracking-wider">Delivery Window</span>
                <span className="text-text-primary font-bold">20–30 OCT 2026</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full rounded-sm bg-accent py-4 text-xs font-bold uppercase tracking-[0.2em] text-text-primary hover:bg-accent-dim transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
              >
                {added ? "✓ ADDED TO PRE-ORDER BAG" : "ADD TO PRE-ORDER BAG"}
              </button>

              <Link
                href="/cart"
                className="block w-full rounded-sm border border-base-border bg-base-surface py-3.5 text-center text-xs font-bold uppercase tracking-widest text-text-primary hover:border-text-secondary transition-colors"
              >
                PROCEED TO CHECKOUT →
              </Link>
            </div>

            {/* Spec & Craft details */}
            <div className="space-y-3 pt-4 border-t border-base-border text-xs text-text-secondary">
              <p className="font-bold text-text-primary uppercase tracking-widest text-[11px]">
                GARMENT CRAFT SPECIFICATIONS
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-text-secondary">
                <li>Heavyweight 280 GSM custom milled combed cotton & selvedge denim blends</li>
                <li>Architectural drop-shoulder silhouette with raw edge hems</li>
                <li>Individually numbered label inside each chapter piece (1 of 100)</li>
                <li>Ships in custom matte black FlipMeet Studio archive box with authentication certificate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
