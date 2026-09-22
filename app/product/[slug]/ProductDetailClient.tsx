"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/products";

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M"
  );
  const [added, setAdded] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const items = useCartStore((s) => s.items);
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

  const handleProceedToCheckout = () => {
    const alreadyInCart = items.some(
      (item) => item.lookId === product.id && item.size === selectedSize
    );
    if (!alreadyInCart) {
      addItem({
        lookId: product.id,
        name: product.name,
        size: selectedSize,
        price: product.price || 18500,
        quantity: 1,
      });
    }
    router.push("/checkout");
  };

  const imageSrc =
    product.images && product.images.length > 0
      ? product.images[0]
      : `/images/looks/${product.id}.jpg`;

  return (
    <div>
      {/* Add-to-cart toast */}
      {added && (
        <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 animate-toast-in pointer-events-none">
          <div className="flex items-center gap-2.5 rounded-full border border-accent/40 bg-base-surface px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-text-primary shadow-lg shadow-accent/10 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-accent animate-pulse" />
            Added to bag &mdash; {selectedSize}
          </div>
        </div>
      )}

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
              <div className="relative h-full w-full flex items-end justify-center">
                <Image
                  src={imageSrc}
                  alt={`${product.name} — ${product.description}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain object-bottom"
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
                          ? "border-accent bg-accent text-text-primary"
                          : "border-base-border bg-base-surface text-text-secondary hover:border-text-secondary hover:text-text-primary"
                      }`}
                      style={selectedSize === sz ? { boxShadow: "0 0 12px rgb(var(--accent) / 0.4)" } : undefined}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock status & Delivery window */}
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
                  <span className="text-text-primary font-bold">20-30 OCT 2026</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full rounded-sm bg-accent py-4 text-xs font-bold uppercase tracking-[0.2em] text-text-primary hover:bg-accent-dim transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                >
                  {added ? "✓ ADDED TO BAG" : "ADD TO BAG"}
                </button>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="block w-full rounded-sm border border-base-border bg-base-surface py-3.5 text-center text-xs font-bold uppercase tracking-widest text-text-primary hover:border-text-secondary transition-colors"
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>

              {/* Spec & Craft details */}
              <div className="space-y-3 pt-4 border-t border-base-border text-xs text-text-secondary">
                <p className="font-bold text-text-primary uppercase tracking-widest text-[11px]">
                  GARMENT CRAFT SPECIFICATIONS
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-text-secondary">
                  <li>Heavyweight 280 GSM custom milled combed cotton &amp; selvedge denim blends</li>
                  <li>Architectural drop-shoulder silhouette with raw edge hems</li>
                  <li>Individually numbered label inside each chapter piece (1 of 100)</li>
                  <li>Ships in custom matte black FlipMeet Studio archive box with authentication certificate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* AI Try-On */}
        <section className="mt-20 border-t border-base-border pt-10" aria-labelledby="ai-try-on-heading">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
            AI TRY-ON // SEE IT ON YOU
          </p>
          <div className="rounded-sm border border-base-border bg-base-surface p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <h2 id="ai-try-on-heading" className="font-display text-2xl font-bold uppercase tracking-tight text-text-primary">
                  Preview your look
                </h2>
                <p className="mt-2 text-sm tracking-wide text-text-secondary">
                  Upload a photo to see {product.name} styled on you.
                </p>

                <div className="mt-6 rounded-sm border border-base-border bg-base-bg/50 p-4 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="uppercase tracking-widest text-text-secondary">Selected look</span>
                    <span className="font-bold uppercase tracking-widest text-text-primary">{product.name}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="uppercase tracking-widest text-text-secondary">Selected size</span>
                    <span className="font-bold uppercase tracking-widest text-accent">{selectedSize}</span>
                  </div>
                </div>

                <label className="mt-6 block text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                  UPLOAD YOUR PHOTO
                  <span className="mt-2 block cursor-pointer rounded-sm border border-dashed border-base-border px-6 py-10 text-center normal-case tracking-normal transition-colors hover:border-text-secondary">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          event.target.value = "";
                          setFileName("File exceeds 10MB");
                          return;
                        }
                        setFileName(file.name);
                      }}
                    />
                    <span className="text-sm font-medium text-text-primary">
                      {fileName ?? "Click to upload"}
                    </span>
                    <span className="mt-1 block text-xs font-normal text-text-secondary">
                      JPG, PNG, WEBP (Max 10MB)
                    </span>
                  </span>
                </label>

                <button
                  type="button"
                  disabled={!fileName || fileName === "File exceeds 10MB"}
                  className="mt-6 flex w-full items-center justify-center rounded-sm bg-accent py-4 text-xs font-bold uppercase tracking-[0.2em] text-text-primary shadow-lg shadow-accent/20 transition-colors hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-40"
                >
                  GENERATE TRY-ON
                </button>
              </div>

              <div className="flex min-h-[320px] items-center justify-center rounded-sm border border-base-border bg-base-bg p-8 text-center lg:min-h-0">
                <div>
                  <p className="text-sm text-text-secondary">Try-on result preview</p>
                  <p className="mt-3 text-xs text-text-secondary">
                    AI results may vary, for reference only
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
