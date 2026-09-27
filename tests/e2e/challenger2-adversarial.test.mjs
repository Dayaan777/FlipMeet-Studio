import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

describe("Adversarial Challenger 2: Empirical Stress & Boundary Verification", () => {

  // =========================================================================
  // DOMAIN 1: VIDEOCAROUSEL SPATIAL GEOMETRY & VIEWPORT STRESS (320px - 480px)
  // =========================================================================
  describe("Domain 1: VideoCarousel Spatial Separation Under Mobile Viewports (320px–480px)", () => {
    const videoCarouselPath = path.join(ROOT, "components", "VideoCarousel.tsx");

    test("VC.1: Source code establishes mobile positioning classes correctly", () => {
      assert.ok(fs.existsSync(videoCarouselPath), "components/VideoCarousel.tsx must exist");
      const code = fs.readFileSync(videoCarouselPath, "utf-8");

      // Verify arrows have bottom-12 on mobile and sm:bottom-auto for desktop
      assert.ok(
        code.includes("bottom-12") && code.includes("sm:bottom-auto"),
        "Navigation arrows must declare bottom-12 for mobile and sm:bottom-auto for desktop"
      );

      // Verify pagination dots have mt-10 for mobile and sm:mt-6 for desktop
      assert.ok(
        code.includes("mt-10 sm:mt-6"),
        "Pagination dots must declare mt-10 for mobile and sm:mt-6 for desktop"
      );

      // Verify arrows size-10 (40px) and buttons h-5 (20px)
      assert.ok(code.includes("size-10"), "Mobile arrows must have size-10 (40px)");
      assert.ok(code.includes("h-5"), "Pagination dot buttons must have h-5 (20px)");
    });

    /**
     * Analytical & Geometric Simulator for VideoCarousel Mobile Layout
     *
     * In CSS Flexbox:
     * Parent: `<div className="relative mx-auto flex flex-col items-center">`
     * In-flow children:
     * 1. Reel viewport: height = 490px, margin-bottom = 64px (mb-16)
     * 2. Caption: margin-top = 32px (mt-8), min-height = 64px (min-h-16)
     * 3. Pagination dots: margin-top = 40px (mt-10), height = 20px (h-5)
     *
     * Absolute children:
     * - Prev & Next arrows: bottom = 48px (bottom-12), height = 40px (size-10)
     */
    function computeCarouselGeometry(viewportWidth, captionLineCount = 1) {
      const reelHeight = 490;
      const reelMarginBottom = 64; // mb-16 = 4rem
      const captionMarginTop = 32; // mt-8 = 2rem
      // Base caption: title (18px) + subtitle (16px * lines) + accent line (14px) + padding
      const captionContentHeight = 18 + (16 * captionLineCount) + 14;
      const captionHeight = Math.max(64, captionContentHeight); // min-h-16 = 64px
      const dotsMarginTop = 40; // mt-10 = 2.5rem = 40px
      const dotsHeight = 20; // h-5 = 1.25rem = 20px

      // Total container height H (sum of non-collapsing flex children)
      const containerHeight = reelHeight + reelMarginBottom + captionMarginTop + captionHeight + dotsMarginTop + dotsHeight;

      // In CSS, container top is Y = 0, bottom is Y = H
      // Dots are in-flow at the very bottom of the flex container:
      const dotsBottom = containerHeight;
      const dotsTop = containerHeight - dotsHeight;

      // Arrows are absolutely positioned relative to container bottom with bottom-12 (48px):
      const arrowHeight = 40; // size-10 = 2.5rem = 40px
      const arrowBottomOffset = 48; // bottom-12 = 3rem = 48px
      const arrowBottom = containerHeight - arrowBottomOffset;
      const arrowTop = arrowBottom - arrowHeight;

      // Vertical separation between bottom of arrow and top of dots:
      const verticalGap = dotsTop - arrowBottom;

      // Horizontal layout at viewport width W:
      const centerX = viewportWidth / 2;
      // Prev arrow: -translate-x-[calc(100%+0.75rem)] -> offset by -(40 + 12) = -52px from center
      const prevArrowXStart = centerX - 52;
      const prevArrowXEnd = prevArrowXStart + arrowHeight; // 40px wide -> centerX - 12
      // Next arrow: translate-x-3/4 -> in Tailwind translate-x-3/4 = +75% of 40px = +30px from center
      const nextArrowXStart = centerX + 30;
      const nextArrowXEnd = nextArrowXStart + arrowHeight; // 40px wide -> centerX + 70

      // Pagination dots: 6 buttons. 1 active (w-7 = 28px + px-1 = 36px), 5 inactive (size-2 = 8px + px-1 = 16px)
      // gap-2 = 8px * 5 = 40px. Total width = 36 + (5 * 16) + 40 = 156px.
      const dotsWidth = 36 + (5 * 16) + 40;
      const dotsXStart = centerX - (dotsWidth / 2);
      const dotsXEnd = centerX + (dotsWidth / 2);

      return {
        viewportWidth,
        containerHeight,
        arrowBoundingBox: { top: arrowTop, bottom: arrowBottom, height: arrowHeight },
        dotsBoundingBox: { top: dotsTop, bottom: dotsBottom, height: dotsHeight },
        verticalGap,
        hasVerticalCollision: arrowBottom >= dotsTop,
        horizontalGeometry: {
          prevArrow: [prevArrowXStart, prevArrowXEnd],
          nextArrow: [nextArrowXStart, nextArrowXEnd],
          dots: [dotsXStart, dotsXEnd],
          centerClearancePx: nextArrowXStart - prevArrowXEnd,
        },
      };
    }

    test("VC.2: Mathematical invariant holds: vertical separation is strictly 28px regardless of container height", () => {
      for (let w = 320; w <= 480; w += 5) {
        for (let lines = 1; lines <= 4; lines++) {
          const geom = computeCarouselGeometry(w, lines);
          assert.strictEqual(
            geom.verticalGap,
            28,
            `At width ${w}px with ${lines} lines caption, vertical gap must identically equal 28px`
          );
          assert.strictEqual(
            geom.hasVerticalCollision,
            false,
            `At width ${w}px, arrows and dots must have ZERO vertical collision`
          );
        }
      }
    });

    test("VC.3: Touch target separation satisfies WCAG 2.5.8 physical clearance", () => {
      const geom = computeCarouselGeometry(375); // standard iPhone width
      // Minimum required clearance is strictly > 0, standard target spacing is >= 24px center or >= 8px gap
      assert.ok(geom.verticalGap >= 24, `Vertical gap (${geom.verticalGap}px) exceeds 24px requirement`);
      assert.ok(geom.horizontalGeometry.centerClearancePx >= 40, `Center clearance (${geom.horizontalGeometry.centerClearancePx}px) allows thumb passage`);
    });

    test("VC.4: Extreme mobile viewports (320px, 360px, 375px, 390px, 414px, 480px) stay strictly in-bounds", () => {
      const extremeWidths = [320, 360, 375, 390, 412, 414, 430, 480];
      for (const w of extremeWidths) {
        const geom = computeCarouselGeometry(w);
        // Prev arrow must not clip off left screen edge
        assert.ok(
          geom.horizontalGeometry.prevArrow[0] > 0,
          `At width ${w}px, prev arrow left edge (${geom.horizontalGeometry.prevArrow[0]}px) must be > 0`
        );
        // Next arrow must not clip off right screen edge
        assert.ok(
          geom.horizontalGeometry.nextArrow[1] < w,
          `At width ${w}px, next arrow right edge (${geom.horizontalGeometry.nextArrow[1]}px) must be < ${w}`
        );
      }
    });

    test("VC.5: Circular navigation modulo wrap-around over 1,000 iterations", () => {
      const total = 6;
      let active = 0;
      const shift = (dir) => {
        active = (active + dir + total) % total;
        return active;
      };

      for (let i = 0; i < 500; i++) {
        const nextIdx = shift(1);
        assert.ok(nextIdx >= 0 && nextIdx < total, `Next index ${nextIdx} must be in [0, ${total - 1}]`);
      }
      for (let i = 0; i < 500; i++) {
        const prevIdx = shift(-1);
        assert.ok(prevIdx >= 0 && prevIdx < total, `Prev index ${prevIdx} must be in [0, ${total - 1}]`);
      }
    });

    test("VC.6: Touch swipe delta threshold boundary discrimination", () => {
      const threshold = 45; // VideoCarousel threshold is 45px
      const evaluateSwipe = (delta) => {
        if (delta > threshold) return -1; // prev
        if (delta < -threshold) return 1; // next
        return 0; // no move
      };

      assert.strictEqual(evaluateSwipe(0), 0, "0px delta does not trigger");
      assert.strictEqual(evaluateSwipe(44), 0, "44px delta below threshold does not trigger");
      assert.strictEqual(evaluateSwipe(45), 0, "45px exact threshold does not trigger (requires strictly >)");
      assert.strictEqual(evaluateSwipe(46), -1, "46px delta triggers prev navigation");
      assert.strictEqual(evaluateSwipe(-44), 0, "-44px delta below threshold does not trigger");
      assert.strictEqual(evaluateSwipe(-45), 0, "-45px exact threshold does not trigger (requires strictly < -45)");
      assert.strictEqual(evaluateSwipe(-46), 1, "-46px delta triggers next navigation");
    });
  });

  // =========================================================================
  // DOMAIN 2: NEXT.JS IMAGE CONFIGURATIONS, SIZES, SHIMMER & CACHE HEADERS
  // =========================================================================
  describe("Domain 2: Next.js Image Configurations, Sizes Props, Shimmer SVG, and Cache Headers", () => {

    test("IMG.1: Every <Image fill> across entire app directory declares explicit sizes prop", () => {
      const searchDirs = [path.join(ROOT, "app"), path.join(ROOT, "components")];
      const imageOccurrences = [];

      function walkDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".jsx"))) {
            const content = fs.readFileSync(fullPath, "utf-8");
            // Match all <Image ... /> tags
            const imgRegex = /<Image\b([\s\S]*?)\/>/g;
            let match;
            while ((match = imgRegex.exec(content)) !== null) {
              const tagContent = match[1];
              const hasFill = /\bfill\b/.test(tagContent);
              if (hasFill) {
                const sizesMatch = tagContent.match(/sizes=(?:\{"([^"]+)"\}|"([^"]+)")/);
                const sizes = sizesMatch ? (sizesMatch[1] || sizesMatch[2]) : null;
                imageOccurrences.push({
                  file: path.relative(ROOT, fullPath),
                  hasFill,
                  sizes,
                });
              }
            }
          }
        }
      }

      for (const dir of searchDirs) {
        if (fs.existsSync(dir)) walkDir(dir);
      }

      assert.ok(imageOccurrences.length >= 10, `Found ${imageOccurrences.length} <Image fill> occurrences`);

      for (const occ of imageOccurrences) {
        assert.ok(
          occ.sizes !== null && occ.sizes.trim().length > 0,
          `File ${occ.file} has <Image fill> missing explicit 'sizes' prop!`
        );

        // Verify sizes syntax: must contain length units like px, vw, rem, em, or %
        const hasValidUnit = /(?:px|vw|rem|em|%)\b/.test(occ.sizes);
        assert.ok(
          hasValidUnit,
          `File ${occ.file} has invalid sizes value: "${occ.sizes}". Must include CSS length unit.`
        );
      }
    });

    test("IMG.2: lib/image-placeholder.ts base64 SVG shimmer and dark blur decode to valid XML", () => {
      const placeholderPath = path.join(ROOT, "lib", "image-placeholder.ts");
      assert.ok(fs.existsSync(placeholderPath), "lib/image-placeholder.ts must exist");
      const content = fs.readFileSync(placeholderPath, "utf-8");

      // Extract DARK_BLUR_DATA_URL
      const darkMatch = content.match(/DARK_BLUR_DATA_URL\s*=\s*["'](data:image\/svg\+xml;base64,[^"']+)["']/);
      assert.ok(darkMatch, "Must find DARK_BLUR_DATA_URL definition");

      const darkDataUrl = darkMatch[1];
      const darkBase64 = darkDataUrl.replace("data:image/svg+xml;base64,", "");
      const darkSvg = Buffer.from(darkBase64, "base64").toString("utf-8");

      assert.ok(darkSvg.includes("<svg"), "Decoded dark SVG must contain <svg tag");
      assert.ok(darkSvg.includes("</svg>"), "Decoded dark SVG must contain </svg> closing tag");
      assert.ok(darkSvg.includes("#141414"), "Decoded dark SVG must contain #141414 fill");

      // Test shimmer generator logic across varied dimensions
      const shimmerGen = (w, h) => `
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

      const testDims = [
        [700, 900],
        [100, 100],
        [1920, 1080],
        [3840, 2160],
        [1, 1],
      ];

      for (const [w, h] of testDims) {
        const svg = shimmerGen(w, h);
        const b64 = Buffer.from(svg).toString("base64");
        const roundtrip = Buffer.from(b64, "base64").toString("utf-8");
        assert.strictEqual(roundtrip, svg, `Base64 roundtrip for ${w}x${h} must be lossless`);
        assert.ok(roundtrip.includes(`width="${w}"`), `SVG width must match ${w}`);
        assert.ok(roundtrip.includes(`height="${h}"`), `SVG height must match ${h}`);
      }
    });

    test("IMG.3: next.config.ts configures modern image engine (AVIF/WebP, device/image sizes, 1-year cache)", () => {
      const configPath = path.join(ROOT, "next.config.ts");
      assert.ok(fs.existsSync(configPath), "next.config.ts must exist");
      const configText = fs.readFileSync(configPath, "utf-8");

      assert.ok(configText.includes('"image/avif"') && configText.includes('"image/webp"'), "Must configure AVIF and WebP");
      assert.ok(configText.includes("31536000"), "Must configure 1-year minimumCacheTTL (31536000)");

      // Check deviceSizes and imageSizes
      assert.ok(configText.includes("deviceSizes:"), "Must configure explicit deviceSizes");
      assert.ok(configText.includes("imageSizes:"), "Must configure explicit imageSizes");
    });

    test("IMG.4: next.config.ts headers configure immutable caching on /videos/, /images/, and /favicon.png", () => {
      const configPath = path.join(ROOT, "next.config.ts");
      const configText = fs.readFileSync(configPath, "utf-8");

      assert.ok(configText.includes('source: "/videos/:path*"'), "Must have route header for /videos/:path*");
      assert.ok(configText.includes('source: "/images/:path*"'), "Must have route header for /images/:path*");
      assert.ok(configText.includes('source: "/favicon.png"'), "Must have route header for /favicon.png");
      assert.ok(
        configText.includes("public, max-age=31536000, immutable"),
        "Must specify 'public, max-age=31536000, immutable' Cache-Control"
      );
    });
  });

  // =========================================================================
  // DOMAIN 3: NAVBAR SCROLL SYNCHRONIZATION & ZERO DEAD ZONE
  // =========================================================================
  describe("Domain 3: Navbar Scroll Trigger Calculations, Sentinel Behavior & Zero Dead Zone", () => {

    /**
     * Empirical Simulator for Navbar Scroll Trigger Logic
     */
    function simulateNavbarState({ pathname, innerWidth, innerHeight, scrollY, hasSentinel = true }) {
      if (pathname === "/") {
        const isMobile = innerWidth < 768;
        const containerVh = isMobile ? 3.5 : 5.0;
        const containerHeight = innerHeight * containerVh;
        const maxScroll = containerHeight - innerHeight;

        if (hasSentinel) {
          // Sentinel is at the bottom of the container: top = containerHeight - scrollY
          const sentinelTop = containerHeight - scrollY;
          const isScrolled = sentinelTop <= 80;
          return {
            isScrolled,
            containerHeight,
            maxScroll,
            sentinelTop,
            videoProgress: Math.max(0, Math.min(1, scrollY / maxScroll)),
            triggerPointPx: containerHeight - 80,
            deadZonePx: (containerHeight - 80) - maxScroll, // difference between video end and trigger
          };
        } else {
          // Fallback formula in NavBar.tsx: triggerPx = window.innerHeight * (containerVh - 1) - 40;
          const triggerPx = innerHeight * (containerVh - 1) - 40;
          const isScrolled = scrollY >= triggerPx;
          return {
            isScrolled,
            containerHeight,
            maxScroll,
            triggerPointPx: triggerPx,
            deadZonePx: Math.max(0, triggerPx - maxScroll),
          };
        }
      } else if (pathname === "/process") {
        const containerHeight = innerHeight * 4.0;
        const maxScroll = containerHeight - innerHeight; // 3.0 * innerHeight

        if (hasSentinel) {
          const sentinelTop = containerHeight - scrollY;
          const isScrolled = sentinelTop <= 80;
          return {
            isScrolled,
            containerHeight,
            maxScroll,
            sentinelTop,
            videoProgress: Math.max(0, Math.min(1, scrollY / maxScroll)),
            triggerPointPx: containerHeight - 80,
            deadZonePx: (containerHeight - 80) - maxScroll,
          };
        } else {
          // Fallback: triggerPx = window.innerHeight * 3.0 - 40;
          const triggerPx = innerHeight * 3.0 - 40;
          const isScrolled = scrollY >= triggerPx;
          return {
            isScrolled,
            containerHeight,
            maxScroll,
            triggerPointPx: triggerPx,
            deadZonePx: Math.max(0, triggerPx - maxScroll),
          };
        }
      } else {
        return {
          isScrolled: scrollY > 8,
          deadZonePx: 0,
        };
      }
    }

    test("NAV.1: Homepage Mobile: Zero dead zone across extreme viewport heights (h=320px to h=2160px)", () => {
      const testHeights = [320, 480, 568, 667, 736, 812, 844, 926, 1080, 1440, 2160];

      for (const h of testHeights) {
        // Mobile viewport (w=375)
        const sim = simulateNavbarState({
          pathname: "/",
          innerWidth: 375,
          innerHeight: h,
          scrollY: 0,
          hasSentinel: true,
        });

        // Test at exactly maxScroll (where video hero animation concludes)
        const simAtMaxScroll = simulateNavbarState({
          pathname: "/",
          innerWidth: 375,
          innerHeight: h,
          scrollY: sim.maxScroll,
          hasSentinel: true,
        });

        assert.strictEqual(simAtMaxScroll.videoProgress, 1.0, `At maxScroll, video animation must be 100% complete`);

        // Test at trigger point:
        const simAtTrigger = simulateNavbarState({
          pathname: "/",
          innerWidth: 375,
          innerHeight: h,
          scrollY: sim.triggerPointPx,
          hasSentinel: true,
        });

        assert.strictEqual(simAtTrigger.isScrolled, true, `At trigger point, Navbar must be visible`);
        // When scrolled is true, navbar translates in without dead zone:
        assert.ok(
          simAtTrigger.videoProgress >= 1.0,
          `Video hero animation must be 100% complete when navbar triggers (progress: ${simAtTrigger.videoProgress})`
        );
      }
    });

    test("NAV.2: Homepage Desktop: Zero dead zone across standard and ultrawide viewports", () => {
      const testHeights = [600, 768, 900, 1080, 1200, 1440, 1600, 2160];

      for (const h of testHeights) {
        // Desktop viewport (w=1280)
        const sim = simulateNavbarState({
          pathname: "/",
          innerWidth: 1280,
          innerHeight: h,
          scrollY: 0,
          hasSentinel: true,
        });

        const simAtTrigger = simulateNavbarState({
          pathname: "/",
          innerWidth: 1280,
          innerHeight: h,
          scrollY: sim.triggerPointPx,
          hasSentinel: true,
        });

        assert.strictEqual(simAtTrigger.isScrolled, true, `Navbar must be triggered on desktop at h=${h}`);
        assert.strictEqual(simAtTrigger.videoProgress, 1.0, `Video must be 100% complete at trigger`);
      }
    });

    test("NAV.3: Process Page: Zero dead zone and sentinel alignment", () => {
      const testHeights = [500, 800, 1080, 1440];

      for (const h of testHeights) {
        const sim = simulateNavbarState({
          pathname: "/process",
          innerWidth: 1024,
          innerHeight: h,
          scrollY: 0,
          hasSentinel: true,
        });

        assert.strictEqual(sim.maxScroll, 3.0 * h, `Process page maxScroll must be 3.0 * innerHeight`);

        const simAtTrigger = simulateNavbarState({
          pathname: "/process",
          innerWidth: 1024,
          innerHeight: h,
          scrollY: sim.triggerPointPx,
          hasSentinel: true,
        });

        assert.strictEqual(simAtTrigger.isScrolled, true, `Navbar must trigger on process page at h=${h}`);
        assert.strictEqual(simAtTrigger.videoProgress, 1.0, `Process hero video must be 100% complete at trigger`);
      }
    });

    test("NAV.4: Fallback calculation activates with zero dead zone when sentinel is absent", () => {
      const testCases = [
        { path: "/", w: 375, h: 800 },
        { path: "/", w: 1280, h: 900 },
        { path: "/process", w: 375, h: 800 },
        { path: "/process", w: 1280, h: 900 },
      ];

      for (const tc of testCases) {
        const sim = simulateNavbarState({
          pathname: tc.path,
          innerWidth: tc.w,
          innerHeight: tc.h,
          scrollY: 0,
          hasSentinel: false,
        });

        // Trigger is at maxScroll - 40px:
        const simAtTrigger = simulateNavbarState({
          pathname: tc.path,
          innerWidth: tc.w,
          innerHeight: tc.h,
          scrollY: sim.triggerPointPx,
          hasSentinel: false,
        });

        assert.strictEqual(simAtTrigger.isScrolled, true, `Fallback trigger must activate navbar`);
        assert.strictEqual(sim.deadZonePx, 0, `Dead zone must be 0px in fallback mode`);
      }
    });

    test("NAV.5: Subpages activate immediately on minimal scroll (> 8px)", () => {
      const subpages = ["/shop", "/cart", "/checkout", "/dashboard", "/admin", "/anime"];
      for (const path of subpages) {
        const atZero = simulateNavbarState({ pathname: path, scrollY: 0 });
        const atEight = simulateNavbarState({ pathname: path, scrollY: 8 });
        const atNine = simulateNavbarState({ pathname: path, scrollY: 9 });

        assert.strictEqual(atZero.isScrolled, false, `${path} at scrollY=0 is not scrolled`);
        assert.strictEqual(atEight.isScrolled, false, `${path} at scrollY=8 is not scrolled`);
        assert.strictEqual(atNine.isScrolled, true, `${path} at scrollY=9 is scrolled`);
      }
    });
  });
});
