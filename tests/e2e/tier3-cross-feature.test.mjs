import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

describe("Tier 3: Cross-Feature Interactions & Architectural Contracts", () => {
  const videoHeroPath = path.join(ROOT, "components", "VideoHero.tsx");
  const processScrubberPath = path.join(ROOT, "components", "ProcessVideoScrubber.tsx");
  const navBarPath = path.join(ROOT, "components", "NavBar.tsx");
  const layoutPath = path.join(ROOT, "app", "layout.tsx");
  const nextConfigPath = path.join(ROOT, "next.config.ts");
  const lookCarouselPath = path.join(ROOT, "components", "LookCarousel.tsx");
  const productDetailPath = path.join(ROOT, "app", "product", "[slug]", "ProductDetailClient.tsx");
  const tryOnPanelPath = path.join(ROOT, "components", "TryOnPanel.tsx");

  test("T3.1: Hero Container Heights match Navbar Scroll Trigger Points with Zero Dead Zone", () => {
    const heroCode = fs.readFileSync(videoHeroPath, "utf-8");
    const scrubberCode = fs.readFileSync(processScrubberPath, "utf-8");
    const navCode = fs.readFileSync(navBarPath, "utf-8");

    // Homepage Hero container height contract
    assert.ok(
      heroCode.includes("h-[350vh]") && heroCode.includes("md:h-[500vh]"),
      "VideoHero container height contract: h-[350vh] mobile, md:h-[500vh] desktop"
    );

    // Process page Scrubber container height contract
    assert.ok(
      scrubberCode.includes("height: \"400vh\"") || scrubberCode.includes("400vh"),
      "ProcessVideoScrubber container height contract: 400vh"
    );

    // Check sentinel IDs match
    assert.ok(
      heroCode.includes("id=\"hero-sentinel\"") && navCode.includes("hero-sentinel"),
      "VideoHero sentinel ID must match NavBar querySelector/getElementById ID"
    );
    assert.ok(
      scrubberCode.includes("id=\"process-hero-sentinel\"") && navCode.includes("process-hero-sentinel"),
      "ProcessVideoScrubber sentinel ID must match NavBar querySelector/getElementById ID"
    );

    // Fallback arithmetic check in NavBar
    // For mobile (350vh), total scroll distance is (3.5 - 1) * innerHeight = 2.5 * innerHeight
    // For desktop (500vh), total scroll distance is (5.0 - 1) * innerHeight = 4.0 * innerHeight
    // For process (400vh), total scroll distance is (4.0 - 1) * innerHeight = 3.0 * innerHeight
    const hasAccurateFallbacks = (navCode.includes("3.5") || navCode.includes("2.5")) &&
      (navCode.includes("5.0") || navCode.includes("4.0")) &&
      navCode.includes("3.0");
    assert.ok(
      hasAccurateFallbacks,
      "NavBar fallback calculations must accurately match container heights (3.5vh/2.5x, 5.0vh/4.0x, 3.0x)"
    );
  });

  test("T3.2: Cache Header Parity Across Static Media (Videos, Images, Favicon)", () => {
    const configCode = fs.readFileSync(nextConfigPath, "utf-8");

    const expectedHeader = "public, max-age=31536000, immutable";
    const videoHeaderConfig = configCode.includes("/videos/:path*") && configCode.includes(expectedHeader);
    const imageHeaderConfig = configCode.includes("/images/:path*") && configCode.includes(expectedHeader);
    const faviconHeaderConfig = configCode.includes("/favicon.png") && configCode.includes(expectedHeader);

    assert.ok(videoHeaderConfig, "Videos route must be configured with 1-year immutable cache header");
    assert.ok(imageHeaderConfig, "Images route must be configured with 1-year immutable cache header");
    assert.ok(faviconHeaderConfig, "Favicon route must be configured with 1-year immutable cache header");
  });

  test("T3.3: Swipe Gesture State Exclusively Locks Card Link Navigation", () => {
    const lookCode = fs.readFileSync(lookCarouselPath, "utf-8");

    // Verify Link element has onClick guarding with isSwiping.current
    const linkOnClickMatch = lookCode.match(/onClick=\{\(e\)\s*=>\s*\{[\s\S]*?isSwiping[\s\S]*?preventDefault\(\)[\s\S]*?\}\}/);
    assert.ok(
      linkOnClickMatch,
      "LookCarousel outfit card Links must conditionally call preventDefault() when isSwiping.current is true"
    );

    // Verify timeout releases swipe lock after completion
    assert.ok(
      lookCode.includes("setTimeout") && lookCode.includes("isSwiping.current = false"),
      "LookCarousel must schedule isSwiping.current release via setTimeout"
    );
  });

  test("T3.4: Process Page Layout Preload Parity", () => {
    const layoutCode = fs.readFileSync(layoutPath, "utf-8");
    const scrubberCode = fs.readFileSync(processScrubberPath, "utf-8");

    const mobileVideo = "/videos/process-page.mp4";
    const desktopVideo = "/videos/process-page-desktop.mp4";

    assert.ok(scrubberCode.includes(mobileVideo), "Process scrubber must reference mobile video");
    assert.ok(scrubberCode.includes(desktopVideo), "Process scrubber must reference desktop video");

    assert.ok(layoutCode.includes(mobileVideo), "app/layout.tsx must preload mobile process video");
    assert.ok(layoutCode.includes(desktopVideo), "app/layout.tsx must preload desktop process video");
  });

  test("T3.5: AI Try-On Component Styling Parity Across Routes", () => {
    const productDetailCode = fs.readFileSync(productDetailPath, "utf-8");
    const tryOnPanelCode = fs.readFileSync(tryOnPanelPath, "utf-8");

    assert.ok(
      productDetailCode.includes("hidden md:block") || productDetailCode.includes("hidden md:flex"),
      "ProductDetailClient AI Try-On section must use hidden md:block/flex"
    );
    assert.ok(
      tryOnPanelCode.includes("hidden md:block") || tryOnPanelCode.includes("hidden md:flex"),
      "TryOnPanel component section must use hidden md:block/flex"
    );
  });
});
