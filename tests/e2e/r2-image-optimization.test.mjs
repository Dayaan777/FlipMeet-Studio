import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();

describe("Tier 1: R2 — Asset & Image Optimization", () => {
  const nextConfigPath = path.join(ROOT, "next.config.ts");
  const placeholderPath = path.join(ROOT, "lib", "image-placeholder.ts");
  const cartPath = path.join(ROOT, "app", "cart", "page.tsx");
  const checkoutPath = path.join(ROOT, "app", "checkout", "page.tsx");
  const dashboardPath = path.join(ROOT, "app", "dashboard", "page.tsx");
  const adminPath = path.join(ROOT, "app", "admin", "page.tsx");
  const animePagePath = path.join(ROOT, "app", "anime", "page.tsx");
  const heroPath = path.join(ROOT, "components", "Hero.tsx");
  const shopClientPath = path.join(ROOT, "app", "shop", "ShopClient.tsx");
  const animeRevealPath = path.join(ROOT, "components", "AnimeDropReveal.tsx");
  const lookCarouselPath = path.join(ROOT, "components", "LookCarousel.tsx");

  test("R2.1: next.config.ts configures AVIF/WebP formats, 1-year cache TTL, and immutable headers", () => {
    assert.ok(fs.existsSync(nextConfigPath), "next.config.ts must exist");
    const code = fs.readFileSync(nextConfigPath, "utf-8");

    // Modern formats
    assert.ok(
      code.includes("image/avif") && code.includes("image/webp"),
      "next.config.ts must declare formats: ['image/avif', 'image/webp']"
    );

    // Cache TTL
    assert.ok(
      code.includes("minimumCacheTTL") && code.includes("31536000"),
      "next.config.ts must declare minimumCacheTTL: 31536000 (1 year)"
    );

    // Responsive device and image sizes
    assert.ok(
      code.includes("deviceSizes") && code.includes("imageSizes"),
      "next.config.ts must specify deviceSizes and imageSizes"
    );

    // Immutable caching headers for images, videos, and favicon
    assert.ok(
      code.includes("/images/:path*") && code.includes("immutable"),
      "next.config.ts must configure immutable Cache-Control headers for /images/:path*"
    );
    assert.ok(
      code.includes("/videos/:path*") && code.includes("immutable"),
      "next.config.ts must configure immutable Cache-Control headers for /videos/:path*"
    );
    assert.ok(
      code.includes("/favicon.png") && code.includes("immutable"),
      "next.config.ts must configure immutable Cache-Control headers for /favicon.png"
    );
  });

  test("R2.2: lib/image-placeholder.ts exports valid base64 SVG shimmer and dark blur placeholders", async () => {
    assert.ok(fs.existsSync(placeholderPath), "lib/image-placeholder.ts must exist");
    const placeholderCode = fs.readFileSync(placeholderPath, "utf-8");

    assert.ok(placeholderCode.includes("export const DARK_BLUR_DATA_URL"), "Must export DARK_BLUR_DATA_URL");
    assert.ok(placeholderCode.includes("export const shimmerBlurDataUrl"), "Must export shimmerBlurDataUrl");

    // Test DARK_BLUR_DATA_URL decode and SVG validity
    const darkUrlMatch = placeholderCode.match(/DARK_BLUR_DATA_URL\s*=\s*["']([^"']+)["']/);
    assert.ok(darkUrlMatch, "Must define DARK_BLUR_DATA_URL string literal");
    const darkDataUrl = darkUrlMatch[1];
    assert.ok(darkDataUrl.startsWith("data:image/svg+xml;base64,"), "DARK_BLUR_DATA_URL must be a base64 SVG data URI");

    const darkBase64 = darkDataUrl.replace("data:image/svg+xml;base64,", "");
    const decodedDarkSvg = Buffer.from(darkBase64, "base64").toString("utf-8");
    assert.ok(decodedDarkSvg.includes("<svg") && decodedDarkSvg.includes("</svg>"), "Decoded dark placeholder must be valid SVG");
    assert.ok(decodedDarkSvg.includes("#141414"), "Dark placeholder must use #141414 dark aesthetic");

    // Test shimmerBlurDataUrl logic
    assert.ok(placeholderCode.includes("<linearGradient") && placeholderCode.includes("<animate"), "Shimmer must define metallic linearGradient and animate tag");
  });

  test("R2.3: Thumbnails across cart, checkout, dashboard, and admin declare explicit sizes", () => {
    // Cart thumbnail
    assert.ok(fs.existsSync(cartPath), "app/cart/page.tsx must exist");
    const cartCode = fs.readFileSync(cartPath, "utf-8");
    assert.ok(
      cartCode.includes("sizes=\"(max-width: 640px) 64px, 80px\"") || /sizes=["'][^"']*64px[^"']*["']/.test(cartCode),
      "Cart thumbnail Image fill must have explicit sizes prop (e.g. 64px, 80px)"
    );

    // Checkout thumbnail
    assert.ok(fs.existsSync(checkoutPath), "app/checkout/page.tsx must exist");
    const checkoutCode = fs.readFileSync(checkoutPath, "utf-8");
    assert.ok(
      checkoutCode.includes("sizes=\"48px\""),
      "Checkout thumbnail Image fill must have sizes=\"48px\""
    );

    // Dashboard thumbnails (order list 32px and detail modal 48px)
    assert.ok(fs.existsSync(dashboardPath), "app/dashboard/page.tsx must exist");
    const dashboardCode = fs.readFileSync(dashboardPath, "utf-8");
    assert.ok(dashboardCode.includes("sizes=\"32px\""), "Dashboard order list avatar must have sizes=\"32px\"");
    assert.ok(dashboardCode.includes("sizes=\"48px\""), "Dashboard modal thumbnail must have sizes=\"48px\"");

    // Admin thumbnail
    assert.ok(fs.existsSync(adminPath), "app/admin/page.tsx must exist");
    const adminCode = fs.readFileSync(adminPath, "utf-8");
    assert.ok(adminCode.includes("sizes=\"48px\""), "Admin product row thumbnail must have sizes=\"48px\"");
  });

  test("R2.4: Above-the-fold and LCP images include priority flags to eliminate loading delays", () => {
    // Anime page mobile hero
    assert.ok(fs.existsSync(animePagePath), "app/anime/page.tsx must exist");
    const animeCode = fs.readFileSync(animePagePath, "utf-8");
    // Find mobile hero div
    const mobileHeroSection = animeCode.slice(animeCode.indexOf("md:hidden aspect-square"), animeCode.indexOf("md:hidden aspect-square") + 500);
    assert.ok(
      mobileHeroSection.includes("priority"),
      "Anime page mobile hero Image must specify priority"
    );

    // Campaign Hero mobile image
    assert.ok(fs.existsSync(heroPath), "components/Hero.tsx must exist");
    const heroCode = fs.readFileSync(heroPath, "utf-8");
    const mobileHeroImage = heroCode.slice(heroCode.indexOf("md:hidden"), heroCode.indexOf("md:hidden") + 700);
    assert.ok(
      mobileHeroImage.includes("priority"),
      "Hero.tsx mobile hero image must specify priority"
    );

    // Shop catalog top 4 products
    assert.ok(fs.existsSync(shopClientPath), "app/shop/ShopClient.tsx must exist");
    const shopCode = fs.readFileSync(shopClientPath, "utf-8");
    assert.ok(
      shopCode.includes("priority={idx < 4}") ||
      shopCode.includes("priority={index < 4}") ||
      shopCode.includes("priority={i < 4}") ||
      shopCode.includes("priority={idx < 6}"),
      "ShopClient.tsx must set priority on first row of products (idx < 4)"
    );

    // Anime drop reveal initial card
    assert.ok(fs.existsSync(animeRevealPath), "components/AnimeDropReveal.tsx must exist");
    const revealCode = fs.readFileSync(animeRevealPath, "utf-8");
    assert.ok(
      revealCode.includes("priority={i === 0}") || revealCode.includes("priority={idx === 0}"),
      "AnimeDropReveal.tsx must set priority on initial reveal look"
    );
  });

  test("R2.5: LookCarousel and ShopClient implement blur placeholder strategy", () => {
    const lookCode = fs.readFileSync(lookCarouselPath, "utf-8");
    assert.ok(
      lookCode.includes("DARK_BLUR_DATA_URL") && lookCode.includes("placeholder=\"blur\""),
      "LookCarousel.tsx must configure placeholder=\"blur\" and blurDataURL"
    );

    const shopCode = fs.readFileSync(shopClientPath, "utf-8");
    assert.ok(
      shopCode.includes("DARK_BLUR_DATA_URL") && shopCode.includes("placeholder=\"blur\""),
      "ShopClient.tsx must configure placeholder=\"blur\" and blurDataURL"
    );
  });
});
