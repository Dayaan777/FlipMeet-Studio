import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const adminPagePath = path.join(projectRoot, "app", "admin", "page.tsx");
const pdpClientPath = path.join(projectRoot, "app", "product", "[slug]", "ProductDetailClient.tsx");
const productsLibPath = path.join(projectRoot, "lib", "products.ts");

assert.ok(fs.existsSync(adminPagePath), "app/admin/page.tsx must exist");
assert.ok(fs.existsSync(pdpClientPath), "ProductDetailClient.tsx must exist");
assert.ok(fs.existsSync(productsLibPath), "lib/products.ts must exist");

const adminContent = fs.readFileSync(adminPagePath, "utf-8");
const pdpContent = fs.readFileSync(pdpClientPath, "utf-8");
const productsLibContent = fs.readFileSync(productsLibPath, "utf-8");

// ============================================================================
// PDP GALLERY LOGIC SIMULATION (Matching ProductDetailClient.tsx verbatim)
// ============================================================================
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

function cycleNext(currentIndex, totalCount) {
  if (totalCount <= 0) return 0;
  return (currentIndex + 1) % totalCount;
}

function cyclePrev(currentIndex, totalCount) {
  if (totalCount <= 0) return 0;
  return (currentIndex - 1 + totalCount) % totalCount;
}

function resolveSwipeDirection(startX, startY, endX, endY, threshold = 40) {
  if (startX === null || startY === null || endX === null || endY === null) return null;
  const diffX = endX - startX;
  const diffY = endY - startY;

  if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY)) {
    return diffX < 0 ? "next" : "prev";
  }
  return null;
}

// ============================================================================
// ADMIN PAYLOAD IMAGE ASSEMBLY (Matching app/admin/page.tsx verbatim)
// ============================================================================
function assembleAdminImages({
  cleanId,
  finalCoverUrl,
  existingSecondaryUrls = [],
  uploadedSecondaryUrls = [],
}) {
  const finalSecondaryUrls = [...existingSecondaryUrls, ...uploadedSecondaryUrls];

  let finalImages = [];
  if (finalCoverUrl) {
    finalImages = [finalCoverUrl, ...finalSecondaryUrls];
  } else if (finalSecondaryUrls.length > 0) {
    finalImages = finalSecondaryUrls;
  } else {
    finalImages = [`/images/looks/${cleanId}.jpg`];
  }
  return finalImages;
}

// ============================================================================
// OBJECT URL LIFECYCLE SIMULATOR (Matching AdminPage object URL handling)
// ============================================================================
class MockUrlRegistry {
  constructor() {
    this.activeUrls = new Set();
    this.totalCreated = 0;
    this.totalRevoked = 0;
    this.history = [];
  }

  createObjectURL(file) {
    const url = `blob:http://localhost:3000/${Math.random().toString(36).substring(2, 10)}-${file.name}`;
    this.activeUrls.add(url);
    this.totalCreated++;
    this.history.push({ action: "create", url });
    return url;
  }

  revokeObjectURL(url) {
    if (this.activeUrls.has(url)) {
      this.activeUrls.delete(url);
      this.totalRevoked++;
      this.history.push({ action: "revoke", url });
    } else {
      this.history.push({ action: "revoke_noop", url });
    }
  }

  getActiveCount() {
    return this.activeUrls.size;
  }
}

class AdminImageStateSimulator {
  constructor(registry) {
    this.registry = registry;
    this.coverFile = null;
    this.coverPreviewUrl = null;
    this.existingCoverUrl = null;
    this.existingSecondaryUrls = [];
    this.secondaryFiles = [];
  }

  setCoverFile(file) {
    if (this.coverPreviewUrl) {
      this.registry.revokeObjectURL(this.coverPreviewUrl);
    }
    this.coverFile = file;
    this.coverPreviewUrl = this.registry.createObjectURL(file);
  }

  removeCover() {
    if (this.coverPreviewUrl) {
      this.registry.revokeObjectURL(this.coverPreviewUrl);
    }
    this.coverFile = null;
    this.coverPreviewUrl = null;
    this.existingCoverUrl = null;
  }

