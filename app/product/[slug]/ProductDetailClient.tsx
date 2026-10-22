"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/products";
import { parseSizeVariants } from "@/lib/products";
import ReferralSection from "@/components/ReferralSection";
import ProductCard from "@/components/ProductCard";
import BrickCard from "@/components/BrickCard";
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

  // Parse size variants (supports both legacy plain sizes and JSON-serialized variants)
  const sizeVariants = useMemo(() => parseSizeVariants(product.sizes || []), [product.sizes]);
  const topVariants = useMemo(() => sizeVariants.filter((v) => v.type === "top" || !v.type), [sizeVariants]);
  const bottomVariants = useMemo(() => sizeVariants.filter((v) => v.type === "bottom"), [sizeVariants]);

  const defaultTopSize = useMemo(() => {
    const defaultVariant = topVariants.find((v) => v.isDefault && v.stock > 0);
    if (defaultVariant) return defaultVariant.size;
    const firstInStock = topVariants.find((v) => v.stock > 0);
    if (firstInStock) return firstInStock.size;
    return topVariants[0]?.size || "S";
  }, [topVariants]);

  const defaultBottomSize = useMemo(() => {
    const defaultVariant = bottomVariants.find((v) => v.isDefault && v.stock > 0);
    if (defaultVariant) return defaultVariant.size;
    const firstInStock = bottomVariants.find((v) => v.stock > 0);
    if (firstInStock) return firstInStock.size;
    return bottomVariants[0]?.size || "30";
  }, [bottomVariants]);

  const [selectedSize, setSelectedSize] = useState(defaultTopSize);
  const [selectedWaist, setSelectedWaist] = useState(defaultBottomSize);
  const [added, setAdded] = useState(false);
  const [soldOutError, setSoldOutError] = useState(false);
  const [showMobileSizeGuide, setShowMobileSizeGuide] = useState(false);
  const [showDesktopSizeGuide, setShowDesktopSizeGuide] = useState(false);
  const [showReferralAccordion, setShowReferralAccordion] = useState(false);
  const [showSpecsAccordion, setShowSpecsAccordion] = useState(false);

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

  const hasTop = topVariants.length > 0;
  const hasBottom = bottomVariants.length > 0;

  let finalSize = "";
  if (hasTop && hasBottom) finalSize = `${selectedSize} / ${selectedWaist}`;
  else if (hasBottom) finalSize = selectedWaist;
  else finalSize = selectedSize;

  const selectedTopVariant = topVariants.find((v) => v.size === selectedSize);
  const selectedBottomVariant = bottomVariants.find((v) => v.size === selectedWaist);

  let availableStock = 0;
  if (hasTop && hasBottom) {
    availableStock = Math.min(selectedTopVariant?.stock || 0, selectedBottomVariant?.stock || 0);
  } else if (hasBottom) {
    availableStock = selectedBottomVariant?.stock || 0;
  } else if (hasTop) {
    availableStock = selectedTopVariant?.stock || 0;
  } else {
    availableStock = product.stock ?? 0;
  }

  const isSelectedSoldOut = availableStock <= 0;

  const handleAddToCart = () => {
    const currentQtyInCart = items
      .filter((i) => i.lookId === product.id && i.size === finalSize)
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
      image: product.images?.[0] || "/images/products/anime-op-flame-outfit.png",
      category: product.category,
      maxStock: availableStock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleProceedToCheckout = () => {
    const currentQtyInCart = items
      .filter((i) => i.lookId === product.id && i.size === finalSize)
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
        image: product.images?.[0] || "/images/products/anime-op-flame-outfit.png",
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

  // Resolve Secondary Images: deduplicate and exclude coverImage
  const secondaryImages = useMemo(() => {
    // If it's anime-op-flame-outfit and has no DB secondary images, provide the 3 embedded look views
    if (product.id === "anime-op-flame-outfit") {
      const dbSec =
        product.secondary_images && product.secondary_images.length > 0
          ? product.secondary_images
          : product.images && product.images.length > 1
          ? product.images.slice(1)
          : [];
      if (!dbSec || dbSec.length === 0) {
        return [
          "/images/looks/thumb-op-1.png",
          "/images/looks/thumb-op-2.png",
          "/images/looks/thumb-op-3.png",
        ];
      }
    }
    const raw =
      product.secondary_images && product.secondary_images.length > 0
        ? product.secondary_images
        : product.images && product.images.length > 1
        ? product.images.slice(1)
        : [];
    return Array.from(new Set(raw.filter(Boolean))).filter((img) => img !== coverImage);
  }, [product.id, product.secondary_images, product.images, coverImage]);

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
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const filteredPieces = pieces.filter(
    (p) => !variants.some((v) => v.id === p.id)
  );

  return (
    <div className="pdp-wall pdp-page-container relative min-h-screen">
      {/* Add-to-cart toast */}
      {added && (
        <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 animate-toast-in pointer-events-none">
          <div className="flex items-center gap-2.5 rounded-full border border-accent/40 bg-base-surface px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-text-primary shadow-lg shadow-accent/10 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-accent animate-pulse" />
            Added to bag {finalSize}
          </div>
        </div>
      )}

      {/* Hero Section with Brutalist Concrete Backdrop & Slab Stage */}
      <section className="relative w-full overflow-hidden">
        {/* Architectural Backdrop starting at the top behind navbar down to concrete floor */}
        <div aria-hidden className="pdp-hero-backdrop" />

        {/* Subtle light scrim behind navbar */}
        <div aria-hidden className="pdp-navbar-scrim" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-18 lg:pt-20 pb-12 sm:pb-16">
          {/* Breadcrumb Navigation */}
          <nav
            className="mb-2 sm:mb-3 flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#e2ded9] drop-shadow-sm"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/shop" className="hover:text-white transition-colors">
              SHOP
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-accent font-bold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          {/* Hero Product Stage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Column: Outfit + Slab + Thumbnails */}
            <div className="lg:col-span-7 flex flex-col items-center select-none">
              {/* Garment Showcase Stage */}
              <div
                className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[480px] xl:max-w-[520px] flex flex-col items-center"
                onTouchStart={hasSecondaryImages ? handleTouchStart : undefined}
                onTouchEnd={hasSecondaryImages ? handleTouchEnd : undefined}
              >
                {/* Outfit Image Container: sized so both outfit & slab fit at 1366x768 */}
                <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[calc(100vh-220px)] lg:max-h-[530px] xl:max-h-[570px] min-h-[340px] flex flex-col justify-end items-center z-10">
                  <div className="relative w-full h-full">
                    <Image
                      key={activeImageSrc}
                      src={activeImageSrc}
                      alt={`${product.name} showcase`}
                      fill
                      priority={activeImageIndex === 0}
                      sizes="(min-width: 1024px) 50vw, 92vw"
                      className="object-contain object-bottom transition-opacity duration-300 ease-out drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
                    />
                  </div>

                  {/* Subtle Contact Shadow where hems meet slab */}
                  <div
                    aria-hidden
                    className="w-44 sm:w-52 lg:w-64 h-2 mx-auto bg-black/55 blur-[4px] rounded-full -mt-2.5 z-20 pointer-events-none"
                  />
                </div>

                {/* Pedestal Slab Stage (centered under outfit, ~10-15% wider) */}
                <div className="relative w-full sm:w-[114%] max-w-[340px] sm:max-w-[460px] lg:max-w-[520px] xl:max-w-[560px] -mt-2.5 z-20 select-none">
                  <div className="relative w-full aspect-[2400/528] filter drop-shadow-[0_20px_36px_rgba(0,0,0,0.7)]">
                    <Image
                      src="/images/pdp/pdp-slab.png?v=2"
                      alt="Stone pedestal plinth stage"
                      fill
                      sizes="(min-width: 1024px) 45vw, 95vw"
                      priority
                      className="object-contain object-top"
                    />

                    {/* Thumbnails sitting on the slab's front face (no dark tray) */}
                    {hasSecondaryImages && (
                      <div className="absolute inset-x-0 bottom-2 sm:bottom-2.5 z-30 flex items-center justify-center gap-2.5 sm:gap-3 px-3">
                        {allGalleryImages.map((img, idx) => {
                          const isActive = activeImageIndex === idx;
                          return (
                            <button
                              key={`${img}-${idx}`}
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              aria-label={`View look ${idx + 1} of ${allGalleryImages.length}`}
                              aria-current={isActive ? "true" : undefined}
                              className={`pdp-slab-thumb plinth-inset-thumb relative h-13 w-11 sm:h-16 sm:w-13.5 shrink-0 cursor-pointer ${
                                isActive ? "active" : ""
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`${product.name} view ${idx + 1}`}
                                fill
                                sizes="(max-width: 640px) 56px, 64px"
                                className="object-cover object-top p-0.5"
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Chevrons for secondary images */}
                {hasSecondaryImages && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                      className="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 hover:text-white hover:border-accent backdrop-blur-sm transition-all shadow-md cursor-pointer"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next image"
                      className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 hover:text-white hover:border-accent backdrop-blur-sm transition-all shadow-md cursor-pointer"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Atelier Purchase Details & Interactions */}
            <div className="lg:col-span-5 flex flex-col relative z-20 lg:pl-6 xl:pl-10">
              <div className="relative p-5 sm:p-7 rounded-[2px] backdrop-blur-[2px]">
                <div aria-hidden="true" className="pdp-info-scrim" />

                {/* Atelier Brand Tag, Cormorant Garamond Heading, Copper Price */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-accent font-mono">
                    <span>HT X STUDIO</span>
                    <span>{"//"}</span>
                    <span>{product.category || "ARCHIVE"}</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-bold uppercase tracking-wider text-text-primary leading-tight drop-shadow-sm">
                    {product.name}
                  </h1>

                  {/* Price Section with Copper Atelier Accent */}
                  <div className="flex items-baseline gap-3 mt-2.5 flex-wrap">
                    {hasReferralDiscount ? (
                      <>
                        <div className="font-sans text-2xl sm:text-3xl font-bold tracking-wide text-accent">
                          PKR {referralDiscountedPrice.toLocaleString()}
                        </div>
                        <div className="font-sans text-base text-text-secondary/70 line-through">
                          PKR {Number(product.price).toLocaleString()}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-[2px] font-mono">
                          SAVE {referralDiscountPct}%
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="font-sans text-2xl sm:text-3xl font-bold tracking-wide text-accent">
                          PKR {Number(product.price).toLocaleString()}
                        </div>
                        {product.old_price && product.old_price > product.price && (
                          <div className="font-sans text-base text-text-secondary/70 line-through">
                            PKR {Number(product.old_price).toLocaleString()}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Description & Size Guide Link */}
                  <div className="mt-4 text-xs text-[#cfc6bb] leading-relaxed">
                    <p>{product.description}</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setShowMobileSizeGuide(true);
                        } else {
                          setShowDesktopSizeGuide(!showDesktopSizeGuide);
                        }
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-text-primary/90 hover:text-accent font-bold uppercase tracking-widest transition-colors cursor-pointer font-mono"
                    >
                      <span>•</span>
                      <span>SIZE GUIDE</span>
                    </button>

                    {/* Desktop Inline Chart */}
                    {showDesktopSizeGuide && (
                      <div className="hidden md:block mt-3 animate-in fade-in slide-in-from-top-2">
                        <SizeChartTable />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dual Sizing Selectors: Top Size & Waist Size */}
                <div className="space-y-4 pt-3">
                  {/* Top Size Selector */}
                  {hasTop && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#dcd6ce] font-bold uppercase tracking-[0.2em] font-mono text-[11px]">
                          SELECT SIZE
                        </span>
                        <span className="text-xs text-accent font-semibold tracking-wider font-mono">
                          Oversized Boxy Fit
                        </span>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                        {topVariants.length > 0
                          ? topVariants.map((variant) => {
                              const isOOS = variant.stock <= 0;
                              const isSelected = selectedSize === variant.size;
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
                                  className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-[2px] relative cursor-pointer ${
                                    isSelected
                                      ? isOOS
                                        ? "border border-red-500/60 bg-red-500/10 text-red-400 line-through shadow-sm"
                                        : "pill-tactile-active"
                                      : isOOS
                                      ? "pill-tactile-inactive opacity-40 line-through"
                                      : "pill-tactile-inactive"
                                  }`}
                                >
                                  {variant.size}
                                  {isOOS && (
                                    <span
                                      className="absolute -top-1 -right-1 size-2 rounded-full bg-red-500 border border-base-bg"
                                      title="Sold out"
                                    />
                                  )}
                                </button>
                              );
                            })
                          : [...new Set([...(product.sizes || ["S", "M", "L", "XL"])])].map((sz) => {
                              const isSelected = selectedSize === sz;
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSize(sz);
                                    setSoldOutError(false);
                                  }}
                                  className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-[2px] cursor-pointer ${
                                    isSelected ? "pill-tactile-active" : "pill-tactile-inactive"
                                  }`}
                                >
                                  {sz}
                                </button>
                              );
                            })}
                      </div>
                    </div>
                  )}

                  {/* Waist Size Selector */}
                  {hasBottom && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#dcd6ce] font-bold uppercase tracking-[0.2em] font-mono text-[11px]">
                          SELECT WAIST SIZE
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2.5">
                        {bottomVariants.map((variant) => {
                          const isOOS = variant.stock <= 0;
                          const isSelected = selectedWaist === variant.size;
                          return (
                            <button
                              key={variant.size}
                              type="button"
                              onClick={() => {
                                setSelectedWaist(variant.size);
                                if (variant.stock <= 0) {
                                  setSoldOutError(true);
                                } else {
                                  setSoldOutError(false);
                                }
                              }}
                              title={isOOS ? "Sold out" : undefined}
                              className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-[2px] relative cursor-pointer ${
                                isSelected
                                  ? isOOS
                                    ? "border border-red-500/60 bg-red-500/10 text-red-400 line-through shadow-sm"
                                    : "pill-tactile-active"
                                  : isOOS
                                  ? "pill-tactile-inactive opacity-40 line-through"
                                  : "pill-tactile-inactive"
                              }`}
                            >
                              {variant.size}
                              {isOOS && (
                                <span
                                  className="absolute -top-1 -right-1 size-2 rounded-full bg-red-500 border border-base-bg"
                                  title="Sold out"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Scarcity Indicator: AVAILABILITY • ONLY 1 LEFT */}
                <div className="flex items-center justify-between text-xs pt-3 pb-1">
                  <span className="text-[#dcd6ce] uppercase tracking-[0.22em] font-bold font-mono text-[11px]">
                    AVAILABILITY
                  </span>
                  {isSelectedSoldOut ? (
                    <span className="text-red-400 font-bold tracking-widest uppercase flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="size-1.5 rounded-full bg-red-400" />
                      SOLD OUT
                    </span>
                  ) : (
                    <span className="scarcity-rose font-bold uppercase tracking-widest flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="size-1.5 rounded-full bg-[#e59a4c] animate-pulse shadow-[0_0_10px_#e59a4c]" />
                      {availableStock === 1
                        ? "• ONLY 1 LEFT"
                        : `• ONLY ${availableStock} LEFT`}
                    </span>
                  )}
                </div>

                {/* Sold-out Error Banner */}
                {soldOutError && (
                  <div
                    role="alert"
                    className="rounded-[2px] border border-red-500/50 bg-red-500/10 px-4 py-3 text-xs text-red-400 font-medium animate-in fade-in duration-200"
                  >
                    out of stock please choose a different size
                  </div>
                )}

                {/* Action Buttons: Flame Magenta CTA & Outlined Checkout */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`btn-flame-magenta w-full rounded-[2px] py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#141210] flex items-center justify-center gap-2 cursor-pointer ${
                      isSelectedSoldOut ? "opacity-60 cursor-not-allowed filter-none" : ""
                    }`}
                  >
                    {added ? "✓ ADDED TO BAG" : isSelectedSoldOut ? "SIZE SOLD OUT" : "ADD TO BAG →"}
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className={`btn-outline-checkout w-full rounded-[2px] py-3.5 text-center text-xs font-bold uppercase tracking-[0.2em] cursor-pointer ${
                      isSelectedSoldOut ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </div>

                {/* Collapsible Referral Code Accordion Slot */}
                <div className="pt-3 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => setShowReferralAccordion((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs text-[#e2ded9] hover:text-white py-2 transition-colors group cursor-pointer font-medium"
                  >
                    <span className="tracking-wider">Have a referral code?</span>
                    <span className="font-mono text-accent text-sm font-bold transition-transform group-hover:scale-110">
                      {showReferralAccordion ? "−" : "+"}
                    </span>
                  </button>

                  {showReferralAccordion && (
                    <div className="pt-2 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <ReferralSection
                        className="w-full"
                        title=""
                        subtitle="Enter your referral code below to apply archive discount."
                        formLayout="row"
                      />
                    </div>
                  )}
                </div>

                {/* Collapsible Garment Craft Specifications Accordion Slot */}
                <div className="pt-2 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => setShowSpecsAccordion((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs text-[#e2ded9] hover:text-white py-2 transition-colors group cursor-pointer font-medium"
                  >
                    <span className="tracking-wider uppercase font-mono text-[11px]">
                      Garment craft specifications
                    </span>
                    <span className="font-mono text-accent text-sm font-bold transition-transform group-hover:scale-110">
                      {showSpecsAccordion ? "−" : "+"}
                    </span>
                  </button>

                  {showSpecsAccordion && (
                    <div className="pt-2 pb-2 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                      <ul className="list-disc pl-4 space-y-1.5 text-[#cfc6bb] text-xs">
                        {product.specs && product.specs.length > 0 ? (
                          product.specs.map((spec, i) => <li key={i}>{spec}</li>)
                        ) : (
                          <>
                            <li>Heavyweight custom milled breathable athletic jersey &amp; wide-leg track pant blend</li>
                            <li>Architectural drop-shoulder silhouette with raw edge hems &amp; contrast flame sublimation</li>
                            <li>Individually numbered label inside each chapter piece (1 of 100)</li>
                            <li>Ships in signature HT x Studio archive box with serialized authentication certificate</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lower Section on the Limestone Wall: Variants & Complete the Look */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        {/* Variants / Other Colors Section (if available) */}
        {variants && variants.length > 0 && (
          <section className="mt-20 border-t border-base-border/60 pt-14" aria-labelledby="variants-heading">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent font-mono">
                  AVAILABLE IN
                </p>
                <h2
                  id="variants-heading"
                  className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-widest text-text-primary mt-1"
                >
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
                  <ProductCard
                    key={variant.id}
                    id={variant.id}
                    name={variant.name}
                    price={variant.price}
                    oldPrice={variant.old_price}
                    image={img}
                    category={variant.category}
                    description={variant.description}
                    variant="pedestal"
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Complete the Look // Shop the Pieces Cross-Sell Pedestal Grid */}
        {filteredPieces && filteredPieces.length > 0 && (
          <section
            className="mt-20 border-t border-base-border/60 pt-14"
            aria-labelledby="shop-pieces-heading"
          >
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent font-mono">
                  COMPLETE THE LOOK //
                </p>
                <h2
                  id="shop-pieces-heading"
                  className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-widest text-text-primary mt-1 drop-shadow-sm"
                >
                  SHOP THE PIECES
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPieces.map((piece) => {
                const img =
                  piece.images && piece.images.length > 0
                    ? piece.images[0]
                    : `/images/looks/${piece.id}.jpg`;

                const { discountedPrice: pieceDiscountedPrice, hasDiscount: pieceHasDiscount } =
                  getDiscountedPrice(
                    Number(piece.price),
                    piece.category,
                    referralCode,
                    referralDiscountPct,
                    referralCategories
                  );

                return (
                  <BrickCard
                    key={piece.id}
                    id={piece.id}
                    name={piece.name}
                    category={piece.category}
                    price={Number(piece.price)}
                    oldPrice={piece.old_price ? Number(piece.old_price) : undefined}
                    image={img}
                    setId={piece.set_id}
                    discountedPrice={pieceDiscountedPrice}
                    hasDiscount={pieceHasDiscount}
                    referralDiscountPct={referralDiscountPct}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Size Guide Modal */}
      {showMobileSizeGuide && (
        <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full bg-base-surface border-t border-base-border rounded-t-xl p-6 pb-10 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-text-primary">
                  Size Guide
                </h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">
                  Find your perfect fit
                </p>
              </div>
              <button
                onClick={() => setShowMobileSizeGuide(false)}
                className="text-text-secondary hover:text-text-primary text-xl p-2 cursor-pointer"
                aria-label="Close Guide"
              >
                ✕
              </button>
            </div>
            <SizeChartTable />
            <button
              onClick={() => setShowMobileSizeGuide(false)}
              className="w-full mt-6 rounded-[2px] bg-accent py-3.5 text-xs font-bold uppercase tracking-widest text-text-primary cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
