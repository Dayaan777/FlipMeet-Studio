import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/products";
import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop | HT x Studio",
  description: "Browse the full HT x Studio collection.",
};

import ShopWallBackground from "@/components/ShopWallBackground";

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <NavBar />
      <main className="shop-wall min-h-screen bg-base-bg">
        <ShopWallBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pb-24 pt-24 sm:pt-32">

          {/* Page header */}
          <div className="mb-8 sm:mb-10 flex flex-col justify-between gap-4 border-b border-[#3a322c]/50 pb-6 sm:pb-8 text-center sm:flex-row sm:items-end sm:text-left">
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#d48b59] drop-shadow-sm">
                COLLECTION CATALOG
              </p>
              <h1 className="mt-1.5 font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-widest text-[#f5eee6] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                SHOP
              </h1>
              <p className="mt-2 max-w-md mx-auto sm:mx-0 text-xs sm:text-sm font-medium text-[#dcd1c2] leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                Each look is limited to strictly 100 numbered pieces worldwide. Individually crafted and archived.
              </p>
            </div>
            <div className="flex justify-center sm:justify-end mt-1 sm:mt-0">
              <span className="inline-block rounded-full border border-base-border/80 bg-base-surface/85 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#dcd1c2] shadow-sm backdrop-blur-sm">
                {products.length} GARMENT SUITES
              </span>
            </div>
          </div>

          {/* Category filters + search + product grid (all client-side) */}
          <ShopClient products={products} />

        </div>
      </main>
      <Footer />
    </>
  );
}