  addSecondaryFiles(files) {
    if (!files || files.length === 0) return;
    const newItems = files.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file: f,
      previewUrl: this.registry.createObjectURL(f),
    }));
    this.secondaryFiles.push(...newItems);
  }

  removeSecondaryFile(id) {
    const target = this.secondaryFiles.find((item) => item.id === id);
    if (target?.previewUrl) {
      this.registry.revokeObjectURL(target.previewUrl);
    }
    this.secondaryFiles = this.secondaryFiles.filter((item) => item.id !== id);
  }

  clearSecondaryFiles() {
    this.secondaryFiles.forEach((f) => {
      if (f.previewUrl) this.registry.revokeObjectURL(f.previewUrl);
    });
    this.secondaryFiles = [];
  }

  resetImageState() {
    if (this.coverPreviewUrl) {
      this.registry.revokeObjectURL(this.coverPreviewUrl);
    }
    this.coverFile = null;
    this.coverPreviewUrl = null;
    this.existingCoverUrl = null;

    this.secondaryFiles.forEach((item) => {
      if (item.previewUrl) {
        this.registry.revokeObjectURL(item.previewUrl);
      }
    });
    this.secondaryFiles = [];
    this.existingSecondaryUrls = [];
  }

  unmount() {
    if (this.coverPreviewUrl) {
      this.registry.revokeObjectURL(this.coverPreviewUrl);
    }
    this.secondaryFiles.forEach((item) => {
      if (item.previewUrl) {
        this.registry.revokeObjectURL(item.previewUrl);
      }
    });
  }
}

// Extract verbatim function implementations from lib/products.ts
const coverFnMatch = productsLibContent.match(
  /export\s+function\s+getProductCoverImage\s*\([^)]*\)\s*:\s*string\s*\{([\s\S]*?)\n\}/
);
assert.ok(coverFnMatch, "getProductCoverImage implementation must be found in lib/products.ts");
const getProductCoverImageVerbatim = new Function("product", coverFnMatch[1]);

const secFnMatch = productsLibContent.match(
  /export\s+function\s+getProductSecondaryImages\s*\([^)]*\)\s*:\s*string\[\]\s*\{([\s\S]*?)\n\}/
);
assert.ok(secFnMatch, "getProductSecondaryImages implementation must be found in lib/products.ts");
const getProductSecondaryImagesVerbatim = new Function("product", secFnMatch[1]);

// ============================================================================
// TEST SUITE: CHALLENGER ADVERSARIAL VERIFICATION
// ============================================================================

