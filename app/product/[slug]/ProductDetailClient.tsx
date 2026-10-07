"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/products";
import { parseSizeVariants } from "@/lib/products";
import ReferralSection from "@/components/ReferralSection";
import { getDiscountedPrice } from "@/lib/referral-utils";

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

 // Parse size variants (supports both legacy plain sizes and new JSON-serialized variants)
 const sizeVariants = useMemo(() => parseSizeVariants(product.sizes || []), [product.sizes]);

 // Find the default size: use isDefault, or first available in-stock, or first
 const defaultSize = useMemo(() => {
  const defaultVariant = sizeVariants.find(v => v.isDefault && v.stock > 0);
  if (defaultVariant) return defaultVariant.size;
  const firstInStock = sizeVariants.find(v => v.stock > 0);
  if (firstInStock) return firstInStock.size;
  return sizeVariants[0]?.size || "M";
 }, [sizeVariants]);

 const [selectedSize, setSelectedSize] = useState(defaultSize);
 const [selectedWaist, setSelectedWaist] = useState("30");
 const [added, setAdded] = useState(false);
 const [soldOutError, setSoldOutError] = useState(false);
 const [showMobileSizeGuide, setShowMobileSizeGuide] = useState(false);
 const [showDesktopSizeGuide, setShowDesktopSizeGuide] = useState(false);
 const [fileName, setFileName] = useState<string | null>(null);
 const items = useCartStore((s) => s.items);
 const addItem = useCartStore((s) => s.addItem);
 const { referralCode, referralDiscountPct, referralCategories } = useCartStore();

 // Referral discount for this product
 const { discountedPrice: referralDiscountedPrice, hasDiscount: hasReferralDiscount } =
  getDiscountedPrice(
   Number(product.price),
   product.category,
   referralCode,
   referralDiscountPct,
   referralCategories
  );

 const isOutfit = product.category?.toLowerCase().includes("outfit");
 const isPants = (product.category?.toLowerCase().includes("pant") || product.category?.toLowerCase().includes("trouser")) && !isOutfit;
 const finalSize = (isPants || isOutfit) ? `${selectedSize} / ${selectedWaist}` : selectedSize;

 // Check stock for the currently selected size
 const selectedVariant = sizeVariants.find((v) => v.size === selectedSize);
 const availableStock = selectedVariant
  ? selectedVariant.stock
  : sizeVariants.length === 0
  ? (product.stock ?? 0)
  : 0;
 const isSelectedSoldOut = availableStock <= 0;

 const sizeLabel = (() => {
  const cat = product.category?.toLowerCase() || "";
  if (cat.includes("jersey")) return "Jersey Size";
  if (cat.includes("shirt")) return "Shirt Size";
  return "Select Size";
 })();

 const handleAddToCart = () => {
  const currentQtyInCart = items
   .filter((i) => i.lookId === product.id && i.size.split("/")[0].trim() === selectedSize)
   .reduce((sum, i) => sum + i.quantity, 0);

  if (availableStock <= 0 || currentQtyInCart + 1 > availableStock) {
   setSoldOutError(true);
   setTimeout(() => setSoldOutError(false), 3500);
   return;
  }

  setSoldOutError(false);
  addItem({
   lookId: product.id,
   name: product.name,
   size: finalSize,
   price: product.price || 18500,
   oldPrice: product.old_price,
   quantity: 1,
   image: product.images?.[0] || "/images/products/stwd-shirt.png",
   category: product.category,
   maxStock: availableStock,
  });
  setAdded(true);
  setTimeout(() => setAdded(false), 2500);
 };

 const handleProceedToCheckout = () => {
  const currentQtyInCart = items
   .filter((i) => i.lookId === product.id && i.size.split("/")[0].trim() === selectedSize)
   .reduce((sum, i) => sum + i.quantity, 0);

  const alreadyInCart = items.some(
   (item) => item.lookId === product.id && item.size === finalSize
  );

  const targetQty = alreadyInCart ? currentQtyInCart : currentQtyInCart + 1;

  if (availableStock <= 0 || targetQty > availableStock) {
   setSoldOutError(true);
   setTimeout(() => setSoldOutError(false), 3500);
   return;
  }

  setSoldOutError(false);
  if (!alreadyInCart) {
   addItem({
    lookId: product.id,
    name: product.name,
    size: finalSize,
    price: product.price || 18500,
    oldPrice: product.old_price,
    quantity: 1,
    image: product.images?.[0] || "/images/products/stwd-shirt.png",
    category: product.category,
    maxStock: availableStock,
   });
  }
  router.push("/checkout");
 };

 // Resolve Cover Image
 const coverImage = useMemo(() => {
  return product.cover_image || product.images?.[0] || `/images/looks/${product.id}.jpg`;
 }, [product.cover_image, product.images, product.id]);

 // Resolve Secondary Images: from product.secondary_images (if non-empty) or product.images.slice(1) (if length > 1). Deduplicate and exclude coverImage.
 const secondaryImages = useMemo(() => {
  const raw =
   product.secondary_images && product.secondary_images.length > 0
    ? product.secondary_images
    : product.images && product.images.length > 1
    ? product.images.slice(1)
    : [];
  return Array.from(new Set(raw.filter(Boolean))).filter((img) => img !== coverImage);
 }, [product.secondary_images, product.images, coverImage]);

 // Combined gallery images with cover image first
 const allGalleryImages = useMemo(() => {
  return [coverImage, ...secondaryImages];
 }, [coverImage, secondaryImages]);

 const hasSecondaryImages = secondaryImages.length > 0;
 const [activeImageIndex, setActiveImageIndex] = useState(0);

 // Reset active image index when product ID changes
 useEffect(() => {
  setActiveImageIndex(0);
 }, [product.id]);

 const activeImageSrc = allGalleryImages[activeImageIndex] || coverImage;

 const handlePrevImage = () => {
  setActiveImageIndex((prev) => (prev - 1 + allGalleryImages.length) % allGalleryImages.length);
 };

 const handleNextImage = () => {
  setActiveImageIndex((prev) => (prev + 1) % allGalleryImages.length);
 };

 // Touch swipe handling for mobile (40px threshold)
 const touchStartX = useRef<number | null>(null);
 const touchStartY = useRef<number | null>(null);

 const handleTouchStart = (e: React.TouchEvent) => {
  touchStartX.current = e.touches[0].clientX;
  touchStartY.current = e.touches[0].clientY;
 };

 const handleTouchEnd = (e: React.TouchEvent) => {
  if (touchStartX.current === null || touchStartY.current === null) return;
  const diffX = e.changedTouches[0].clientX - touchStartX.current;
  const diffY = e.changedTouches[0].clientY - touchStartY.current;
  if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
   if (diffX < 0) {
    handleNextImage(); // Swipe left -> next
   } else {
    handlePrevImage(); // Swipe right -> prev
   }
  }
  touchStartX.current = null;
  touchStartY.current = null;
 };

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
      <div
       className="relative aspect-[3/4] w-full rounded-sm border border-base-border bg-base-surface/40 p-8 flex items-end justify-center overflow-hidden select-none"
       onTouchStart={hasSecondaryImages ? handleTouchStart : undefined}
       onTouchEnd={hasSecondaryImages ? handleTouchEnd : undefined}
      >
       {/* Subtle radial glow */}
       <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
         background:
          "radial-gradient(ellipse at 50% 90%, rgb(var(--accent) / 0.15) 0%, transparent 70%)",
        }}
       />

       <Image
        key={activeImageSrc}
        src={activeImageSrc}
        alt={`${product.name} ${product.description}`}
        fill
        priority={activeImageIndex === 0}
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="object-contain object-bottom p-6 transition-opacity duration-300"
       />

       {/* Navigation Chevrons (Only if secondary images exist) */}
       {hasSecondaryImages && (
        <>
         <button
          type="button"
          onClick={handlePrevImage}
          aria-label="Previous image"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-base-border bg-base-bg/80 text-text-secondary hover:text-text-primary hover:border-accent backdrop-blur-sm transition-all"
         >
          ←
         </button>
         <button
          type="button"
          onClick={handleNextImage}
          aria-label="Next image"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-base-border bg-base-bg/80 text-text-secondary hover:text-text-primary hover:border-accent backdrop-blur-sm transition-all"
         >
          →
         </button>
        </>
       )}

       {/* Counter Badge (Only if secondary images exist) */}
       {hasSecondaryImages && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-base-border bg-base-bg/85 px-3 py-1 text-[10px] font-mono tracking-widest text-text-secondary uppercase backdrop-blur-sm">
         <span className="text-accent font-bold">{activeImageIndex + 1}</span> / <span>{allGalleryImages.length}</span>
        </div>
       )}

       {/* Status pill overlay */}
       <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-base-border bg-base-bg/80 px-3 py-1 text-[10px] tracking-widest text-text-secondary uppercase backdrop-blur-sm">
        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
       </div>

       <div className="absolute top-4 right-4 rounded-full border border-base-border bg-base-bg/80 px-3 py-1 text-[10px] tracking-widest text-accent uppercase font-bold backdrop-blur-sm">
        {product.category || "LIMITED ARCHIVE"}
       </div>
      </div>

      {/* Thumbnail Strip: STRICT CONDITIONAL COLLAPSE — 0 gap when hasSecondaryImages is false */}
      {hasSecondaryImages && (
       <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-thin scrollbar-thumb-base-border/50">
        {allGalleryImages.map((img, idx) => (
         <button
          key={`${img}-${idx}`}
          type="button"
          onClick={() => setActiveImageIndex(idx)}
          aria-label={`View image ${idx + 1} of ${allGalleryImages.length}`}
          aria-current={activeImageIndex === idx ? "true" : undefined}
          className={`relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 rounded-sm border overflow-hidden cursor-pointer transition-all duration-200 bg-base-surface/60 ${
           activeImageIndex === idx
            ? "border-accent shadow-[0_0_12px_rgb(var(--accent)/0.35)] scale-102 ring-1 ring-accent/60 opacity-100"
            : "border-base-border opacity-60 hover:opacity-100 hover:border-text-secondary"
          }`}
         >
          <Image
           src={img}
           alt={`${product.name} view ${idx + 1}`}
           fill
           sizes="(max-width: 640px) 64px, 80px"
           className="object-contain object-center p-1.5"
          />
         </button>
        ))}
       </div>
      )}
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
         <div className="flex items-center gap-3 mt-2 flex-wrap">
          {hasReferralDiscount ? (
           <>
            <p className="font-display text-2xl font-bold text-accent">
             PKR {referralDiscountedPrice.toLocaleString()}
            </p>
            <p className="font-display text-base text-text-secondary line-through">
             PKR {Number(product.price).toLocaleString()}
            </p>
           </>
          ) : (
           <>
            <p className="font-display text-2xl font-bold text-accent">
             PKR {Number(product.price).toLocaleString()}
            </p>
            {product.old_price && product.old_price > product.price && (
             <p className="font-display text-base text-text-secondary line-through">
              PKR {Number(product.old_price).toLocaleString()}
             </p>
            )}
           </>
          )}
         </div>
        <p className="text-xs text-text-secondary mt-3 leading-relaxed">
         {product.description}
        </p>
       </div>

       {/* Size Selector */}
       <div className="space-y-3 pt-2 mt-4">
        
        {!isPants && (
         <>
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
         </>
        )}

        {!isPants && (
         <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary uppercase tracking-widest">{sizeLabel}</span>
          <span className="text-[10px] text-accent font-bold uppercase tracking-widest">
           Oversized Boxy Fit
          </span>
         </div>
        )}

        {(!isPants || isOutfit) && (
        <div className="grid grid-cols-5 gap-2.5">
         {sizeVariants.length > 0 ? sizeVariants.map((variant) => {
          const isOOS = variant.stock <= 0;
          return (
           <button
            key={variant.size}
            type="button"
            onClick={() => {
             setSelectedSize(variant.size);
             if (variant.stock <= 0) {
              setSoldOutError(true);
             } else {
              setSoldOutError(false);
             }
            }}
            title={isOOS ? "Sold out" : undefined}
            className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-sm border relative cursor-pointer ${
             selectedSize === variant.size
              ? isOOS
                ? "border-red-500/60 bg-red-500/10 text-red-400 line-through shadow-sm"
                : "border-accent bg-accent/15 text-accent shadow-sm"
              : isOOS
              ? "border-base-border/40 bg-base-bg/40 text-text-secondary/40 line-through hover:border-base-border"
              : "border-base-border bg-base-surface text-text-secondary hover:border-text-secondary hover:text-text-primary"
            }`}
            style={
             selectedSize === variant.size && !isOOS
              ? { boxShadow: "0 0 12px rgb(var(--accent) / 0.4)" }
              : undefined
            }
           >
            {variant.size}
            {isOOS && <span className="absolute -top-1 -right-1 size-2 rounded-full bg-red-500 border border-base-bg" title="Sold out" />}
           </button>
          );
         }) : ([...new Set([...(product.sizes || ["S", "M", "L", "XL"])])]).map((sz) => (
          <button
           key={sz}
           type="button"
           onClick={() => {
            setSelectedSize(sz);
            setSoldOutError(false);
           }}
           className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-sm border cursor-pointer ${
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
        )}

        {/* Waist Size Options for Pants/Trousers/Outfits */}
        {(isPants || isOutfit) && (
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

       {/* Stock status */}
       <div className="rounded-sm border border-base-border bg-base-surface/60 p-4 text-xs">
        <div className="flex items-center justify-between">
         <span className="text-text-secondary uppercase tracking-widest">Availability</span>
         {isSelectedSoldOut ? (
          <span className="text-red-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
           <span className="size-1.5 rounded-full bg-red-400" />
           SOLD OUT
          </span>
         ) : (
          <span className="text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
           <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
           {selectedVariant ? `${selectedVariant.stock} PIECES LEFT` : `${product.stock} PIECES ALLOCATED`}
          </span>
         )}
        </div>
       </div>

       {/* Sold-out error message */}
       {soldOutError && (
        <div
         role="alert"
         className="rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-400 font-medium animate-in fade-in duration-200"
        >
         out of stock please choose a different size
        </div>
       )}

       {/* Action Buttons */}
       <div className="space-y-3">
        <button
         type="button"
         onClick={handleAddToCart}
         className={`w-full rounded-sm py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 ${
          isSelectedSoldOut
           ? "bg-base-surface border border-base-border text-text-secondary cursor-not-allowed"
           : "bg-accent hover:bg-accent-dim text-text-primary shadow-lg shadow-accent/20"
         }`}
        >
         {added ? "✓ ADDED TO BAG" : isSelectedSoldOut ? "SIZE SOLD OUT" : "ADD TO BAG"}
        </button>

        <button
         type="button"
         onClick={handleProceedToCheckout}
         className={`block w-full rounded-sm border py-3.5 text-center text-xs font-bold uppercase tracking-widest transition-colors ${
          isSelectedSoldOut
           ? "border-base-border/40 text-text-secondary/40 cursor-not-allowed"
           : "border-base-border bg-base-surface text-text-primary hover:border-text-secondary"
         }`}
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

       {/* Referral Code — below Garment Craft Specifications */}
       <div className="pt-4 border-t border-base-border">
        <ReferralSection
         className="w-full"
         title="REFERRAL CODE"
         subtitle="Have a referral code? Enter it below to apply it."
         formLayout="col"
        />
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
           <div className="mt-3 flex items-center justify-end text-[10px] tracking-widest text-text-secondary uppercase">
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
