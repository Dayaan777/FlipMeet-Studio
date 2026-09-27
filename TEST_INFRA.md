# FlipMeet Studio — Automated Test Infrastructure

## Overview
This document defines the automated opaque-box test infrastructure designed and implemented for the FlipMeet Studio storefront optimization project. The test suite provides independent, rigorous verification of all requirements and acceptance criteria specified in `ORIGINAL_REQUEST.md` and `PROJECT.md`:
- **R1**: Video Performance & Initialization (rVFC, Mutex Seeking, Blob Preloading, GPU CSS, and Navbar Scroll Synchronization).
- **R2**: Asset & Image Optimization (AVIF/WebP Formats, Caching Headers, Shimmer/Blur Placeholders, Explicit Thumbnail Sizes, and LCP Priority Flags).
- **R3**: Mobile UX & UI Polish (Homepage Collection Native Swipe/Drag Gestures, AI Try-On Mobile Hiding, and Footer Packaging Flyer Centering & Infinite Shock Animation).
- **R4**: Carousel Layout Fix (`VideoCarousel.tsx` vertical separation between navigation arrows and pagination dots).

---

## Test Architecture & Execution

### Framework & Engine
- **Test Engine**: Node.js Native Test Runner (`node:test`) + Native Assertions (`node:assert/strict`).
- **Zero External Dependencies**: Eliminates package incompatibility risks with React 19 and Next.js 15.1.
- **Fast Execution**: Entire 58-test suite completes in **~1.5 seconds**.
- **Exit Code**: Returns exit code `0` on 100% pass, and non-zero exit code on any regression or failure.

### Test Files Location
All test specifications are located in `tests/e2e/`:
- `tests/e2e/r1-video-performance.test.mjs` — Tier 1: R1 Hero Video & Navbar Synchronizations
- `tests/e2e/r2-image-optimization.test.mjs` — Tier 1: R2 Asset & Image Optimizations
- `tests/e2e/r3-mobile-polish.test.mjs` — Tier 1: R3 Mobile Gestures, AI Try-On Hiding & Footer Flyer
- `tests/e2e/r4-carousel-layout.test.mjs` — Tier 1: R4 Video Carousel Layout Non-Collision
- `tests/e2e/tier2-boundaries.test.mjs` — Tier 2: Boundary & Corner Cases
- `tests/e2e/tier3-cross-feature.test.mjs` — Tier 3: Cross-Feature Interactions & Contracts
- `tests/e2e/tier4-simulation.test.mjs` — Tier 4: Real-World Scenarios & Viewport Simulation
- `tests/e2e/runner.mjs` — Master Test Runner
- `scripts/verify-storefront.mjs` — Colored CLI Verification Script

### Execution Commands
Run the full test suite using either command from the project root:

```powershell
# Master runner script
node scripts/verify-storefront.mjs

# Direct Node.js native test runner
node --test tests/e2e/*.test.mjs
```

To run a specific requirement test:
```powershell
node --test tests/e2e/r1-video-performance.test.mjs
node --test tests/e2e/r2-image-optimization.test.mjs
node --test tests/e2e/r3-mobile-polish.test.mjs
node --test tests/e2e/r4-carousel-layout.test.mjs
```

---

## 4-Tier Test Breakdown

### Tier 1: Feature Coverage (Acceptance Criteria Direct Verification)
Directly validates every individual requirement and acceptance criterion from `ORIGINAL_REQUEST.md`:
1. **R1 Video Performance & Initialization** (`tests/e2e/r1-video-performance.test.mjs`):
   - **R1.1**: Verifies removal of the 60Hz idle RAF canvas blit loop when stationary (`tick()` RAF loop).
   - **R1.2**: Verifies complete removal of `video.fastSeek()` to prevent keyframe jumping on WebKit/Chrome.
   - **R1.3**: Verifies non-blocking mutex seeking pipeline (`isSeeking` mutex lock + `pendingTargetTime` queue).
   - **R1.4**: Verifies integration of `requestVideoFrameCallback` (rVFC) with `seeked` event fallback.
   - **R1.5**: Verifies in-memory Blob preloading (`URL.createObjectURL(blob)`) with automatic unmount cleanup (`URL.revokeObjectURL`).
   - **R1.6**: Verifies GPU acceleration CSS hints (`transform-gpu`, `will-change-transform`, `contain-paint`).
   - **R1.7**: Verifies completion sentinel `#hero-sentinel` at the bottom of the hero container.
   - **R1.8**: Verifies `ProcessVideoScrubber.tsx` modernizes to Canvas 2D + rVFC + mutex seeking + `#process-hero-sentinel`.
   - **R1.9**: Verifies `app/layout.tsx` declares `<link rel="preload" as="video">` for process video assets.
   - **R1.10**: Verifies `NavBar.tsx` eliminates the hardcoded 600vh threshold, dynamically calculates hero container sequence conclusions, triggers immediate appearance (`translate-y-0 opacity-100`), and enables solid backdrop blur on `/process`.