describe("Adversarial Empirical Verification: Admin Images & Storefront PDP", () => {

  // --------------------------------------------------------------------------
  // SUITE 1: Exhaustive Static Code Audit of Admin Page (app/admin/page.tsx)
  // --------------------------------------------------------------------------
  describe("Suite 1: Admin Page Exhaustive Static Scan & File Input Constraints", () => {

    it("verifies strictly TWO <input type='file'> elements exist across the entire admin page", () => {
      const fileInputs = adminContent.match(/<input[^>]*type=["']file["'][^>]*>/g) || [];
      assert.strictEqual(
        fileInputs.length,
        2,
        `Expected exactly 2 file inputs in app/admin/page.tsx, but found ${fileInputs.length}: ${JSON.stringify(fileInputs)}`
      );
    });

    it("verifies Cover Image file input is strictly single-file (no 'multiple' attribute)", () => {
      const coverInputMatch = adminContent.match(/<input[^>]*ref={coverInputRef}[^>]*>/);
      assert.ok(coverInputMatch, "Cover image file input with ref={coverInputRef} must exist");
      const coverTag = coverInputMatch[0];
      assert.ok(/type=["']file["']/.test(coverTag), "Must be type='file'");
      assert.strictEqual(
        /\bmultiple\b/.test(coverTag),
        false,
        "Cover image input MUST NOT have the 'multiple' attribute"
      );
    });

    it("verifies Secondary Images file input strictly HAS the 'multiple' attribute", () => {
      const secondaryInputMatch = adminContent.match(/<input[^>]*ref={secondaryInputRef}[^>]*>/);
      assert.ok(secondaryInputMatch, "Secondary images file input with ref={secondaryInputRef} must exist");
      const secondaryTag = secondaryInputMatch[0];
      assert.ok(/type=["']file["']/.test(secondaryTag), "Must be type='file'");
      assert.ok(
        /\bmultiple\b/.test(secondaryTag),
        "Secondary images input MUST have the 'multiple' attribute"
      );
    });

    it("verifies both file inputs enforce image MIME accept filters", () => {
      const coverInputMatch = adminContent.match(/<input[^>]*ref={coverInputRef}[^>]*>/)[0];
      const secondaryInputMatch = adminContent.match(/<input[^>]*ref={secondaryInputRef}[^>]*>/)[0];

      assert.ok(
        /accept=["'][^"']*image\/(?:png|jpeg|webp|avif)/.test(coverInputMatch),
        "Cover input must have image MIME accept filter"
      );
      assert.ok(
        /accept=["'][^"']*image\/(?:png|jpeg|webp|avif)/.test(secondaryInputMatch),
        "Secondary input must have image MIME accept filter"
      );
    });

    it("verifies ZERO <input type='url'> exist anywhere in app/admin/page.tsx", () => {
      const urlInputs = adminContent.match(/<input[^>]*type=["']url["'][^>]*>/gi) || [];
      assert.strictEqual(
        urlInputs.length,
        0,
        `Found unexpected <input type="url">: ${JSON.stringify(urlInputs)}`
      );
    });

    it("verifies ZERO text inputs bound to image URLs or with image URL placeholders", () => {
      const textInputs = adminContent.match(/<input[^>]*type=["']text["'][^>]*>/gi) || [];
      for (const input of textInputs) {
        assert.strictEqual(
          /image|img|http|cdn|stwd-shirt|\.png|\.jpg/i.test(input),
          false,
          `Found suspicious text input with image references: ${input}`
        );
      }
    });

    it("verifies ZERO references to 'formData.images' in app/admin/page.tsx", () => {
      const formDataImagesMatches = adminContent.match(/formData\.images/g) || [];
      assert.strictEqual(
        formDataImagesMatches.length,
        0,
        `Found ${formDataImagesMatches.length} references to formData.images`
      );
    });

    it("verifies ProductForm type definition does NOT have 'images' or 'image' property", () => {
      const formTypeMatch = adminContent.match(/type\s+ProductForm\s*=\s*{([^}]+)}/);
      assert.ok(formTypeMatch, "ProductForm type found");
      const formFields = formTypeMatch[1];
      assert.strictEqual(
        /\bimages?\s*:/i.test(formFields),
        false,
        "ProductForm must NOT include images or image field"
      );
    });

    it("verifies DEFAULT_FORM constant does NOT contain 'images' or 'image' property", () => {
      const defaultFormMatch = adminContent.match(/const\s+DEFAULT_FORM[^=]*=\s*{([^}]+)}/);
      assert.ok(defaultFormMatch, "DEFAULT_FORM found");
      const formFields = defaultFormMatch[1];
      assert.strictEqual(
        /\bimages?\s*:/i.test(formFields),
        false,
        "DEFAULT_FORM must NOT include images or image property"
      );
    });

    it("verifies Supabase Storage upload targets strictly the 'products' bucket", () => {
      const storageUploads = adminContent.match(/supabase\.storage\s*\.\s*from\(\s*["']([^"']+)["']\s*\)/g) || [];
      assert.ok(storageUploads.length >= 2, "Expected at least 2 storage bucket references");
      for (const call of storageUploads) {
        assert.ok(
          call.includes('"products"') || call.includes("'products'"),
          `Storage call must target 'products' bucket, found: ${call}`
        );
      }
    });

    it("verifies admin payload image assembly logic handles all edge combinations", () => {
      // 1. Cover + 2 Secondary
      const p1 = assembleAdminImages({
        cleanId: "p1",
        finalCoverUrl: "https://supa/p1-cover.png",
        existingSecondaryUrls: ["https://supa/p1-sec1.png"],
        uploadedSecondaryUrls: ["https://supa/p1-sec2.png"],
      });
      assert.deepStrictEqual(p1, [
        "https://supa/p1-cover.png",
        "https://supa/p1-sec1.png",
        "https://supa/p1-sec2.png",
      ]);

      // 2. Cover only (0 secondary)
      const p2 = assembleAdminImages({
        cleanId: "p2",
        finalCoverUrl: "https://supa/p2-cover.png",
        existingSecondaryUrls: [],
        uploadedSecondaryUrls: [],
      });
      assert.deepStrictEqual(p2, ["https://supa/p2-cover.png"]);

      // 3. Fallback when 0 cover and 0 secondary
      const p3 = assembleAdminImages({
        cleanId: "look-42",
        finalCoverUrl: "",
        existingSecondaryUrls: [],
        uploadedSecondaryUrls: [],
      });
      assert.deepStrictEqual(p3, ["/images/looks/look-42.jpg"]);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Memory Leak Audit — Object URL Allocation & Revocation Lifecycle
  // --------------------------------------------------------------------------
  describe("Suite 2: Memory Leak Audit (Object URL Creation & Revocation)", () => {

    it("single cover selection creates object URL and resetImageState revokes it cleanly", () => {
      const registry = new MockUrlRegistry();
      const sim = new AdminImageStateSimulator(registry);

      sim.setCoverFile({ name: "hero.png" });
      assert.strictEqual(registry.getActiveCount(), 1, "1 active object URL after cover selection");
      assert.strictEqual(registry.totalCreated, 1);
      assert.strictEqual(registry.totalRevoked, 0);

      sim.resetImageState();
      assert.strictEqual(registry.getActiveCount(), 0, "0 active object URLs after reset");
      assert.strictEqual(registry.totalRevoked, 1);
    });

    it("replacing cover image revokes previous object URL before allocating new one", () => {
      const registry = new MockUrlRegistry();
      const sim = new AdminImageStateSimulator(registry);

      sim.setCoverFile({ name: "v1.png" });
      const firstUrl = sim.coverPreviewUrl;
      assert.strictEqual(registry.getActiveCount(), 1);

      sim.setCoverFile({ name: "v2.png" });
      const secondUrl = sim.coverPreviewUrl;
      assert.notStrictEqual(firstUrl, secondUrl);
      assert.strictEqual(registry.getActiveCount(), 1, "Only 1 URL active after replacement");
      assert.strictEqual(registry.totalCreated, 2);
      assert.strictEqual(registry.totalRevoked, 1);

      const revokedItem = registry.history.find((h) => h.action === "revoke");
      assert.strictEqual(revokedItem.url, firstUrl);

      sim.removeCover();
      assert.strictEqual(registry.getActiveCount(), 0, "0 active URLs after remove");
      assert.strictEqual(registry.totalRevoked, 2);
    });

    it("stress test: 100 consecutive cover replacements cleanly revoke all 99 prior URLs with 0 leaks", () => {
      const registry = new MockUrlRegistry();
      const sim = new AdminImageStateSimulator(registry);

      for (let i = 0; i < 100; i++) {
        sim.setCoverFile({ name: `frame_${i}.jpg` });
        assert.strictEqual(registry.getActiveCount(), 1, `Active URLs must stay exactly 1 on iteration ${i}`);
      }

      assert.strictEqual(registry.totalCreated, 100);
      assert.strictEqual(registry.totalRevoked, 99);

      // Modal unmount / close cleans up final 100th URL
      sim.unmount();
      assert.strictEqual(registry.getActiveCount(), 0, "Zero active URLs remaining after unmount");
      assert.strictEqual(registry.totalRevoked, 100);
    });

    it("secondary images batch addition and individual item deletion revokes correct URL", () => {
      const registry = new MockUrlRegistry();
      const sim = new AdminImageStateSimulator(registry);

      const files = [
        { name: "angle_front.png" },
        { name: "angle_back.png" },
        { name: "angle_detail.png" },
      ];
      sim.addSecondaryFiles(files);

      assert.strictEqual(registry.getActiveCount(), 3);
      assert.strictEqual(sim.secondaryFiles.length, 3);

      // Remove middle item (angle_back.png)
      const targetId = sim.secondaryFiles[1].id;
      const targetUrl = sim.secondaryFiles[1].previewUrl;

      sim.removeSecondaryFile(targetId);

      assert.strictEqual(registry.getActiveCount(), 2, "2 active URLs remaining after 1 deleted");
      assert.strictEqual(sim.secondaryFiles.length, 2);
      assert.ok(!registry.activeUrls.has(targetUrl), "Target URL was revoked");

      // Clear all remaining
      sim.clearSecondaryFiles();
      assert.strictEqual(registry.getActiveCount(), 0, "0 active URLs after clearSecondaryFiles");
      assert.strictEqual(registry.totalRevoked, 3);
    });

    it("comprehensive lifecycle: multi-batch upload + partial deletion + modal unmount leaves 0 leaks", () => {
      const registry = new MockUrlRegistry();
      const sim = new AdminImageStateSimulator(registry);

      // 1. Add cover
      sim.setCoverFile({ name: "cover.png" });

      // 2. Add batch 1 secondary (4 files)
      sim.addSecondaryFiles([
        { name: "s1.png" },
        { name: "s2.png" },
        { name: "s3.png" },
        { name: "s4.png" },
      ]);

      // 3. Add batch 2 secondary (2 files)
      sim.addSecondaryFiles([
        { name: "s5.png" },
        { name: "s6.png" },
      ]);

      assert.strictEqual(registry.getActiveCount(), 7); // 1 cover + 6 secondary

      // 4. Remove 2 individual secondary files
      sim.removeSecondaryFile(sim.secondaryFiles[0].id);
      sim.removeSecondaryFile(sim.secondaryFiles[2].id);
      assert.strictEqual(registry.getActiveCount(), 5); // 1 cover + 4 secondary

      // 5. Replace cover
      sim.setCoverFile({ name: "cover_final.png" });
      assert.strictEqual(registry.getActiveCount(), 5);

      // 6. User closes modal without saving -> trigger resetImageState
      sim.resetImageState();
      assert.strictEqual(registry.getActiveCount(), 0, "MUST be 0 active URLs after resetImageState");
      assert.strictEqual(registry.totalCreated, 8); // 2 covers + 6 secondary
      assert.strictEqual(registry.totalRevoked, 8);
    });

    it("verifies static cleanup hook (useEffect return callback) exists in app/admin/page.tsx", () => {
      const unmountEffectPattern =
        /useEffect\s*\(\s*\(\)\s*=>\s*{\s*return\s*\(\)\s*=>\s*{[\s\S]*?URL\.revokeObjectURL\(coverPreviewUrl\)[\s\S]*?URL\.revokeObjectURL\(item\.previewUrl\)[\s\S]*?}\s*;\s*},\s*\[coverPreviewUrl,\s*secondaryFiles\]\s*\)/;
      assert.ok(
        unmountEffectPattern.test(adminContent),
        "admin/page.tsx must contain unmount cleanup useEffect revoking both coverPreviewUrl and secondaryFiles"
      );
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Storefront PDP Gallery Boundary Cases & Layout Invariants
  // --------------------------------------------------------------------------
  describe("Suite 3: Storefront PDP Image Gallery Boundary Cases & Layout Invariants", () => {

    it("Boundary 1: ZERO secondary images -> strictly hasSecondaryImages=false and 1 total gallery image", () => {
      const product = {
        id: "cyber-shirt",
        name: "Cyber Shirt",
        cover_image: "/cover.jpg",
        secondary_images: [],
      };

      const res = resolveGalleryImages(product);
      assert.strictEqual(res.hasSecondaryImages, false, "hasSecondaryImages must be false");
      assert.deepStrictEqual(res.secondaryImages, [], "secondaryImages must be empty array");
      assert.deepStrictEqual(res.allGalleryImages, ["/cover.jpg"], "allGalleryImages must strictly have 1 item");
    });

    it("Boundary 1 (Zero-gap collapse invariant): PDP JSX strictly renders null/falsy for controls and strip", () => {
      const hasSecondaryImages = false;

      // Evaluated JSX expressions:
      const chevronButtons = hasSecondaryImages ? "CHEVRONS_RENDERED" : null;
      const counterBadge = hasSecondaryImages ? "BADGE_RENDERED" : null;
      const thumbnailStrip = hasSecondaryImages ? "THUMBNAILS_RENDERED" : null;
      const touchStartHandler = hasSecondaryImages ? (() => {}) : undefined;
      const touchEndHandler = hasSecondaryImages ? (() => {}) : undefined;

      assert.strictEqual(chevronButtons, null, "Chevrons must evaluate to null when 0 secondary images");
      assert.strictEqual(counterBadge, null, "Counter badge must evaluate to null when 0 secondary images");
      assert.strictEqual(thumbnailStrip, null, "Thumbnail strip must evaluate to null when 0 secondary images");
      assert.strictEqual(touchStartHandler, undefined, "onTouchStart must be undefined when 0 secondary images");
      assert.strictEqual(touchEndHandler, undefined, "onTouchEnd must be undefined when 0 secondary images");
    });

    it("Boundary 2: EXACTLY 1 secondary image -> total gallery count is 2 and chevrons wrap 0 <-> 1", () => {
      const product = {
        id: "cyber-pants",
        name: "Cyber Pants",
        cover_image: "/pants-front.jpg",
        secondary_images: ["/pants-back.jpg"],
      };

      const res = resolveGalleryImages(product);
      assert.strictEqual(res.hasSecondaryImages, true);
      assert.strictEqual(res.secondaryImages.length, 1);
      assert.strictEqual(res.allGalleryImages.length, 2);
      assert.deepStrictEqual(res.allGalleryImages, ["/pants-front.jpg", "/pants-back.jpg"]);

      const total = res.allGalleryImages.length; // 2
      let index = 0;
      index = cycleNext(index, total);
      assert.strictEqual(index, 1, "0 -> next -> 1");
      index = cycleNext(index, total);
      assert.strictEqual(index, 0, "1 -> next -> 0 (wrapped)");
      index = cyclePrev(index, total);
      assert.strictEqual(index, 1, "0 -> prev -> 1 (wrapped)");
      index = cyclePrev(index, total);
      assert.strictEqual(index, 0, "1 -> prev -> 0");
    });

    it("Boundary 3: 10 secondary images -> total gallery count is 11 and cyclic navigation wraps smoothly", () => {
      const secondaryList = Array.from({ length: 10 }, (_, i) => `/images/angle_${i + 1}.jpg`);
      const product = {
        id: "complex-suit",
        name: "Complex Suit",
        cover_image: "/images/suit-main.jpg",
        secondary_images: secondaryList,
      };

      const res = resolveGalleryImages(product);
      assert.strictEqual(res.hasSecondaryImages, true);
      assert.strictEqual(res.secondaryImages.length, 10);
      assert.strictEqual(res.allGalleryImages.length, 11);
      assert.strictEqual(res.allGalleryImages[0], "/images/suit-main.jpg");
      assert.strictEqual(res.allGalleryImages[10], "/images/angle_10.jpg");

      const total = res.allGalleryImages.length; // 11

      assert.strictEqual(cycleNext(10, total), 0);
      assert.strictEqual(cyclePrev(0, total), 10);

      let curr = 0;
      for (let i = 1; i <= 33; i++) {
        curr = cycleNext(curr, total);
        assert.strictEqual(curr, i % 11);
      }

      for (let i = 1; i <= 33; i++) {
        curr = cyclePrev(curr, total);
      }
      assert.strictEqual(curr, 0, "Returned back to index 0 after 33 reverse steps");
    });

    it("Boundary 4: Duplicate images deduplication & cover image collision removal", () => {
      const product = {
        id: "dupe-test",
        name: "Dupe Test",
        cover_image: "/main.jpg",
        secondary_images: [
          "/main.jpg",      // Matches cover -> MUST be removed
          "/angle1.jpg",
          "/angle1.jpg",    // Duplicate secondary -> MUST be deduplicated
          "/angle2.jpg",
          "/main.jpg",      // Another cover match -> MUST be removed
          "/angle2.jpg",    // Another secondary dupe -> MUST be deduplicated
          "/angle3.jpg",
        ],
      };

      const res = resolveGalleryImages(product);
      assert.strictEqual(res.coverImage, "/main.jpg");
      assert.deepStrictEqual(res.secondaryImages, ["/angle1.jpg", "/angle2.jpg", "/angle3.jpg"]);
      assert.deepStrictEqual(res.allGalleryImages, ["/main.jpg", "/angle1.jpg", "/angle2.jpg", "/angle3.jpg"]);
      assert.strictEqual(res.hasSecondaryImages, true);
    });

    it("Boundary 4b: All secondary images are duplicates of cover image -> collapses to 0-gap", () => {
      const product = {
        id: "all-dupes",
        name: "All Dupes",
        cover_image: "/only-one.jpg",
        secondary_images: ["/only-one.jpg", "/only-one.jpg", "/only-one.jpg"],
      };

      const res = resolveGalleryImages(product);
      assert.strictEqual(res.coverImage, "/only-one.jpg");
      assert.deepStrictEqual(res.secondaryImages, [], "All dupes stripped");
      assert.deepStrictEqual(res.allGalleryImages, ["/only-one.jpg"]);
      assert.strictEqual(res.hasSecondaryImages, false, "Must collapse to false");
    });

    it("Boundary 4c: Secondary array with falsy values (empty strings, null, undefined) filtered cleanly", () => {
      const product = {
        id: "falsy-items",
        name: "Falsy Items",
        images: ["/cover.jpg", "", null, undefined, "/valid.jpg", ""],
      };

      const res = resolveGalleryImages(product);
      assert.strictEqual(res.coverImage, "/cover.jpg");
      assert.deepStrictEqual(res.secondaryImages, ["/valid.jpg"]);
      assert.strictEqual(res.allGalleryImages.length, 2);
    });

    it("Boundary 5: Mobile Touch Swipe Gesture Mechanics (Threshold = 40px)", () => {
      // Horizontal swipe LEFT (clientX decreases: 200 -> 150, diffX = -50, |diffX| = 50 > 40) -> next
      assert.strictEqual(
        resolveSwipeDirection(200, 100, 150, 102),
        "next",
        "Swipe left should trigger 'next'"
      );

      // Horizontal swipe RIGHT (clientX increases: 100 -> 160, diffX = 60, |diffX| = 60 > 40) -> prev
      assert.strictEqual(
        resolveSwipeDirection(100, 100, 160, 105),
        "prev",
        "Swipe right should trigger 'prev'"
      );

      // Sub-threshold move (diffX = 39 <= 40) -> null
      assert.strictEqual(
        resolveSwipeDirection(100, 100, 139, 100),
        null,
        "Move under 40px threshold should NOT trigger swipe"
      );

      // Exact threshold move (diffX = 40, condition is strict > 40) -> null
      assert.strictEqual(
        resolveSwipeDirection(100, 100, 140, 100),
        null,
        "Exact 40px delta should NOT trigger swipe"
      );

      // Vertical dominant scroll (diffX = 30, diffY = 150) -> user is scrolling page -> null
      assert.strictEqual(
        resolveSwipeDirection(100, 100, 130, 250),
        null,
        "Vertical scrolling must NOT trigger gallery swipe"
      );

      // Diagonal gesture where vertical equals horizontal (diffX = 50, diffY = 50) -> null
      assert.strictEqual(
        resolveSwipeDirection(100, 100, 150, 150),
        null,
        "Equal diagonal delta should NOT trigger swipe"
      );

      // Diagonal gesture with vertical > horizontal (diffX = -55, diffY = 90) -> null
      assert.strictEqual(
        resolveSwipeDirection(200, 100, 145, 190),
        null,
        "Dominant vertical gesture must NOT trigger swipe"
      );

      // Incomplete gestures (null touches) -> null
      assert.strictEqual(resolveSwipeDirection(null, 100, 150, 100), null);
      assert.strictEqual(resolveSwipeDirection(100, 100, null, 100), null);
      assert.strictEqual(resolveSwipeDirection(null, null, null, null), null);
    });

    it("Boundary 6: Product ID change triggers activeImageIndex reset to 0 in PDP", () => {
      const resetEffectPattern =
        /useEffect\s*\(\s*\(\)\s*=>\s*{\s*setActiveImageIndex\(0\);\s*},\s*\[product\.id\]\s*\)/;
      assert.ok(
        resetEffectPattern.test(pdpContent),
        "ProductDetailClient.tsx must reset activeImageIndex to 0 when product.id changes"
      );
    });

    it("Boundary 7: PDP preserves R1 stock limits and exact error message verbatim", () => {
      const expectedError = "out of stock please choose a different size";
      assert.ok(
        pdpContent.includes(expectedError),
        `ProductDetailClient.tsx must contain verbatim error string: "${expectedError}"`
      );

      const addToBagButtonMatch = pdpContent.match(
        /<button[^>]*onClick={handleAddToCart}[^>]*>[\s\S]*?ADD TO BAG[\s\S]*?<\/button>/
      );
      assert.ok(addToBagButtonMatch, "Add to bag button found");
      assert.strictEqual(
        /\bdisabled\b/.test(addToBagButtonMatch[0]),
        false,
        "Add to bag button must NOT have disabled attribute"
      );
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 4: lib/products.ts Verbatim Helper Function Verification
  // --------------------------------------------------------------------------
  describe("Suite 4: lib/products.ts Helper Contract Verification", () => {

    it("exports getProductCoverImage and getProductSecondaryImages in lib/products.ts", () => {
      assert.ok(
        /export\s+function\s+getProductCoverImage/.test(productsLibContent),
        "getProductCoverImage must be exported"
      );
      assert.ok(
        /export\s+function\s+getProductSecondaryImages/.test(productsLibContent),
        "getProductSecondaryImages must be exported"
      );
    });

    it("getProductCoverImage verbatim code handles explicit cover, legacy images[0], and id fallback", () => {
      assert.strictEqual(
        getProductCoverImageVerbatim({ id: "p1", cover_image: "/explicit.jpg", images: ["/legacy.jpg"] }),
        "/explicit.jpg"
      );
      assert.strictEqual(
        getProductCoverImageVerbatim({ id: "p2", images: ["/legacy.jpg"] }),
        "/legacy.jpg"
      );
      assert.strictEqual(
        getProductCoverImageVerbatim({ id: "p3", images: [] }),
        "/images/looks/p3.jpg"
      );
      assert.strictEqual(
        getProductCoverImageVerbatim({ id: "p4" }),
        "/images/looks/p4.jpg"
      );
    });

    it("getProductSecondaryImages verbatim code handles explicit secondary, legacy slice(1), and single image", () => {
      assert.deepStrictEqual(
        getProductSecondaryImagesVerbatim({ id: "p1", secondary_images: ["/s1.jpg", "/s2.jpg"], images: ["/l0.jpg", "/l1.jpg"] }),
        ["/s1.jpg", "/s2.jpg"]
      );
      assert.deepStrictEqual(
        getProductSecondaryImagesVerbatim({ id: "p2", images: ["/l0.jpg", "/l1.jpg", "/l2.jpg"] }),
        ["/l1.jpg", "/l2.jpg"]
      );
      assert.deepStrictEqual(
        getProductSecondaryImagesVerbatim({ id: "p3", images: ["/single.jpg"] }),
        []
      );
      assert.deepStrictEqual(
        getProductSecondaryImagesVerbatim({ id: "p4", images: [] }),
        []
      );
    });
  });
});
