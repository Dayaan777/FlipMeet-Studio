"use client";

/**
 * HomeWallBackground — renders wall-bg.webp (normal + vertically-flipped
 * stitched into one 483×2048 tile) as a seamless, infinitely-repeating
 * background for .home-wall.
 *
 * No overlays, no filters, no blend modes, no noise, no cracks, no dividers.
 * The image is the only visual layer (plus a #988f83 CSS fallback on .home-wall).
 *
 * Mobile: CSS displays full width with brick edges framing the sides.
 * Content containers use gutter clearance so text and components never overlap the bricks.
 */
export default function HomeWallBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 home-wall-bg"
    />
  );
}