2. **R2 Asset & Image Optimization** (`tests/e2e/r2-image-optimization.test.mjs`):
   - **R2.1**: Verifies `next.config.ts` declares AVIF/WebP formats, 1-year `minimumCacheTTL: 31536000`, responsive device/image sizes, and immutable caching headers for `/images/:path*`, `/videos/:path*`, and `/favicon.png`.
   - **R2.2**: Verifies `lib/image-placeholder.ts` exports `DARK_BLUR_DATA_URL` and `shimmerBlurDataUrl(w, h)`, confirming valid base64 SVG data URIs with `#141414` fill and animated metallic gradient.
   - **R2.3**: Verifies explicit `sizes` props on `<Image fill>` across cart (`64px, 80px`), checkout (`48px`), dashboard (`32px` & `48px`), and admin (`48px`) to prevent downloading 1920px+ images for thumbnails.
   - **R2.4**: Verifies `priority` flags on above-the-fold and LCP images: `app/anime/page.tsx` mobile hero, `components/Hero.tsx` mobile hero, `app/shop/ShopClient.tsx` first 4 products, and `components/AnimeDropReveal.tsx` first look.
   - **R2.5**: Verifies blur placeholder strategy in `LookCarousel.tsx` and `ShopClient.tsx`.

3. **R3 Mobile UX & UI Polish** (`tests/e2e/r3-mobile-polish.test.mjs`):
   - **R3.1**: Verifies native touch swipeable/draggable gestures in `LookCarousel.tsx` (`onTouchStart`, `onTouchMove`, `onTouchEnd`), horizontal delta threshold ($\ge 40\text{px}$), `touch-pan-y` vertical scroll preservation, and `isSwiping` lock preventing accidental link clicks.
   - **R3.2**: Verifies AI Try-On is conditionally hidden on mobile viewports using standard CSS (`hidden md:block` / `hidden md:flex`) in `ProductDetailClient.tsx` and `TryOnPanel.tsx` while keeping React state and logic intact.
   - **R3.3**: Verifies footer packaging flyer in `Footer.tsx` is centered on mobile (`justify-center md:justify-end`), has `onClick` tap handler for touch devices, and supports infinite repeated shock animations via incrementing key counter (`shockKey`).

4. **R4 Carousel Layout Fix** (`tests/e2e/r4-carousel-layout.test.mjs`):
   - **R4.1**: Verifies VideoCarousel exists and defines navigation arrows and pagination dots.
   - **R4.2**: Verifies pagination dots are vertically repositioned down (e.g. `mt-10 sm:mt-6` or bottom container) to eliminate overlap with navigation arrows.
   - **R4.3**: Verifies mobile navigation arrows are vertically separated (e.g. `bottom-12 sm:bottom-auto`) from dots.
   - **R4.4**: Verifies spatial coordinate calculation guarantees zero collision ($[y_{\text{arrow}}] \cap [y_{\text{dots}}] = \emptyset$).

---

### Tier 2: Boundary & Corner Cases (`tests/e2e/tier2-boundaries.test.mjs`)
Validates edge conditions and stress boundaries:
- **T2.1 Swipe Threshold & Direction Discrimination**:
  - Touch delta under threshold ($39\text{px}$) results in `none` (prevents jitter/accidental navigation).
  - Exact threshold ($40\text{px}$) requires strictly exceeding threshold.
  - $41\text{px}$ delta cleanly triggers navigation in left/right directions.
  - Diagonal gesture ($|\Delta X| = |\Delta Y|$) is discarded to prevent false triggers during diagonal scroll.
  - Vertical-dominant scroll ($|\Delta Y| > |\Delta X|$) is never intercepted as a horizontal swipe.
