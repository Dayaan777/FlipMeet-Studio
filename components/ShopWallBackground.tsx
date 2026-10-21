"use client";

/**
 * ShopWallBackground — renders the architectural stepped limestone plinth
 * background for the shop page (.shop-wall).
 *
 * Visual hierarchy:
 * - Top: Ambient dark studio background seamlessly transitioning from the navbar (#141210)
 * - Upper-left: Raised stone plinth with rough chipped fracture framing the SHOP heading
 * - Upper-right: Clean cut stone shelf stepping down
 * - Lower face: Seamless limestone slab surface extending down behind the entire product grid
 *
 * Performance:
 * - Pure CSS multi-layer background (single div, pointer-events: none, z-0)
 * - Compressed WebP assets in /public/shop/ (total under 380 KB)
 * - Responsive: scales to 140% on mobile to keep stone centered
 */
export default function ShopWallBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 shop-wall-bg"
    />
  );
}
