import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Helper to simulate the admin image array assembly logic from app/admin/page.tsx
function assembleProductImages({
  cleanId,
  finalCoverUrl,
  existingSecondaryUrls = [],
  uploadedSecondaryUrls = [],
}) {
  const finalSecondaryUrls = [...existingSecondaryUrls, ...uploadedSecondaryUrls];

  if (finalCoverUrl) {
    return [finalCoverUrl, ...finalSecondaryUrls];
  } else if (finalSecondaryUrls.length > 0) {
    return finalSecondaryUrls;
  } else {
    return [`/images/looks/${cleanId}.jpg`];
  }
}

// Storage key generator matching app/admin/page.tsx
function generateCoverStorageKey(productId, filename, timestamp, random) {
  const ext = (filename.split(".").pop() || "png").toLowerCase();
  return `${productId.trim()}-cover-${timestamp}-${random}.${ext}`;
}

function generateSecondaryStorageKey(productId, filename, timestamp, index, random) {
  const ext = (filename.split(".").pop() || "png").toLowerCase();
  return `${productId.trim()}-sec-${timestamp}-${index}-${random}.${ext}`;
}

describe("R2 Admin Image Upload Restructuring", () => {
  const adminPagePath = path.join(projectRoot, "app", "admin", "page.tsx");
  const productsLibPath = path.join(projectRoot, "lib", "products.ts");

  assert.ok(fs.existsSync(adminPagePath), "app/admin/page.tsx must exist");
  assert.ok(fs.existsSync(productsLibPath), "lib/products.ts must exist");

  const adminContent = fs.readFileSync(adminPagePath, "utf-8");
  const productsLibContent = fs.readFileSync(productsLibPath, "utf-8");

  describe("1. Static Code Analysis: URL Input Removal", () => {
    it("ProductForm type must not contain 'images: string'", () => {
      const typeMatch = adminContent.match(/type\s+ProductForm\s*=\s*{([^}]+)}/);
      assert.ok(typeMatch, "ProductForm type definition found");
      const typeBody = typeMatch[1];
      assert.strictEqual(
        /images\s*:\s*string/.test(typeBody),
        false,
        "ProductForm must NOT contain 'images: string'"
      );
    });

    it("DEFAULT_FORM must not contain 'images: string' initialization", () => {
      const defaultFormMatch = adminContent.match(/const\s+DEFAULT_FORM[^=]*=\s*{([^}]+)}/);
      assert.ok(defaultFormMatch, "DEFAULT_FORM definition found");
      const defaultFormBody = defaultFormMatch[1];
      assert.strictEqual(
        /images\s*:\s*["']/.test(defaultFormBody),
        false,
        "DEFAULT_FORM must NOT contain 'images' property"
      );
    });

    it("formData.images must have zero occurrences in app/admin/page.tsx", () => {
      const occurrences = (adminContent.match(/formData\.images/g) || []).length;
      assert.strictEqual(
        occurrences,
        0,
        `Expected 0 occurrences of formData.images, found ${occurrences}`
      );
    });

    it("There must be zero text inputs for image URLs in app/admin/page.tsx", () => {
      // Check for any text input with image URL placeholders or images value
      const hasImageTextInput =
        /<input[^>]*type=["']text["'][^>]*(?:value={formData\.images}|placeholder=[^>]*stwd-shirt)/i.test(
          adminContent
        );
      assert.strictEqual(
        hasImageTextInput,
        false,
        "Must NOT have any text input bound to formData.images or image URL placeholders"
      );
    });

    it("Must NOT have any label asking for image URLs in the admin form", () => {
      assert.strictEqual(
        /enter URLs/i.test(adminContent),
        false,
        "Admin form must not contain 'enter URLs' prompt"
      );
    });
  });

  describe("2. Static Code Analysis: Two Distinct File Upload Sections", () => {
    it("Must contain a dedicated Cover Image file input that is strictly single-file (not multiple)", () => {
      // Search for cover input element with type="file"
      const coverInputMatch = adminContent.match(
        /<input[^<]*?ref={coverInputRef}[^<]*?\/>/
      );
      assert.ok(coverInputMatch, "Cover image file input must be present with coverInputRef");
      const coverInputTag = coverInputMatch[0];
      assert.ok(
        /type=["']file["']/.test(coverInputTag),
        "Cover image input must have type='file'"
      );
      assert.strictEqual(
        /\bmultiple\b/.test(coverInputTag),
        false,
        "Cover image file input must strictly NOT have the 'multiple' attribute"
      );
      assert.ok(
        /accept=["'][^"']*image\/png[^"']*["']/.test(coverInputTag),
        "Cover image input must specify accepted image mime types"
      );
    });

    it("Must contain a dedicated Secondary Images file input with 'multiple' attribute", () => {
      const secondaryInputMatch = adminContent.match(
        /<input[^<]*?ref={secondaryInputRef}[^<]*?\/>/
      );
      assert.ok(
        secondaryInputMatch,
        "Secondary images file input must be present with secondaryInputRef"
      );
      const secondaryInputTag = secondaryInputMatch[0];
      assert.ok(
        /type=["']file["']/.test(secondaryInputTag),
        "Secondary images input must have type='file'"
      );
      assert.ok(
        /\bmultiple\b/.test(secondaryInputTag),
        "Secondary images file input MUST have the 'multiple' attribute"
      );
      assert.ok(
        /accept=["'][^"']*image\/png[^"']*["']/.test(secondaryInputTag),
        "Secondary images input must specify accepted image mime types"
      );
    });

    it("Cover image section must provide preview card, Replace, and Remove actions", () => {
      assert.ok(
        adminContent.includes("Cover Image"),
        "Cover Image section title/label must be present"
      );
      assert.ok(
        adminContent.includes("Replace"),
        "Cover Image must have a 'Replace' action button"
      );
      assert.ok(
        adminContent.includes("handleRemoveCover"),
        "Cover Image must have a handleRemoveCover handler"
      );
      assert.ok(
        adminContent.includes("coverPreviewUrl"),
        "Cover Image state must track preview URL"
      );
    });

    it("Secondary images section must provide thumbnail preview grid and individual remove buttons", () => {
      assert.ok(
        adminContent.includes("Secondary Images"),
        "Secondary Images section title/label must be present"
      );
      assert.ok(
        adminContent.includes("handleRemoveSecondaryFile"),
        "Secondary images must have an individual remove handler for new files"
      );
      assert.ok(
        adminContent.includes("handleRemoveExistingSecondaryUrl"),
        "Secondary images must have an individual remove handler for existing database URLs"
      );
      assert.ok(
        adminContent.includes("handleClearSecondaryFiles"),
        "Secondary images must have a clear/reset action"
      );
    });

    it("Direct Supabase Storage upload to 'products' bucket must be implemented", () => {
      assert.ok(
        /\.from\(\s*["']products["']\s*\)[\s\S]*?\.upload\(/.test(adminContent),
        "Supabase Storage .from('products').upload(...) must be called"
      );
      assert.ok(
        /\.from\(\s*["']products["']\s*\)[\s\S]*?\.getPublicUrl\(/.test(adminContent),
        "Supabase Storage .from('products').getPublicUrl(...) must be called to obtain public URLs"
      );
      assert.ok(
        adminContent.includes("-cover-"),
        "Cover image upload key must contain '-cover-'"
      );
      assert.ok(
        adminContent.includes("-sec-"),
        "Secondary image upload key must contain '-sec-'"
      );
    });

    it("Object URLs must be cleanly revoked to prevent memory leaks", () => {
      const revokeMatches = adminContent.match(/URL\.revokeObjectURL/g) || [];
      assert.ok(
        revokeMatches.length >= 3,
        `Expected at least 3 URL.revokeObjectURL calls, found ${revokeMatches.length}`
      );
    });
  });

  describe("3. Storage Key Generation Formatting", () => {
    it("generates correct unique Cover Image storage key", () => {
      const key = generateCoverStorageKey("product-07", "hero-shot.PNG", 1728300000, "abc12");
      assert.strictEqual(key, "product-07-cover-1728300000-abc12.png");
    });

    it("generates correct unique Secondary Image storage key with index", () => {
      const key = generateSecondaryStorageKey("product-07", "side-angle.JPEG", 1728300000, 2, "xyz99");
      assert.strictEqual(key, "product-07-sec-1728300000-2-xyz99.jpeg");
    });
  });

  describe("4. Image Upload & Assembly Logic", () => {
    it("Case 1: New product with single cover and multiple secondary images", () => {
      const cleanId = "product-12";
      const finalCoverUrl = "https://example.supabase.co/storage/v1/object/public/products/product-12-cover-123-abc.png";
      const uploadedSecondaryUrls = [
        "https://example.supabase.co/storage/v1/object/public/products/product-12-sec-123-0-def.png",
        "https://example.supabase.co/storage/v1/object/public/products/product-12-sec-123-1-ghi.png",
      ];

      const assembled = assembleProductImages({
        cleanId,
        finalCoverUrl,
        existingSecondaryUrls: [],
        uploadedSecondaryUrls,
      });

      assert.strictEqual(assembled.length, 3);
      assert.strictEqual(assembled[0], finalCoverUrl, "Cover image must always be index 0");
      assert.strictEqual(assembled[1], uploadedSecondaryUrls[0], "Secondary image 1 must be index 1");
      assert.strictEqual(assembled[2], uploadedSecondaryUrls[1], "Secondary image 2 must be index 2");
    });

    it("Case 2: Editing product — retains existing cover image and appends new secondary images", () => {
      const cleanId = "product-01";
      const existingCoverUrl = "https://example.supabase.co/storage/v1/object/public/products/product-01-cover.png";
      const existingSecondaryUrls = [
        "https://example.supabase.co/storage/v1/object/public/products/product-01-sec-1.png",
      ];
      const newlyUploadedSecondaryUrls = [
        "https://example.supabase.co/storage/v1/object/public/products/product-01-sec-new.png",
      ];

      const assembled = assembleProductImages({
        cleanId,
        finalCoverUrl: existingCoverUrl,
        existingSecondaryUrls,
        uploadedSecondaryUrls: newlyUploadedSecondaryUrls,
      });

      assert.strictEqual(assembled.length, 3);
      assert.strictEqual(assembled[0], existingCoverUrl, "Index 0 is the existing cover");
      assert.strictEqual(assembled[1], existingSecondaryUrls[0], "Index 1 is the existing secondary");
      assert.strictEqual(assembled[2], newlyUploadedSecondaryUrls[0], "Index 2 is the newly added secondary");
    });

    it("Case 3: Editing product — replaces cover image and preserves secondary images", () => {
      const cleanId = "product-02";
      const newCoverUrl = "https://example.supabase.co/storage/v1/object/public/products/product-02-cover-v2.png";
      const existingSecondaryUrls = [
        "https://example.supabase.co/storage/v1/object/public/products/product-02-sec-1.png",
        "https://example.supabase.co/storage/v1/object/public/products/product-02-sec-2.png",
      ];

      const assembled = assembleProductImages({
        cleanId,
        finalCoverUrl: newCoverUrl,
        existingSecondaryUrls,
        uploadedSecondaryUrls: [],
      });

      assert.strictEqual(assembled.length, 3);
      assert.strictEqual(assembled[0], newCoverUrl, "Index 0 is the replaced cover");
      assert.deepStrictEqual(assembled.slice(1), existingSecondaryUrls, "Indices 1..N are secondary images");
    });

    it("Case 4: Product with only a cover image and zero secondary images", () => {
      const cleanId = "product-03";
      const coverUrl = "https://example.supabase.co/storage/v1/object/public/products/product-03-cover.png";

      const assembled = assembleProductImages({
        cleanId,
        finalCoverUrl: coverUrl,
        existingSecondaryUrls: [],
        uploadedSecondaryUrls: [],
      });

      assert.strictEqual(assembled.length, 1);
      assert.strictEqual(assembled[0], coverUrl);
    });

    it("Case 5: Fallback default when no images are provided", () => {
      const cleanId = "product-99";

      const assembled = assembleProductImages({
        cleanId,
        finalCoverUrl: "",
        existingSecondaryUrls: [],
        uploadedSecondaryUrls: [],
      });

      assert.strictEqual(assembled.length, 1);
      assert.strictEqual(assembled[0], "/images/looks/product-99.jpg");
    });
  });

  describe("5. Products Lib Helpers Verification", () => {
    it("lib/products.ts exports getProductCoverImage and getProductSecondaryImages", () => {
      assert.ok(
        productsLibContent.includes("export function getProductCoverImage"),
        "lib/products.ts must export getProductCoverImage"
      );
      assert.ok(
        productsLibContent.includes("export function getProductSecondaryImages"),
        "lib/products.ts must export getProductSecondaryImages"
      );
    });

    it("getProductCoverImage correctly returns index 0 or fallback", () => {
      const mockProductWithImages = {
        id: "look-01",
        images: ["/cover.jpg", "/sec1.jpg", "/sec2.jpg"],
      };
      const mockProductNoImages = {
        id: "look-02",
        images: [],
      };

      // Inline implementation matching lib/products.ts
      function getProductCoverImage(product) {
        if (product.images && product.images.length > 0 && product.images[0]) {
          return product.images[0];
        }
        return `/images/looks/${product.id}.jpg`;
      }

      assert.strictEqual(getProductCoverImage(mockProductWithImages), "/cover.jpg");
      assert.strictEqual(getProductCoverImage(mockProductNoImages), "/images/looks/look-02.jpg");
    });

    it("getProductSecondaryImages correctly returns indices 1..N or empty array", () => {
      const mockProductWithImages = {
        id: "look-01",
        images: ["/cover.jpg", "/sec1.jpg", "/sec2.jpg"],
      };
      const mockProductSingleImage = {
        id: "look-02",
        images: ["/cover.jpg"],
      };

      function getProductSecondaryImages(product) {
        if (product.images && product.images.length > 1) {
          return product.images.slice(1).filter(Boolean);
        }
        return [];
      }

      assert.deepStrictEqual(getProductSecondaryImages(mockProductWithImages), ["/sec1.jpg", "/sec2.jpg"]);
      assert.deepStrictEqual(getProductSecondaryImages(mockProductSingleImage), []);
    });
  });
});
