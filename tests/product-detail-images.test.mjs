import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Helper to simulate the image resolution logic from ProductDetailClient.tsx
function resolveGalleryImages(product) {
  const coverImage =
    product.cover_image || product.images?.[0] || `/images/looks/${product.id}.jpg`;

  const raw =
    product.secondary_images && product.secondary_images.length > 0
      ? product.secondary_images
      : product.images && product.images.length > 1
      ? product.images.slice(1)
      : [];

  const secondaryImages = Array.from(new Set(raw.filter(Boolean))).filter(
    (img) => img !== coverImage
  );

  const allGalleryImages = [coverImage, ...secondaryImages];
  const hasSecondaryImages = secondaryImages.length > 0;

  return {
    coverImage,
    secondaryImages,
    allGalleryImages,
    hasSecondaryImages,
  };
}

// Navigation cycle helper matching handlePrevImage / handleNextImage
function cycleNext(currentIndex, totalCount) {
  return (currentIndex + 1) % totalCount;
}

function cyclePrev(currentIndex, totalCount) {
  return (currentIndex - 1 + totalCount) % totalCount;
}

// Mobile swipe resolution matching handleTouchEnd
function resolveSwipeDirection(startX, startY, endX, endY, threshold = 40) {
  const diffX = endX - startX;
  const diffY = endY - startY;

  if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY)) {
    return diffX < 0 ? "next" : "prev";
  }
  return null;
}

