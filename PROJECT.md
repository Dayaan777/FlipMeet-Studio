# Project: FlipMeet Studio Storefront Optimization

## Architecture
- **Framework**: Next.js 15.1.11 (App Router), React 19.0.4, TypeScript 5.7.2, Tailwind CSS.
- **Image Engine**: Next.js Image Optimization with native `sharp` (0.33.5), AVIF/WebP formats, aggressive edge/browser caching.
- **Video Scrubbing Engine**: Canvas 2D + `requestVideoFrameCallback` + in-memory Blob preloading (`URL.createObjectURL`) + non-blocking mutex seeking.
- **Responsive Layout**: Tailwind breakpoints (`md:`, `sm:`), mobile touch gestures, CSS containment, and dynamic scroll synchronization.

## Feature Inventory
Every feature from the survey phase mapped to a milestone:

| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Homepage Video Scrubbing Optimization | Remove 60Hz idle RAF canvas blit; replace `fastSeek` with mutex seeking; integrate `requestVideoFrameCallback`; implement Blob preloading; add GPU CSS hints (`transform-gpu`, `contain-paint`). | M1 | Survey (Explorer 1) & ORIGINAL_REQUEST §R1 | DONE |
| 2 | Process Page Video Scrubber Modernization | Adopt Canvas 2D + rVFC architecture; eliminate seek abort flooding; eliminate initial client mount black screen; add layout preload links; implement Blob preloading. | M1 | Survey (Explorer 1) & ORIGINAL_REQUEST §R1 | DONE |
| 3 | Navbar Mount & Visibility Synchronization | Replace hardcoded 600vh scroll threshold with dynamic hero container sequence detection; sync Navbar appearance immediately upon hero completion on both Homepage and Process page; enable solid backdrop on /process. | M1 | Survey (Explorer 1) & ORIGINAL_REQUEST §R1 | DONE |
| 4 | Next.js Image Engine & Cache Configuration | Update `next.config.ts` with AVIF/WebP formats, fine-tuned device/image sizes, 1-year `minimumCacheTTL`, and immutable caching headers for `/images/:path*` and `/favicon.png`. | M2 | Survey (Explorer 2) & ORIGINAL_REQUEST §R2 | DONE |
| 5 | Shared Metallic Shimmer Placeholder Utility | Create `lib/image-placeholder.ts` providing base64 shimmer blurDataURL and dark aesthetic blur placeholders to eliminate visual loading pops. | M2 | Survey (Explorer 2) & ORIGINAL_REQUEST §R2 | DONE |
| 6 | Fix Missing Thumbnail `sizes` Props | Add explicit responsive `sizes` to `<Image fill>` in cart (`64px, 80px`), checkout (`48px`), dashboard (`32px`, `48px`), and admin (`48px`) to prevent downloading 1920px+ images for small boxes. | M2 | Survey (Explorer 2) & ORIGINAL_REQUEST §R2 | DONE |
| 7 | Fix Missing `priority` on Above-the-Fold & LCP Assets | Add `priority` to mobile hero in `app/anime/page.tsx`, mobile campaign hero in `components/Hero.tsx`, first 4 products in `app/shop/ShopClient.tsx`, and anime drop reveal hero card. | M2 | Survey (Explorer 2) & ORIGINAL_REQUEST §R2 | DONE |
| 8 | Fix Carousel Stacking Network Congestion | Add `placeholder="blur"`, `loading="lazy"` on distant cards, and tailored `sizes` to prevent below-the-fold network contention in `AnimeTeaser.tsx` and `AnimeDropReveal.tsx`. | M2 | Survey (Explorer 2) & ORIGINAL_REQUEST §R2 | DONE |
| 9 | Native Swipeable/Draggable Homepage Collection Carousel | Add native touch gesture listeners (`onTouchStart`, `onTouchMove`, `onTouchEnd`) with 40px delta threshold, `touch-pan-y`, and `isSwiping` lock on card links in `components/LookCarousel.tsx`. Optimize card image loading & blur placeholders. | M3 | Survey (Explorer 3) & ORIGINAL_REQUEST §R3 | DONE |
| 10 | AI Try-On Mobile Responsive Hiding | Update `app/product/[slug]/ProductDetailClient.tsx` (and `components/TryOnPanel.tsx`) to `hidden md:block` (or `hidden md:flex`), cleanly hiding the UI on mobile viewports while preserving all React state hooks and event handlers intact. | M3 | Survey (Explorer 3) & ORIGINAL_REQUEST §R3 | DONE |
| 11 | Footer Packaging Flyer Centering & Infinite Shock Animation | Center flyer container on mobile breakpoints (`justify-center md:justify-end`). Add `onClick` handler and key with incrementing `shockKey` counter to allow infinite repeated shock animations on click/tap without locks. | M3 | Survey (Explorer 3) & ORIGINAL_REQUEST §R3 | DONE |
| 12 | Video Carousel Pagination Dots Repositioning | In `components/VideoCarousel.tsx`, vertically separate mobile navigation arrows and pagination dots: offset arrows to `bottom-12 sm:bottom-auto` and reposition dots down (`mt-10 sm:mt-6`) to definitively eliminate overlap. | M4 | Survey (Explorer 3) & ORIGINAL_REQUEST §R4 | DONE |
| 13 | Comprehensive Verification & Forensic Integrity Audit | Multi-viewport inspection, type check, build validation, adversarial stress-testing, and forensic integrity audit. | M5 | ORIGINAL_REQUEST Acceptance Criteria | IN_PROGRESS |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Video Performance & Initialization (R1) | `components/VideoHero.tsx`, `components/ProcessVideoScrubber.tsx`, `components/NavBar.tsx`, `app/layout.tsx` | none | DONE |
| M2 | Asset & Image Optimization (R2) | `next.config.ts`, `lib/image-placeholder.ts`, `app/cart/page.tsx`, `app/checkout/page.tsx`, `app/dashboard/page.tsx`, `app/admin/page.tsx`, `app/anime/page.tsx`, `components/Hero.tsx`, `app/shop/ShopClient.tsx`, `components/AnimeTeaser.tsx`, `components/AnimeDropReveal.tsx` | none | DONE |
| M3 | Mobile UX & UI Polish (R3) | `components/LookCarousel.tsx`, `app/product/[slug]/ProductDetailClient.tsx`, `components/TryOnPanel.tsx`, `components/Footer.tsx` | none | DONE |
| M4 | Carousel Layout Fix (R4) | `components/VideoCarousel.tsx` | none | DONE |
| M5 | Comprehensive Verification & Audit | E2E test verification, cross-viewport checks, Forensic Integrity Audit | M1, M2, M3, M4 | IN_PROGRESS |

