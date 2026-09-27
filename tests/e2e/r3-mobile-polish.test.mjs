import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

describe("Tier 1: R3 — Mobile UX & UI Polish", () => {
  const lookCarouselPath = path.join(ROOT, "components", "LookCarousel.tsx");
  const productDetailPath = path.join(ROOT, "app", "product", "[slug]", "ProductDetailClient.tsx");
  const tryOnPanelPath = path.join(ROOT, "components", "TryOnPanel.tsx");
  const footerPath = path.join(ROOT, "components", "Footer.tsx");

  test("R3.1: LookCarousel implements native touch swipeable/draggable gestures", () => {
    assert.ok(fs.existsSync(lookCarouselPath), "components/LookCarousel.tsx must exist");
    const code = fs.readFileSync(lookCarouselPath, "utf-8");

    // Must bind touch handlers to stage
    assert.ok(
      code.includes("onTouchStart={handleTouchStart}") &&
      code.includes("onTouchMove={handleTouchMove}") &&
      code.includes("onTouchEnd={handleTouchEnd}"),
      "LookCarousel stage container must bind onTouchStart, onTouchMove, and onTouchEnd"
    );

    // Must define threshold and direction discrimination
    assert.ok(
      code.includes("diffX") && code.includes("diffY"),
      "LookCarousel must measure horizontal and vertical touch deltas"
    );
    assert.ok(
      code.includes("threshold") || code.includes("40") || code.includes("30"),
      "LookCarousel must enforce a minimum swipe threshold (30-40px) to prevent accidental micro-drags"
    );

    // Directional shifting: diffX < 0 -> next (shift 1), diffX > 0 -> prev (shift -1)
    assert.ok(
      code.includes("shift(1)") && code.includes("shift(-1)"),
      "LookCarousel must map left swipe to next (shift 1) and right swipe to prev (shift -1)"
    );

    // Touch-pan-y class to allow native vertical scrolling
    assert.ok(
      code.includes("touch-pan-y"),
      "LookCarousel stage must include touch-pan-y to preserve native vertical scroll behavior"
    );

    // isSwiping lock preventing accidental Link activation
    assert.ok(
      code.includes("isSwiping") && code.includes("preventDefault()"),
      "LookCarousel outfit card Links must prevent default click navigation when swiping is active"
    );

    // Circular modulo navigation
    assert.ok(
      code.includes("(index + direction + count) % count") || code.includes("% count"),
      "LookCarousel shift function must use circular modulo math for infinite wrapping"
    );
  });

  test("R3.2: AI Try-On is conditionally hidden on mobile viewports using CSS while preserving React logic", () => {
    assert.ok(fs.existsSync(productDetailPath), "ProductDetailClient.tsx must exist");
    const productDetailCode = fs.readFileSync(productDetailPath, "utf-8");

    // ProductDetailClient AI Try-On section
    const tryOnSectionMatch = productDetailCode.match(/<section[^>]*aria-labelledby=["']ai-try-on-heading["'][^>]*>/);
    assert.ok(tryOnSectionMatch, "ProductDetailClient must contain an AI Try-On section");
    const sectionTag = tryOnSectionMatch[0];
    assert.ok(
      sectionTag.includes("hidden md:block") || sectionTag.includes("hidden md:flex"),
      "AI Try-On section in ProductDetailClient must use responsive Tailwind CSS (hidden md:block/flex) to hide on mobile"
    );

    // Verify underlying state and file input handlers remain intact
    assert.ok(
      productDetailCode.includes("fileName") && productDetailCode.includes("setFileName"),
      "ProductDetailClient must retain fileName React state and logic"
    );

    // TryOnPanel standalone component check
    assert.ok(fs.existsSync(tryOnPanelPath), "components/TryOnPanel.tsx must exist");
    const tryOnPanelCode = fs.readFileSync(tryOnPanelPath, "utf-8");
    assert.ok(
      tryOnPanelCode.includes("hidden md:block") || tryOnPanelCode.includes("hidden md:flex"),
      "TryOnPanel component must include hidden md:block/flex responsive hiding"
    );
    assert.ok(
      tryOnPanelCode.includes("selectedLook") && tryOnPanelCode.includes("setSelectedLook"),
      "TryOnPanel must preserve React state hooks and logic intact"
    );
  });

  test("R3.3: Footer packaging flyer is centered on mobile and allows infinite repeated shock animations on click", () => {
    assert.ok(fs.existsSync(footerPath), "components/Footer.tsx must exist");
    const footerCode = fs.readFileSync(footerPath, "utf-8");

    // Centering on mobile breakpoints (< md)
    assert.ok(
      footerCode.includes("justify-center md:justify-end"),
      "Footer packaging flyer column container must use justify-center md:justify-end to center on mobile"
    );

    // Packaging flyer onClick interaction for mobile tap devices
    assert.ok(
      footerCode.includes("onClick={trigger}") || footerCode.includes("onClick="),
      "PackagingFlyer must bind onClick to allow mobile tap triggers"
    );

    // Infinite trigger support via key increment or state reset
    assert.ok(
      (footerCode.includes("shockKey") || footerCode.includes("key=")) && footerCode.includes("setShockKey"),
      "PackagingFlyer must increment shockKey on trigger and apply key={shockKey} for infinite re-triggering"
    );

    // Electric shock keyframes definition
    assert.ok(
      footerCode.includes("@keyframes shock") && footerCode.includes("flyer-shock"),
      "Footer must define @keyframes shock and flyer-shock CSS class"
    );
  });
});