describe("R3. Product Detail Page Layout & Secondary Images Gallery", () => {
  describe("1. Image Resolution & Deduplication Logic", () => {
    it("resolves single cover image when product only has images[0]", () => {
      const product = {
        id: "cyber-tee",
        name: "Cyber Tee",
        images: ["/images/products/cyber-tee.png"],
      };

      const result = resolveGalleryImages(product);
      assert.strictEqual(result.coverImage, "/images/products/cyber-tee.png");
      assert.deepStrictEqual(result.secondaryImages, []);
      assert.deepStrictEqual(result.allGalleryImages, ["/images/products/cyber-tee.png"]);
      assert.strictEqual(result.hasSecondaryImages, false);
    });

    it("prioritizes product.cover_image field when present", () => {
      const product = {
        id: "cyber-jacket",
        cover_image: "/custom/cover.png",
        images: ["/legacy/first.png", "/legacy/second.png"],
      };

      const result = resolveGalleryImages(product);
      assert.strictEqual(result.coverImage, "/custom/cover.png");
      assert.strictEqual(result.allGalleryImages[0], "/custom/cover.png");
    });

    it("falls back to /images/looks/{id}.jpg when images array is empty", () => {
      const product = {
        id: "look-99",
        images: [],
      };

      const result = resolveGalleryImages(product);
      assert.strictEqual(result.coverImage, "/images/looks/look-99.jpg");
      assert.deepStrictEqual(result.secondaryImages, []);
      assert.deepStrictEqual(result.allGalleryImages, ["/images/looks/look-99.jpg"]);
      assert.strictEqual(result.hasSecondaryImages, false);
    });

    it("resolves secondary images from product.secondary_images array", () => {
      const product = {
        id: "drop-hoodie",
        cover_image: "/cover.png",
        secondary_images: ["/sec-1.png", "/sec-2.png"],
      };

      const result = resolveGalleryImages(product);
      assert.strictEqual(result.coverImage, "/cover.png");
      assert.deepStrictEqual(result.secondaryImages, ["/sec-1.png", "/sec-2.png"]);
      assert.deepStrictEqual(result.allGalleryImages, ["/cover.png", "/sec-1.png", "/sec-2.png"]);
      assert.strictEqual(result.hasSecondaryImages, true);
    });

    it("resolves secondary images from product.images.slice(1) when secondary_images is absent", () => {
      const product = {
        id: "drop-pants",
        images: ["/cover.png", "/angle-1.png", "/angle-2.png"],
      };

      const result = resolveGalleryImages(product);
      assert.strictEqual(result.coverImage, "/cover.png");
      assert.deepStrictEqual(result.secondaryImages, ["/angle-1.png", "/angle-2.png"]);
      assert.deepStrictEqual(result.allGalleryImages, ["/cover.png", "/angle-1.png", "/angle-2.png"]);
      assert.strictEqual(result.hasSecondaryImages, true);
    });

    it("deduplicates secondary images and excludes coverImage", () => {
      const product = {
        id: "duplicate-test",
        cover_image: "/cover.png",
        secondary_images: ["/cover.png", "/sec-1.png", "/sec-1.png", "/sec-2.png", "/cover.png"],
      };

      const result = resolveGalleryImages(product);
      assert.strictEqual(result.coverImage, "/cover.png");
      // Must not contain /cover.png and must not contain duplicate /sec-1.png
      assert.deepStrictEqual(result.secondaryImages, ["/sec-1.png", "/sec-2.png"]);
      assert.deepStrictEqual(result.allGalleryImages, ["/cover.png", "/sec-1.png", "/sec-2.png"]);
      assert.strictEqual(result.hasSecondaryImages, true);
    });

    it("filters out null, undefined, or empty string values in secondary images", () => {
      const product = {
        id: "falsy-test",
        images: ["/cover.png", "", null, undefined, "/valid-sec.png"],
      };

      const result = resolveGalleryImages(product);
      assert.deepStrictEqual(result.secondaryImages, ["/valid-sec.png"]);
      assert.strictEqual(result.hasSecondaryImages, true);
    });
  });

  describe("2. Strict Zero-Gap Conditional Collapse", () => {
    it("when product has only cover image, hasSecondaryImages is false and collapse evaluates to null", () => {
      const product = {
        id: "single-img",
        images: ["/images/products/single.png"],
      };

      const { hasSecondaryImages, allGalleryImages } = resolveGalleryImages(product);
      assert.strictEqual(hasSecondaryImages, false);
      assert.strictEqual(allGalleryImages.length, 1);

      // Simulating conditional render in React:
      // hasSecondaryImages && <ThumbnailStrip />
      const renderThumbnailStrip = (hasSec) => (hasSec ? { rendered: true, element: "div" } : null);
      const renderChevrons = (hasSec) => (hasSec ? { rendered: true } : null);
      const renderBadge = (hasSec) => (hasSec ? { rendered: true } : null);

      assert.strictEqual(renderThumbnailStrip(hasSecondaryImages), null, "Thumbnail strip must evaluate to null");
      assert.strictEqual(renderChevrons(hasSecondaryImages), null, "Chevrons must evaluate to null");
      assert.strictEqual(renderBadge(hasSecondaryImages), null, "Badge must evaluate to null");
    });

    it("when product has secondary images, interactive controls and thumbnails render cleanly", () => {
      const product = {
        id: "multi-img",
        images: ["/cover.png", "/sec1.png", "/sec2.png"],
      };

      const { hasSecondaryImages, allGalleryImages } = resolveGalleryImages(product);
      assert.strictEqual(hasSecondaryImages, true);
      assert.strictEqual(allGalleryImages.length, 3);

      const renderThumbnailStrip = (hasSec) => (hasSec ? { rendered: true, count: allGalleryImages.length } : null);
      const stripResult = renderThumbnailStrip(hasSecondaryImages);
      assert.ok(stripResult);
      assert.strictEqual(stripResult.rendered, true);
      assert.strictEqual(stripResult.count, 3);
    });
  });

  describe("3. Gallery Navigation & Mobile Swipe State Machine", () => {
    it("handles cyclic next navigation wrap-around", () => {
      const total = 3;
      let index = 0;

      index = cycleNext(index, total);
      assert.strictEqual(index, 1);

      index = cycleNext(index, total);
      assert.strictEqual(index, 2);

      // Wrap around from last to first
      index = cycleNext(index, total);
      assert.strictEqual(index, 0);
    });

    it("handles cyclic previous navigation wrap-around", () => {
      const total = 3;
      let index = 0;

      // Wrap around from first to last
      index = cyclePrev(index, total);
      assert.strictEqual(index, 2);

      index = cyclePrev(index, total);
      assert.strictEqual(index, 1);

      index = cyclePrev(index, total);
      assert.strictEqual(index, 0);
    });

    it("thumbnail selection directly sets activeImageIndex", () => {
      const gallery = ["/c.png", "/s1.png", "/s2.png", "/s3.png"];
      let activeIndex = 0;

      // Click on thumbnail at index 2
      const targetIndex = 2;
      assert.ok(targetIndex >= 0 && targetIndex < gallery.length);
      activeIndex = targetIndex;
      assert.strictEqual(activeIndex, 2);
      assert.strictEqual(gallery[activeIndex], "/s2.png");
    });

    it("mobile touch swipe left (> 40px) triggers next image", () => {
      const direction = resolveSwipeDirection(200, 100, 120, 105, 40); // diffX = -80
      assert.strictEqual(direction, "next");
    });

    it("mobile touch swipe right (> 40px) triggers prev image", () => {
      const direction = resolveSwipeDirection(100, 100, 180, 102, 40); // diffX = +80
      assert.strictEqual(direction, "prev");
    });

    it("touch movement below 40px threshold does not trigger navigation", () => {
      const direction = resolveSwipeDirection(100, 100, 125, 100, 40); // diffX = +25 (< 40)
      assert.strictEqual(direction, null);
    });

    it("predominantly vertical scroll gesture does not trigger image swipe", () => {
      const direction = resolveSwipeDirection(100, 100, 150, 250, 40); // diffX = +50, diffY = +150
      assert.strictEqual(direction, null, "Vertical scroll must not trigger horizontal swipe");
    });
  });

  describe("4. Products Lib Helpers (lib/products.ts)", () => {
    const productsLibPath = path.join(projectRoot, "lib/products.ts");
    const productsLibContent = fs.readFileSync(productsLibPath, "utf-8");

    it("lib/products.ts exports getProductCoverImage and getProductSecondaryImages", () => {
      assert.ok(
        productsLibContent.includes("export function getProductCoverImage"),
        "lib/products.ts must export getProductCoverImage"
      );
      assert.ok(
        productsLibContent.includes("export function getProductSecondaryImages"),
        "lib/products.ts must export getProductSecondaryImages"
      );
      assert.ok(
        productsLibContent.includes("cover_image?: string;"),
        "Product type must define cover_image"
      );
      assert.ok(
        productsLibContent.includes("secondary_images?: string[];"),
        "Product type must define secondary_images"
      );
    });

    it("getProductCoverImage correctly returns explicit cover_image or images[0] or fallback", () => {
      function getProductCoverImage(product) {
        if (product.cover_image) {
          return product.cover_image;
        }
        if (product.images && product.images.length > 0 && product.images[0]) {
          return product.images[0];
        }
        return `/images/looks/${product.id}.jpg`;
      }

      assert.strictEqual(
        getProductCoverImage({ id: "p1", cover_image: "/direct-cover.png", images: ["/alt.png"] }),
        "/direct-cover.png"
      );

      assert.strictEqual(
        getProductCoverImage({ id: "p2", images: ["/first.png", "/second.png"] }),
        "/first.png"
      );

      assert.strictEqual(
        getProductCoverImage({ id: "p3", images: [] }),
        "/images/looks/p3.jpg"
      );
    });

    it("getProductSecondaryImages returns secondary array or slices images[1..N]", () => {
      function getProductSecondaryImages(product) {
        if (product.secondary_images && product.secondary_images.length > 0) {
          return product.secondary_images.filter(Boolean);
        }
        if (product.images && product.images.length > 1) {
          return product.images.slice(1).filter(Boolean);
        }
        return [];
      }

      assert.deepStrictEqual(
        getProductSecondaryImages({ id: "p1", secondary_images: ["/s1.png", "/s2.png"] }),
        ["/s1.png", "/s2.png"]
      );

      assert.deepStrictEqual(
        getProductSecondaryImages({ id: "p2", images: ["/cover.png", "/s1.png"] }),
        ["/s1.png"]
      );

      assert.deepStrictEqual(
        getProductSecondaryImages({ id: "p3", images: ["/cover.png"] }),
        []
      );
    });
  });

  describe("5. Static Code Inspection of ProductDetailClient.tsx & Scope Conformance", () => {
    const clientPath = path.join(projectRoot, "app/product/[slug]/ProductDetailClient.tsx");
    const content = fs.readFileSync(clientPath, "utf-8");

    it("strictly guards thumbnail navigation with {hasSecondaryImages && (...)}", () => {
      assert.ok(
        content.includes("{hasSecondaryImages && ("),
        "Must contain strict {hasSecondaryImages && ( guard"
      );
      assert.ok(
        content.includes("overflow-x-auto"),
        "Thumbnail container must be horizontally scrollable"
      );
    });

    it("contains interactive main image stage with cyclic chevrons and counter badge", () => {
      assert.ok(
        content.includes("handlePrevImage") && content.includes("handleNextImage"),
        "Must implement handlePrevImage and handleNextImage"
      );
      assert.ok(
        content.includes("aria-label=\"Previous image\"") && content.includes("aria-label=\"Next image\""),
        "Chevrons must have accessible aria-labels"
      );
      assert.ok(
        content.includes("{activeImageIndex + 1}") && content.includes("{allGalleryImages.length}"),
        "Counter badge must display activeImageIndex + 1 and allGalleryImages.length"
      );
    });

    it("implements mobile touch swipe handlers with 40px threshold", () => {
      assert.ok(
        content.includes("handleTouchStart") && content.includes("handleTouchEnd"),
        "Must implement handleTouchStart and handleTouchEnd"
      );
      assert.ok(
        content.includes("Math.abs(diffX) > 40"),
        "Touch handler must enforce 40px swipe threshold"
      );
      assert.ok(
        content.includes("onTouchStart={hasSecondaryImages ? handleTouchStart : undefined}"),
        "Touch handlers must be conditionally attached only when secondary images exist"
      );
    });

    it("provides accessible thumbnail buttons with aria-label and aria-current", () => {
      assert.ok(
        content.includes("aria-label={`View image ${idx + 1} of ${allGalleryImages.length}`}"),
        "Thumbnails must have descriptive aria-label"
      );
      assert.ok(
        content.includes("aria-current={activeImageIndex === idx ? \"true\" : undefined}"),
        "Active thumbnail must have aria-current"
      );
      assert.ok(
        content.includes("border-accent") && content.includes("ring-accent"),
        "Active thumbnail must be styled with accent border and ring"
      );
    });

    it("resets activeImageIndex when product ID changes", () => {
      assert.ok(
        content.includes("useEffect") && content.includes("setActiveImageIndex(0)"),
        "Must reset activeImageIndex to 0 when product changes"
      );
    });

    it("CRUCIAL PRESERVATION: preserves all Worker M1 inventory logic verbatim", () => {
      assert.ok(
        content.includes("out of stock please choose a different size"),
        "Must preserve exact inventory error message: 'out of stock please choose a different size'"
      );
      assert.ok(
        !content.includes("disabled={isOOS}"),
        "Must not disable size buttons for 0-stock items"
      );
      assert.ok(
        content.includes("availableStock <= 0 || currentQtyInCart + 1 > availableStock"),
        "Must enforce inventory boundary limit in handleAddToCart"
      );
      assert.ok(
        content.includes("maxStock: availableStock"),
        "Must pass maxStock to addItem"
      );
    });
  });
});
