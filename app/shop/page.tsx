import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/products";
import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop | FlipMeet Studio",
  description: "Browse the full FlipMeet Studio collection.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg px-6 pb-24 pt-28">
        <div className="mx-auto max-w-7xl">

          {/* Page header */}
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-base-border pb-8 text-center sm:flex-row sm:items-end sm:text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
                COLLECTION CATALOG
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-widest text-text-primary sm:text-5xl">
                SHOP
              </h1>
              <p className="mt-2 max-w-md text-xs text-text-secondary">
                Each look is limited to strictly 100 numbered pieces worldwide. Individually crafted and archived.
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-full border border-base-border bg-base-surface px-4 py-1.5 text-[10px] uppercase tracking-widest text-text-secondary">
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
