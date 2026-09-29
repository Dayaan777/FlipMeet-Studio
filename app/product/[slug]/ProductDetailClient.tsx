"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/products";

const SizeChartTable = () => (
  <div className="w-full text-[10px] sm:text-xs">
    <div className="bg-accent text-black font-bold uppercase tracking-widest grid grid-cols-5 rounded-t-sm">
      <div className="p-2 text-center">Size</div>
      <div className="p-2 text-center">Chest</div>
      <div className="p-2 text-center">Length</div>
      <div className="p-2 text-center">Sleeve</div>
      <div className="p-2 text-center">Armhole</div>
    </div>
    <div className="border border-base-border border-t-0 rounded-b-sm bg-base-surface divide-y divide-base-border/50">
      {[
        { size: "S", chest: '19"', length: '24"', sleeve: '10"', armhole: '9"' },
        { size: "M", chest: '20"', length: '25.5"', sleeve: '11"', armhole: '10"' },
        { size: "L", chest: '21"', length: '26.5"', sleeve: '12"', armhole: '10.5"' },
        { size: "XL", chest: '22"', length: '27.5"', sleeve: '13"', armhole: '11"' },
        { size: "2XL", chest: '24.5"', length: '29"', sleeve: '14"', armhole: '12"' },
      ].map((row) => (
        <div key={row.size} className="grid grid-cols-5 text-text-primary text-center font-medium">
          <div className="p-2 font-bold text-accent border-r border-base-border/50">{row.size}</div>
          <div className="p-2 border-r border-base-border/50">{row.chest}</div>
          <div className="p-2 border-r border-base-border/50">{row.length}</div>
          <div className="p-2 border-r border-base-border/50">{row.sleeve}</div>
          <div className="p-2">{row.armhole}</div>
        </div>
      ))}
    </div>
  </div>
);

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
 const [selectedWaist, setSelectedWaist] = useState("30");
 const [added, setAdded] = useState(false);
 const [showMobileSizeGuide, setShowMobileSizeGuide] = useState(false);
 const [showDesktopSizeGuide, setShowDesktopSizeGuide] = useState(false);
 const [fileName, setFileName] = useState<string | null>(null);
 const items = useCartStore((s) => s.items);
 const addItem = useCartStore((s) => s.addItem);

 const isPants = product.category?.toLowerCase().includes("pant") || product.category?.toLowerCase().includes("trouser") || product.category?.toLowerCase().includes("outfit");
 const finalSize = isPants ? `${selectedSize} / ${selectedWaist}` : selectedSize;

 const sizeLabel = (() => {
  const cat = product.category?.toLowerCase() || "";
  if (cat.includes("jersey")) return "Jersey Size";
  if (cat.includes("shirt")) return "Shirt Size";
  return "Select Size";
 })();

 const handleAddToCart = () => {
  addItem({
   lookId: product.id,
   name: product.name,
   size: finalSize,
   price: product.price || 18500,
   quantity: 1,
   image: product.images?.[0] || "/images/products/stwd-shirt.png",
  });
  setAdded(true);
  setTimeout(() => setAdded(false), 2500);
 };

 const handleProceedToCheckout = () => {
  const alreadyInCart = items.some(
   (item) => item.lookId === product.id && item.size === finalSize
  );
  if (!alreadyInCart) {
   addItem({
    lookId: product.id,
    name: product.name,
    size: finalSize,
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
         <span>{product.category }</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-widest text-text-primary">
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
       <div className="space-y-3 pt-2 mt-4">
        
        {/* Size Guide Trigger */}
        <div className="mb-4">
          {/* Mobile Button (opens modal) */}
          <button 
            type="button" 
            onClick={() => setShowMobileSizeGuide(true)}
            className="md:hidden flex items-center justify-center w-full rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:border-accent transition-colors gap-2"
          >
            <span>📏</span> SIZE GUIDE
          </button>
          
          {/* Desktop Accordion Trigger */}
          <button 
            type="button" 
            onClick={() => setShowDesktopSizeGuide(!showDesktopSizeGuide)}
            className="hidden md:flex items-center justify-between w-full rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <span>📏</span> SIZE GUIDE
            </div>
            <span className="text-text-secondary font-mono">{showDesktopSizeGuide ? "−" : "+"}</span>
          </button>

          {/* Desktop Inline Chart */}
          {showDesktopSizeGuide && (
            <div className="hidden md:block mt-3 animate-in fade-in slide-in-from-top-2">
              <SizeChartTable />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
         <span className="text-text-secondary uppercase tracking-widest">{sizeLabel}</span>
         <span className="text-[10px] text-accent font-bold uppercase tracking-widest">
          {isPants ? "Relaxed Fit" : "Oversized Boxy Fit"}
         </span>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
         {([...new Set([...(product.sizes || ["S", "M", "L", "XL"]), "2XL"])]).map((sz) => (
          <button
           key={sz}
           type="button"
           onClick={() => setSelectedSize(sz)}
           className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-sm border ${
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

        {/* Waist Size Options for Pants/Trousers */}
        {isPants && (
         <div className="pt-3">
          <div className="flex items-center justify-between text-xs mb-3">
           <span className="text-text-secondary uppercase tracking-widest">Select Waist Size</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
           {["28", "30", "32", "34", "36"].map((sz) => (
            <button
             key={sz}
             type="button"
             onClick={() => setSelectedWaist(sz)}
             className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-sm border ${
              selectedWaist === sz
               ? "border-accent bg-accent/15 text-accent shadow-sm"
               : "border-base-border bg-base-surface text-text-secondary hover:border-text-secondary hover:text-text-primary"
             }`}
             style={
              selectedWaist === sz
               ? { boxShadow: "0 0 12px rgb(var(--accent) / 0.4)" }
               : undefined
             }
            >
             {sz}
            </button>
           ))}
          </div>
         </div>
        )}
       </div>

       {/* Stock status & Delivery window */}
       <div className="rounded-sm border border-base-border bg-base-surface/60 p-4 text-xs space-y-2">
        <div className="flex items-center justify-between">
         <span className="text-text-secondary uppercase tracking-widest">Availability</span>
         <span className="text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {product.stock > 0 ? `${product.stock} PIECES ALLOCATED` : "SOLD OUT"}
         </span>
        </div>
        <div className="flex items-center justify-between">
         <span className="text-text-secondary uppercase tracking-widest">Delivery Window</span>
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
        <h2 id="variants-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-widest text-text-primary mt-1">
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
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-text-primary group-hover:text-accent transition-colors line-clamp-1">
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
        <h2 id="shop-pieces-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-widest text-text-primary mt-1">
         Shop the pieces
        </h2>
       </div>
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
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-text-primary group-hover:text-accent transition-colors">
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

    {/* AI Try-On — HIDDEN. Uncomment section below to restore. */}
    {null /* AI_TRYON_PLACEHOLDER */}
   </main>

   {/* Mobile Size Guide Modal */}
   {showMobileSizeGuide && (
    <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
     <div className="w-full bg-base-surface border-t border-base-border rounded-t-xl p-6 pb-10 animate-in slide-in-from-bottom-8">
      <div className="flex items-center justify-between mb-6">
       <div>
        <h3 className="font-display text-xl font-bold uppercase tracking-wide text-text-primary">Size Guide</h3>
        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Find your perfect fit</p>
       </div>
       <button 
        onClick={() => setShowMobileSizeGuide(false)}
        className="text-text-secondary hover:text-text-primary text-xl p-2"
       >
        ✕
       </button>
      </div>
      <SizeChartTable />
      <button 
       onClick={() => setShowMobileSizeGuide(false)}
       className="w-full mt-6 rounded-sm bg-accent py-3.5 text-xs font-bold uppercase tracking-widest text-text-primary"
      >
       Close Guide
      </button>
     </div>
    </div>
   )}
  </div>
 );
}
