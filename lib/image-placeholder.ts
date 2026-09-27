/**
 * Shared Image Placeholder Utility
 * Provides metallic SVG shimmer blur placeholders and dark aesthetic blurDataURLs
 * compatible with Next.js <Image placeholder="blur" blurDataURL={...} />.
 */

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#141414" offset="20%" />
      <stop stop-color="#222222" offset="50%" />
      <stop stop-color="#141414" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#141414" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite" />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const shimmerBlurDataUrl = (w = 700, h = 900) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;

export const DARK_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgdmlld0JveD0iMCAwIDEwIDEwIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMxNDE0MTQiLz48L3N2Zz4=";
