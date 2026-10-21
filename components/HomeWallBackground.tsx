"use client";

/**
 * HomeWallBackground — renders wall-bg.webp (normal + vertically-flipped
 * stitched into one 483×2048 tile) as a seamless, infinitely-repeating
 * background for .home-wall.
 *
 * No overlays, no filters, no blend modes, no noise, no cracks, no dividers.
 * The image is the only visual layer (plus a #988f83 CSS fallback on .home-wall).
 *
 * Mobile (<md): CSS scales to ~140% width and centers so baked-in brick
 * edges are pushed off-screen. See globals.css `.home-wall` rule.
 */
export default function HomeWallBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 home-wall-bg"
    />
  );
}
