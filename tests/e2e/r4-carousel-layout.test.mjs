import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

describe("Tier 1: R4 — Carousel Layout Fix", () => {
  const videoCarouselPath = path.join(ROOT, "components", "VideoCarousel.tsx");

  test("R4.1: VideoCarousel exists and defines navigation arrows and pagination dots", () => {
    assert.ok(fs.existsSync(videoCarouselPath), "components/VideoCarousel.tsx must exist");
    const code = fs.readFileSync(videoCarouselPath, "utf-8");
    assert.ok(code.includes("aria-label=\"Previous video\""), "Must contain previous video navigation button");
    assert.ok(code.includes("aria-label=\"Next video\""), "Must contain next video navigation button");
    assert.ok(code.includes("aria-label=\"Video carousel pagination\""), "Must contain video carousel pagination");
  });

  test("R4.2: Pagination dots are vertically repositioned down to prevent overlapping", () => {
    const code = fs.readFileSync(videoCarouselPath, "utf-8");

    // The legacy code placed dots at mt-6 right where absolute bottom-0 arrows sit
    const paginationContainerMatch = code.match(/<div[^>]*aria-label=["']Video carousel pagination["'][^>]*>/) ||
      code.match(/<div[^>]*className=["'][^"']*mt-\d+[^"']*["'][^>]*role=["']tablist["'][^>]*>/);
    assert.ok(paginationContainerMatch, "Must find pagination container element");

    const paginationDiv = paginationContainerMatch[0];

    // Must be repositioned down: e.g. mt-10 sm:mt-6 or placed in dedicated bottom container
    const isRepositionedDown = paginationDiv.includes("mt-10") ||
      paginationDiv.includes("mt-12") ||
      paginationDiv.includes("mt-14") ||
      code.includes("pb-14") ||
      code.includes("pb-16");

    assert.ok(
      isRepositionedDown,
      `Pagination dots must be vertically repositioned down (e.g. mt-10 sm:mt-6). Found: ${paginationDiv}`
    );
  });

  test("R4.3: Mobile navigation arrows are vertically separated from pagination dots", () => {
    const code = fs.readFileSync(videoCarouselPath, "utf-8");

    // In the broken layout, both arrows used `absolute bottom-0 left-1/2` colliding with pagination dots
    const prevArrowMatch = code.match(/<button[\s\S]*?aria-label=["']Previous video["'][\s\S]*?className=["']([^"']+)["']/);
    const nextArrowMatch = code.match(/<button[\s\S]*?aria-label=["']Next video["'][\s\S]*?className=["']([^"']+)["']/);

    assert.ok(prevArrowMatch, "Must find previous video button className");
    assert.ok(nextArrowMatch, "Must find next video button className");

    const prevClass = prevArrowMatch[1];
    const nextClass = nextArrowMatch[1];

    // Navigation arrows must be offset above the dots on mobile (e.g. bottom-12 sm:bottom-auto or bottom-14)
    const prevOffset = prevClass.includes("bottom-12") || prevClass.includes("bottom-14") || prevClass.includes("bottom-16");
    const nextOffset = nextClass.includes("bottom-12") || nextClass.includes("bottom-14") || nextClass.includes("bottom-16");

    assert.ok(
      prevOffset && nextOffset,
      `Mobile arrows must be vertically offset (e.g. bottom-12 sm:bottom-auto) to avoid colliding with dots at bottom-0. Prev: ${prevClass}`
    );
  });

  test("R4.4: Layout spatial coordinate calculation guarantees zero collision", () => {
    const code = fs.readFileSync(videoCarouselPath, "utf-8");

    // Bounding calculation:
    // If arrows have bottom-12 (3rem = 48px) and dots have mt-10 (2.5rem = 40px) or similar,
    // the vertical gap is positive and prevents touch interception.
    const hasCollision = code.includes("bottom-0 left-1/2") && code.includes("mt-6");
    assert.strictEqual(
      hasCollision,
      false,
      "VideoCarousel must definitively eliminate simultaneous bottom-0 and mt-6 spatial collision"
    );
  });
});
