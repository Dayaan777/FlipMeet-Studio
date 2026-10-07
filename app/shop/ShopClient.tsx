"use client";

import Image from "next/image";
import { DARK_BLUR_DATA_URL } from "@/lib/image-placeholder";
import Link from "next/link";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/products";
import { useCartStore } from "@/lib/cart-store";
import { getDiscountedPrice } from "@/lib/referral-utils";

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
   <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    {/* Category pills + price filter pills */}
    <div className="flex flex-col gap-2">
     <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
       <button
        key={cat}
        onClick={() => { setActiveCategory(cat); setPriceFilter(null); }}
        className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
         activeCategory === cat
          ? "border-accent bg-accent/10 text-accent"
          : "border-base-border text-text-secondary hover:border-accent/50 hover:text-text-primary"
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
        className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
         priceFilter === opt.value
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-base-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
        }`}
       >
        {opt.label}
       </button>
      ))}
     </div>
    </div>

    {/* Search */}
    <div className="flex items-center gap-2">
     {searchOpen ? (
      <div className="flex items-center gap-2 rounded-sm border border-base-border bg-base-surface px-3 py-2 transition-all">
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
        className="w-48 bg-transparent text-xs text-text-primary placeholder-text-secondary outline-none"
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
       className="flex items-center gap-2 rounded-sm border border-base-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary"
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
   <p className="mb-6 text-[10px] uppercase tracking-widest text-text-secondary">
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
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
     {filtered.map((product, idx) => {
      const img =
       product.images && product.images.length > 0
        ? product.images[0]
        : `/images/looks/${product.id}.jpg`;

      return (
       <Link
        key={product.id}
        href={`/product/${product.id}`}
        className="group flex flex-col justify-between rounded-sm border border-base-border bg-base-surface/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-base-surface"
       >
        <div>
         <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-text-secondary">
          <span>{product.category || "COLLECTION"}</span>
          <span className="font-bold text-accent">1 OF 100</span>
         </div>

         <div className="relative my-4 aspect-[3/4] w-full overflow-hidden">
          <Image
           src={img}
           alt={`${product.name} ${product.description}`}
           fill
           priority={idx < 4}
           placeholder="blur"
           blurDataURL={DARK_BLUR_DATA_URL}
           sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
           className="object-contain object-bottom transition-all duration-500 group-hover:scale-105 group-hover:[filter:drop-shadow(0_0_24px_rgb(var(--accent)/0.4))]"
          />
         </div>
        </div>

        <div className="mt-2 border-t border-base-border/70 pt-4">
         <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold uppercase tracking-widest text-text-primary transition-colors group-hover:text-accent">
           {product.name}
          </h2>
          {/* Price: referral discount aware */}
          {(() => {
           const { discountedPrice, hasDiscount } = getDiscountedPrice(
            Number(product.price),
            product.category,
            referralCode,
            referralDiscountPct,
            referralCategories
           );
           return (
            <div className="flex items-center gap-2">
             {hasDiscount ? (
              <>
               <span className="font-display text-sm font-bold text-accent tracking-widest">
                PKR {discountedPrice.toLocaleString()}
               </span>
               <span className="text-[10px] text-text-secondary line-through">
                PKR {Number(product.price).toLocaleString()}
               </span>
              </>
             ) : (
              <>
               <span className="font-display text-sm font-bold text-accent tracking-widest">
                PKR {Number(product.price).toLocaleString()}
               </span>
               {product.old_price && product.old_price > product.price && (
                <span className="text-[10px] text-text-secondary line-through">
                 PKR {Number(product.old_price).toLocaleString()}
                </span>
               )}
              </>
             )}
            </div>
           );
          })()}
         </div>
         <p className="mt-1 truncate text-xs text-text-secondary">
          {product.description}
         </p>
         <div className="mt-4 flex items-center justify-end text-[10px] uppercase tracking-widest text-text-secondary">
          <span className="font-bold text-text-primary transition-colors group-hover:text-accent">
           ORDER NOW &rarr;
          </span>
         </div>
        </div>
       </Link>
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