- **T2.2 Circular Modulo Index Wrap-Around**:
  - Backward shift from index 0 wraps cleanly to `count - 1`.
  - Forward shift from index `count - 1` wraps cleanly to `0`.
  - Multi-shift stress test confirms index stays bounded within $[0, \text{count} - 1]$.
- **T2.3 Shimmer SVG Generation Edge Cases**:
  - Zero dimensions ($0 \times 0$) generate valid XML without errors.
  - High-resolution dimensions ($3840 \times 2160$) scale properly.
  - Base64 encoding roundtrips cleanly without corruption or loss.
- **T2.4 Video Seek Clamping**:
  - Negative seek times clamp strictly to $0.0\text{s}$.
  - Times exceeding duration clamp strictly to `video.duration`.
  - Sub-millisecond targets ($< 0.001\text{s}$) avoid unnecessary decode cycles.
- **T2.5 Packaging Flyer Rapid Click Stress**:
  - Simulates 100 rapid successive tap events; confirms `shockKey` increments monotonically without deadlock.
- **T2.6 Scroll Progress Clamping**:
  - Overscroll above top ($\text{scrolled} < 0$) clamps strictly to $0.0$.
  - Overscroll past bottom ($\text{scrolled} > \text{maxScroll}$) clamps strictly to $1.0$.
  - Zero or negative maxScroll returns $0.0$ without `NaN` or division by zero.

---

### Tier 3: Cross-Feature Interactions & Contracts (`tests/e2e/tier3-cross-feature.test.mjs`)
Validates interface contracts between components and pages:
- **T3.1 Hero Container Heights vs Navbar Scroll Triggers**:
  - Homepage Hero: Mobile container `350vh` ($2.5 \times \text{innerHeight}$ travel) and Desktop container `500vh` ($4.0 \times \text{innerHeight}$ travel) align with Navbar trigger points.
  - Process Page: Container `400vh` ($3.0 \times \text{innerHeight}$ travel) aligns with Navbar trigger points.
  - Sentinel IDs `#hero-sentinel` and `#process-hero-sentinel` strictly match query selectors in `NavBar.tsx`.
- **T3.2 Cache Header Parity**:
  - Verifies that `/videos/:path*`, `/images/:path*`, and `/favicon.png` all enforce identical `public, max-age=31536000, immutable` policies.
- **T3.3 Swipe Gesture State vs Card Link Navigation**:
  - Verifies that when `isSwiping.current` is true, card `<Link>` `onClick` invokes `e.preventDefault()`, but allows navigation when tapping without swiping.
- **T3.4 Process Page Layout Preload Parity**:
  - Verifies that `<link rel="preload">` URLs in `app/layout.tsx` match the exact media sources used in `ProcessVideoScrubber.tsx`.
- **T3.5 AI Try-On Styling Parity Across Routes**:
  - Verifies consistent `hidden md:block` / `hidden md:flex` across `ProductDetailClient.tsx` and `TryOnPanel.tsx`.

---

### Tier 4: Real-World Scenarios & Simulations (`tests/e2e/tier4-simulation.test.mjs`)
Validates real-world browser execution and filesystem state:
- **T4.1 Static Media Asset Integrity**:
  - Verifies all 4 hero video MP4 files exist on disk in `public/videos/` and are non-empty (> 1 MB each).
  - Verifies key brand and packaging images exist in `public/images/`.
- **T4.2 Viewport CSS Class Simulation**:
  - Simulates Tailwind breakpoint compilation at 390px (Mobile) and 1280px (Desktop):
    - Mobile: AI Try-On resolves to `display: none`; Packaging flyer resolves to `justify-content: center`; Hero resolves to `350vh`.
    - Desktop: AI Try-On resolves to `display: block`; Packaging flyer resolves to `justify-content: end`; Hero resolves to `500vh`.
- **T4.3 High-Stress Mutex Video Scrubber Simulation**:
  - Simulates high-frequency scroll bursts; verifies state machine queues in-flight seeks and processes latest target without abort deadlock.
- **T4.4 Video Carousel Mobile Non-Collision Coordinate Simulation**:
  - Calculates mobile bounding box intervals and proves mathematical impossibility of collision with offset arrows ($[H-88, H-48] \cap [H-24, H] = \emptyset$).