## Interface Contracts
- **Hero Video & Navbar Contract**:
  - `VideoHero.tsx` container height: `h-[350vh] md:h-[500vh]`. Hero concludes when scroll position reaches `window.scrollY >= containerHeight - window.innerHeight` (mobile: ~2.5x innerHeight, desktop: ~4.0x innerHeight).
  - `ProcessVideoScrubber.tsx` container height: `400vh`. Hero concludes when `window.scrollY >= 3.0 * window.innerHeight`.
  - `NavBar.tsx` mounts / slides down (`translate-y-0 opacity-100`) immediately once hero animation reaches its conclusion, without any dead scroll zone.
- **Image Placeholder Contract**:
  - `lib/image-placeholder.ts` exports `DARK_BLUR_DATA_URL` and `shimmerBlurDataUrl(w, h)` returning base64 SVG data strings compatible with Next.js `<Image placeholder="blur" blurDataURL={...} />`.
- **Packaging Flyer Contract**:
  - `PackagingFlyer` receives clicks via `onClick={trigger}` and re-renders with fresh key to reliably replay `@keyframes shock` indefinitely.

## Code Layout
- Exclusive File Ownership:
  - **M1 Worker**:
    - `components/VideoHero.tsx`
    - `components/ProcessVideoScrubber.tsx`
    - `components/NavBar.tsx`
    - `app/layout.tsx`
  - **M2 Worker**:
    - `next.config.ts`
    - `lib/image-placeholder.ts`
    - `app/cart/page.tsx`
    - `app/checkout/page.tsx`
    - `app/dashboard/page.tsx`
    - `app/admin/page.tsx`
    - `app/anime/page.tsx`
    - `components/Hero.tsx`
    - `app/shop/ShopClient.tsx`
    - `components/AnimeTeaser.tsx`
    - `components/AnimeDropReveal.tsx`
  - **M3 Worker**:
    - `components/LookCarousel.tsx`
    - `app/product/[slug]/ProductDetailClient.tsx`
    - `components/TryOnPanel.tsx`
    - `components/Footer.tsx`
  - **M4 Worker**:
    - `components/VideoCarousel.tsx`
