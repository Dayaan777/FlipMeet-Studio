"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/products";

export default function ProductDetailClient({
 product,
 pieces = [],
 variants = [],
}: {
 product: Product;
 pieces?: Product[];
 variants?: Product[];
}) {
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
   image: product.images?.[0] || "/images/products/stwd-shirt.png",
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
    image: product.images?.[0] || "/images/products/stwd-shirt.png",
   });
  }
  router.push("/checkout");
 };

 const imageSrc =
  product.images && product.images.length > 0
   ? product.images[0]
   : `/images/looks/${product.id}.jpg`;

 const filteredPieces = pieces.filter(
  (p) => !variants.some((v) => v.id === p.id)
 );

 return (
  <div>
   {/* Add-to-cart toast */}
   {added && (
    <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 animate-toast-in pointer-events-none">
     <div className="flex items-center gap-2.5 rounded-full border border-accent/40 bg-base-surface px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-text-primary shadow-lg shadow-accent/10 backdrop-blur-sm">
      <span className="size-2 rounded-full bg-accent animate-pulse" />
      Added to bag {selectedSize}
     </div>
    </div>
   )}

   <main className="mx-auto max-w-7xl px-6 pt-28 pb-20">
    {/* Breadcrumb */}
    <nav
     className="mb-8 flex items-center gap-2 text-[10px] tracking-widest uppercase text-text-secondary"
     aria-label="Breadcrumb"
    >
     <Link href="/" className="hover:text-text-primary transition-colors">
      HOME
     </Link>
     <span>/</span>
     <Link href="/shop" className="hover:text-text-primary transition-colors">
      SHOP
     </Link>
     <span>/</span>
     <span className="text-accent font-bold">{product.name}</span>
    </nav>

    {/* Product Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
     {/* Left Column: Image Stage */}
     <div className="lg:col-span-7">
      <div className="relative aspect-[3/4] w-full rounded-sm border border-base-border bg-base-surface/40 p-8 flex items-end justify-center overflow-hidden">
       {/* Subtle radial glow */}
       <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
         background:
          "radial-gradient(ellipse at 50% 90%, rgb(var(--accent) / 0.15) 0%, transparent 70%)",
        }}
       />

       <Image
        src={imageSrc}
        alt={`${product.name} ${product.description}`}
        fill
        priority
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="object-contain object-bottom p-6"
       />

       {/* Status pill overlay */}
       <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-base-border bg-base-bg/80 px-3 py-1 text-[10px] tracking-widest text-text-secondary uppercase backdrop-blur-sm">
        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        PRE-ORDER OPEN
       </div>

       <div className="absolute top-4 right-4 rounded-full border border-base-border bg-base-bg/80 px-3 py-1 text-[10px] tracking-widest text-accent uppercase font-bold backdrop-blur-sm">
        {product.category || "LIMITED ARCHIVE"}
       </div>
      </div>
     </div>

     {/* Right Column: Product Details & Purchase Controls */}
     <div className="lg:col-span-5 flex flex-col justify-between">
      <div className="space-y-6">
       {/* Title & Price */}
       <div>
        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
         <span>FLIPMEET STUDIO</span>
         <span>{"//"}</span>
         <span>{product.category || "DROP 001"}</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-text-primary">
         {product.name}
        </h1>
        <p className="font-display text-2xl font-bold text-accent mt-2">
         PKR {Number(product.price).toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-3 leading-relaxed">
         {product.description}
        </p>
       </div>

       {/* Size Selector */}
       <div className="space-y-3 pt-2 border-t border-base-border">
        <div className="flex items-center justify-between text-xs">
         <span className="text-text-secondary uppercase tracking-wider">Select Size</span>
         <span className="text-[10px] text-accent font-bold uppercase tracking-widest">
          Oversized Boxy Fit
         </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
         {(product.sizes || ["S", "M", "L", "XL"]).map((sz) => (
          <button
           key={sz}
           type="button"
           onClick={() => setSelectedSize(sz)}
           className={`py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 rounded-sm border ${
            selectedSize === sz
             ? "border-accent bg-accent/15 text-accent shadow-sm"
             : "border-base-border bg-base-surface text-text-secondary hover:border-text-secondary hover:text-text-primary"
           }`}
           style={
            selectedSize === sz
             ? { boxShadow: "0 0 12px rgb(var(--accent) / 0.4)" }
             : undefined
           }
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
         {product.specs && product.specs.length > 0 ? (
          product.specs.map((spec, i) => <li key={i}>{spec}</li>)
         ) : (
          <>
           <li>Heavyweight 280 GSM custom milled combed cotton &amp; selvedge denim blends</li>
           <li>Architectural drop-shoulder silhouette with raw edge hems</li>
           <li>Individually numbered label inside each chapter piece (1 of 100)</li>
           <li>Ships in custom matte black FlipMeet Studio archive box with authentication certificate</li>
          </>
         )}
        </ul>
       </div>
      </div>
     </div>
    </div>

    {/* Variants / Other Colors */}
    {variants && variants.length > 0 && (
     <section className="mt-16 border-t border-base-border pt-12" aria-labelledby="variants-heading">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
       <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
         AVAILABLE IN
        </p>
        <h2 id="variants-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-text-primary mt-1">
         Other Colors
        </h2>
       </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       {variants.map((variant) => {
        const img =
         variant.images && variant.images.length > 0
          ? variant.images[0]
          : `/images/looks/${variant.id}.jpg`;
        return (
         <Link
          key={variant.id}
          href={`/product/${variant.id}`}
          className="group rounded-sm border border-base-border bg-base-surface/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-base-surface flex flex-col justify-between"
         >
          <div>
           <div className="flex items-center justify-between text-[10px] tracking-widest uppercase text-text-secondary mb-3">
            <span className="font-bold text-accent">{variant.category}</span>
            <span>1 OF 100</span>
           </div>

           <div className="relative aspect-[3/4] w-full overflow-hidden flex items-end justify-center my-3">
            <Image
             src={img}
             alt={variant.name}
             fill
             sizes="(min-width: 1024px) 33vw, 50vw"
             className="object-contain object-bottom transition-all duration-500 group-hover:scale-105 group-hover:[filter:drop-shadow(0_0_20px_rgb(var(--accent)/0.35))]"
            />
           </div>
          </div>

          <div className="border-t border-base-border/70 pt-3 mt-2">
           <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary group-hover:text-accent transition-colors line-clamp-1">
             {variant.name}
            </h3>
            <span className="font-display text-xs font-bold text-accent">
             PKR {Number(variant.price).toLocaleString()}
            </span>
           </div>
          </div>
         </Link>
        );
       })}
      </div>
     </section>
    )}

    {/* Shop the Pieces / Components of the Set */}
    {filteredPieces && filteredPieces.length > 0 && (
     <section className="mt-16 border-t border-base-border pt-12" aria-labelledby="shop-pieces-heading">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
       <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
         COMPLETE THE LOOK {"//"} PIECES
        </p>
        <h2 id="shop-pieces-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-text-primary mt-1">
         Shop the pieces
        </h2>
       </div>
       <p className="text-xs text-text-secondary max-w-sm">
        Each component of this look is crafted to stand alone. Available individually in limited quantities.
       </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       {filteredPieces.map((piece) => {
        const img =
         piece.images && piece.images.length > 0
          ? piece.images[0]
          : `/images/looks/${piece.id}.jpg`;
        return (
         <Link
          key={piece.id}
          href={`/product/${piece.id}`}
          className="group rounded-sm border border-base-border bg-base-surface/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-base-surface flex flex-col justify-between"
         >
          <div>
           <div className="flex items-center justify-between text-[10px] tracking-widest uppercase text-text-secondary mb-3">
            <span className="font-bold text-accent">{piece.category}</span>
            <span>1 OF 100</span>
           </div>

           <div className="relative aspect-[3/4] w-full overflow-hidden flex items-end justify-center my-3">
            <Image
             src={img}
             alt={piece.name}
             fill
             sizes="(min-width: 1024px) 33vw, 50vw"
             className="object-contain object-bottom transition-all duration-500 group-hover:scale-105 group-hover:[filter:drop-shadow(0_0_20px_rgb(var(--accent)/0.35))]"
            />
           </div>
          </div>

          <div className="border-t border-base-border/70 pt-3 mt-2">
           <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary group-hover:text-accent transition-colors">
             {piece.name}
            </h3>
            <span className="font-display text-xs font-bold text-accent">
             PKR {Number(piece.price).toLocaleString()}
            </span>
           </div>
           <p className="text-[11px] text-text-secondary mt-1 truncate">
            {piece.description}
           </p>
           <div className="mt-3 flex items-center justify-between text-[10px] tracking-widest text-text-secondary uppercase">
            <span>Sizes: {piece.sizes.join(" · ")}</span>
            <span className="font-bold text-text-primary group-hover:text-accent transition-colors">
             VIEW PIECE &rarr;
            </span>
           </div>
          </div>
         </Link>
        );
       })}
      </div>
     </section>
    )}

    {/* AI Try-On */}
    <section className="hidden md:block mt-20 border-t border-base-border pt-10" aria-labelledby="ai-try-on-heading">
     <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
      AI TRY-ON {"//"} SEE IT ON YOU
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
