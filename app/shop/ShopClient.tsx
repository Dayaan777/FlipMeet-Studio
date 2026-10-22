"use client";

import Image from "next/image";
import { DARK_BLUR_DATA_URL } from "@/lib/image-placeholder";
import Link from "next/link";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/products";
import { useCartStore } from "@/lib/cart-store";
import { getDiscountedPrice } from "@/lib/referral-utils";
import BrickCard from "@/components/BrickCard";

const CATEGORIES = ["All", "Shirts", "Jerseys", "Pants", "Trousers", "Outfits"] as const;

function ShopContent({ products }: { products: Product[] }) {
 const searchParams = useSearchParams();
 const hiddenFilter = searchParams.get("filter");

 const [activeCategory, setActiveCategory] = useState<string>("All");
 const [searchOpen, setSearchOpen] = useState(false);
 const [query, setQuery] = useState("");
 const [priceFilter, setPriceFilter] = useState<'below2000' | 'below4000' | 'above4000' | null>(null);

 const { referralCode, referralDiscountPct, referralCategories } = useCartStore();

 const filtered = useMemo(() => {
  let list = products;

  // Exclude bundle-only products from shop
  list = list.filter(p => !p.is_bundle);

  // Apply hidden URL filter (e.g., from Anime page One Piece card)
  if (hiddenFilter === "one-piece") {
   const allowedIds = [
    "anime-luffy-blue-jersey",
    "anime-op-flame-jersey",
    "anime-robin-purple-jersey",
    "anime-zoro-green-jersey"
   ];
   list = list.filter(p => allowedIds.includes(p.id));
  }

  if (activeCategory !== "All") {
   list = list.filter((p) => p.category && p.category.split(",").map(c => c.trim().toLowerCase()).includes(activeCategory.toLowerCase()));
  }
  if (priceFilter === 'below2000') list = list.filter(p => p.price < 2000);
  else if (priceFilter === 'below4000') list = list.filter(p => p.price < 4000);
  else if (priceFilter === 'above4000') list = list.filter(p => p.price >= 4000);
  if (query.trim()) {
   const q = query.trim().toLowerCase();
   list = list.filter(
    (p) =>
     p.name.toLowerCase().includes(q) ||
     p.description?.toLowerCase().includes(q)
   );
  }

  const catOrder: Record<string, number> = {
   "Outfits": 1,
   "Shirts": 2,
   "Jerseys": 2,
   "Pants": 3,
   "Trousers": 3
  };

  list = [...list].sort((a, b) => {
   const aSet = a.set_id || "";
   const bSet = b.set_id || "";

   if (aSet && !bSet) return -1;
   if (!aSet && bSet) return 1;
   if (aSet && bSet && aSet !== bSet) return aSet.localeCompare(bSet);
   if (aSet && bSet && aSet === bSet) return (catOrder[a.category] || 99) - (catOrder[b.category] || 99);
   return 0;
  });

  return list;
 }, [products, activeCategory, query, hiddenFilter, priceFilter]);

 return (
  <>
   {/* ── Controls row: category filters + search ── */}
   <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    {/* Category pills + price filter pills (shifted a little right and down on laptop/PC for optimal slab placement) */}
    <div className="flex flex-col gap-2.5 md:pl-6 lg:pl-8 md:pt-3.5">
     <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
       <button
        key={cat}
        onClick={() => { setActiveCategory(cat); setPriceFilter(null); }}
        className={`rounded-full border px-3.5 sm:px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors backdrop-blur-sm ${
         activeCategory === cat
          ? "border-accent bg-accent/20 text-[#f5eee6] shadow-sm"
          : "border-[#4a3f35]/90 bg-[#1c1815]/85 text-[#dcd1c2] hover:border-accent/50 hover:text-[#f5eee6]"
        }`}
       >
        {cat}
       </button>
      ))}
     </div>
     {/* Price filter pills — always visible */}
     <div className="flex flex-wrap gap-2">
      {([
        {label: 'Below PKR 2,000', value: 'below2000'},
        {label: 'Below PKR 4,000', value: 'below4000'},
        {label: 'PKR 4,000 & above', value: 'above4000'}
      ] as const).map(opt => (
       <button
        key={opt.value}
        onClick={() => setPriceFilter(priceFilter === opt.value ? null : opt.value)}
        className={`rounded-full border px-3.5 sm:px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors backdrop-blur-sm ${
         priceFilter === opt.value
          ? 'border-accent bg-accent/20 text-[#f5eee6] shadow-sm'
          : 'border-[#4a3f35]/90 bg-[#1c1815]/85 text-[#dcd1c2] hover:border-accent/50 hover:text-[#f5eee6]'
        }`}
       >
        {opt.label}
       </button>
      ))}
     </div>
    </div>

    {/* Search (shifted down on laptop/PC to align with categories) */}
    <div className="flex items-center gap-2 md:pt-3.5">
     {searchOpen ? (
      <div className="flex w-full sm:w-auto items-center gap-2 rounded-sm border border-[#4a3f35] bg-[#1c1815]/90 px-3 py-2 transition-all">
       <svg
        className="h-3.5 w-3.5 shrink-0 text-text-secondary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         strokeWidth={2}
         d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
       </svg>
       <input
        autoFocus
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full sm:w-48 bg-transparent text-xs text-text-primary placeholder-text-secondary outline-none"
       />
       {query && (
        <button
         onClick={() => setQuery("")}
         className="text-text-secondary hover:text-text-primary"
         aria-label="Clear search"
        >
         ×
        </button>
       )}
       <button
        onClick={() => { setSearchOpen(false); setQuery(""); }}
        className="ml-1 text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary"
       >
        Close
       </button>
      </div>
     ) : (
      <button
       onClick={() => setSearchOpen(true)}
       className="flex items-center gap-2 rounded-sm border border-[#4a3f35]/90 bg-[#1c1815]/85 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#dcd1c2] backdrop-blur-sm transition-colors hover:border-accent/50 hover:text-[#f5eee6]"
       aria-label="Open search"
      >
       <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         strokeWidth={2}
         d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
       </svg>
       Search
      </button>
     )}
    </div>
   </div>

   {/* ── Result count ── */}
   <p className="mb-6 text-[10px] font-semibold uppercase tracking-widest text-[#a89578] md:pl-6 lg:pl-8">
    {filtered.length} {filtered.length === 1 ? "product" : "products"}
    {activeCategory !== "All" && ` in ${activeCategory}`}
    {query.trim() && ` matching "${query.trim()}"`}
   </p>

   {/* ── Product grid ── */}
   {filtered.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-24 text-center">
     <p className="text-text-secondary text-sm">No products found.</p>
     <button
      onClick={() => { setActiveCategory("All"); setQuery(""); setPriceFilter(null); }}
      className="mt-4 text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
     >
      Clear filters
     </button>
    </div>
   ) : (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
     {filtered.map((product, idx) => {
      const img =
       product.images && product.images.length > 0
        ? product.images[0]
        : `/images/looks/${product.id}.jpg`;

      const { discountedPrice, hasDiscount } = getDiscountedPrice(
       Number(product.price),
       product.category,
       referralCode,
       referralDiscountPct,
       referralCategories
      );

      return (
       <BrickCard
        key={product.id}
        id={product.id}
        name={product.name}
        category={product.category}
        price={Number(product.price)}
        oldPrice={product.old_price ? Number(product.old_price) : undefined}
        image={img}
        setId={product.set_id}
        priority={idx < 4}
        discountedPrice={discountedPrice}
        hasDiscount={hasDiscount}
        referralDiscountPct={referralDiscountPct}
       />
      );
     })}
    </div>
   )}
  </>
 );
}

export default function ShopClient({ products }: { products: Product[] }) {
  return (
    <Suspense fallback={<div className="py-24 text-center text-text-secondary">Loading shop...</div>}>
      <ShopContent products={products} />
    </Suspense>
  );
}
