import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DROP 001 Collection | FlipMeet Studio",
  description: "Six Outfits. One First Chapter. Limited edition pre-order collection.",
};

export async function generateStaticParams() {
  return [{ dropId: "drop-001" }];
}

export default async function DropPage({
  params,
}: {
  params: Promise<{ dropId: string }>;
}) {
  const { dropId } = await params;
  const products = await getProducts();

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg pt-28 pb-24 px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12 border-b border-base-border pb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
                COLLECTION CATALOG // DROP 001
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-text-primary mt-2">
                SIX OUTFITS. ONE CHAPTER.
              </h1>
              <p className="text-xs text-text-secondary mt-2 max-w-md">
                Each look is limited to strictly 100 numbered pieces worldwide. Individually crafted and archived.
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-full border border-base-border bg-base-surface px-4 py-1.5 text-[10px] tracking-widest text-text-secondary uppercase">
                {products.length} GARMENT SUITES
              </span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const img = product.images && product.images.length > 0
                ? product.images[0]
                : `/images/looks/${product.id}.jpg`;

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group rounded-sm border border-base-border bg-base-surface/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-base-surface flex flex-col justify-between"
                >
                  <div>
                    {/* Top status */}
                    <div className="flex items-center justify-between text-[10px] tracking-widest uppercase text-text-secondary mb-4">
                      <span>{product.category || "DROP 001"}</span>
                      <span className="text-accent font-bold">1 OF 100</span>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden flex items-end justify-center my-4">
                      <Image
                        src={img}
                        alt={`${product.name} — ${product.description}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_24px_rgba(255,77,30,0.4)]"
                      />
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="border-t border-base-border/70 pt-4 mt-2">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-base font-bold uppercase tracking-wider text-text-primary group-hover:text-accent transition-colors">
                        {product.name}
                      </h2>
                      <span className="font-display text-sm font-bold text-accent">
                        PKR {Number(product.price).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 truncate">
                      {product.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-[10px] tracking-widest text-text-secondary uppercase">
                      <span>Sizes: {product.sizes.join(" · ")}</span>
                      <span className="font-bold text-text-primary group-hover:text-accent transition-colors">
                        PRE-ORDER →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
