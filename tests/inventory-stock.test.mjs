import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { create } from "zustand";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Core parsing and serialization helpers (matching lib/products.ts)
function parseSizeVariants(sizes) {
  if (!sizes || sizes.length === 0) return [];
  return sizes.map((s) => {
    try {
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed === "object" && "size" in parsed) {
        return parsed;
      }
    } catch (_) {}
    return { size: s, stock: 100, isDefault: false };
  });
}

function serializeSizeVariants(variants) {
  return variants.map((v) => JSON.stringify(v));
}

// Factory to create an isolated cart store with maxStock defense (matching lib/cart-store.ts)
function createTestCartStore() {
  return create((set) => ({
    items: [],
    addItem: (item) =>
      set((state) => {
        if (item.maxStock !== undefined && item.maxStock <= 0) {
          return state;
        }

        if (item.isBundle) {
          const index = state.items.findIndex(
            (i) => i.lookId === item.lookId && i.isBundle
          );
          if (index > -1) {
            const updated = [...state.items];
            updated[index] = { ...item, quantity: 1 };
            return { items: updated };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }

        const index = state.items.findIndex(
          (i) => i.lookId === item.lookId && i.size === item.size
        );
        if (index > -1) {
          const currentQty = state.items[index].quantity;
          const max = item.maxStock !== undefined ? item.maxStock : state.items[index].maxStock;
          if (max !== undefined && currentQty + item.quantity > max) {
            return state;
          }
          const updated = [...state.items];
          updated[index] = {
            ...updated[index],
            quantity: currentQty + item.quantity,
            maxStock: max,
          };
          return { items: updated };
        }

        if (item.maxStock !== undefined && item.quantity > item.maxStock) {
          return state;
        }

        return { items: [...state.items, item] };
      }),
    clear: () => set({ items: [] }),
  }));
}

// Client-side storefront validation simulation (matching ProductDetailClient.tsx)
function simulateAddToCart({
  product,
  selectedSize,
  selectedWaist,
  cartItems,
}) {
  const REQUIRED_ERROR = "out of stock please choose a different size";
  const sizeVariants = parseSizeVariants(product.sizes || []);
  const isOutfit = product.category?.toLowerCase().includes("outfit");
  const isPants =
    (product.category?.toLowerCase().includes("pant") ||
      product.category?.toLowerCase().includes("trouser")) &&
    !isOutfit;
  const finalSize =
    isPants || isOutfit ? `${selectedSize} / ${selectedWaist || "30"}` : selectedSize;

  const selectedVariant = sizeVariants.find((v) => v.size === selectedSize);
  const availableStock = selectedVariant
    ? selectedVariant.stock
    : sizeVariants.length === 0
    ? product.stock ?? 0
    : 0;

  const currentQtyInCart = cartItems
    .filter(
      (i) =>
        i.lookId === product.id &&
        i.size.split("/")[0].trim().toUpperCase() === selectedSize.toUpperCase()
    )
    .reduce((sum, i) => sum + i.quantity, 0);

  if (availableStock <= 0 || currentQtyInCart + 1 > availableStock) {
    return {
      success: false,
      error: REQUIRED_ERROR,
      blocked: true,
      currentQtyInCart,
      availableStock,
    };
  }

  return {
    success: true,
    itemToAdd: {
      lookId: product.id,
      name: product.name,
      size: finalSize,
      price: product.price,
      quantity: 1,
      maxStock: availableStock,
    },
    currentQtyInCart,
    availableStock,
  };
}

// Server-side checkout pre-order check simulation (matching app/api/checkout/route.ts)
function simulatePreOrderStockCheck(dbProducts, incomingItems) {
  const REQUIRED_ERROR = "out of stock please choose a different size";
  const requestedQtyByProductAndSize = new Map();
  const totalRequestedQtyByProduct = new Map();

  for (const item of incomingItems) {
    const pId = item.product_id || item.productId || item.lookId;
    if (!pId) continue;
    const primarySize = (item.size || "ONE SIZE").split("/")[0].trim().toUpperCase();
    const qty = item.isBundle ? 1 : Math.max(1, Number(item.quantity) || 1);
    const key = `${pId}:::${primarySize}`;
    requestedQtyByProductAndSize.set(
      key,
      (requestedQtyByProductAndSize.get(key) || 0) + qty
    );
    totalRequestedQtyByProduct.set(
      pId,
      (totalRequestedQtyByProduct.get(pId) || 0) + qty
    );
  }

  for (const dbProduct of dbProducts) {
    const variants = parseSizeVariants(dbProduct.sizes || []);
    const totalRequestedForProd = totalRequestedQtyByProduct.get(dbProduct.id) || 0;

    if (Number(dbProduct.stock) <= 0 && totalRequestedForProd > 0) {
      return { valid: false, status: 400, error: REQUIRED_ERROR };
    }

    if (variants.length > 0) {
      for (const [key, reqQty] of requestedQtyByProductAndSize.entries()) {
        const [pId, primarySize] = key.split(":::");
        if (pId !== dbProduct.id) continue;

        const variant = variants.find(
          (v) => v.size.toUpperCase() === primarySize
        );

        if (!variant) {
          return { valid: false, status: 400, error: REQUIRED_ERROR };
        }

        if (Number(variant.stock) <= 0 || reqQty > Number(variant.stock)) {
          return { valid: false, status: 400, error: REQUIRED_ERROR };
        }
      }
    } else {
      if (totalRequestedForProd > Number(dbProduct.stock)) {
        return { valid: false, status: 400, error: REQUIRED_ERROR };
      }
    }
  }

  return { valid: true };
}

// Server-side order stock decrement simulation (matching app/api/checkout/route.ts)
function simulateOrderStockDecrement(dbProduct, purchasedItems) {
  const variants = parseSizeVariants(dbProduct.sizes || []);

  if (variants.length > 0) {
    for (const item of purchasedItems) {
      const primarySize = (item.size || "").split("/")[0].trim().toUpperCase();
      const variantIndex = variants.findIndex(
        (v) => v.size.toUpperCase() === primarySize
      );
      if (variantIndex > -1) {
        const currentStock = Number(variants[variantIndex].stock) || 0;
        variants[variantIndex].stock = Math.max(0, currentStock - item.quantity);
      }
    }

    const newTotalStock = variants.reduce(
      (sum, v) => sum + (Number(v.stock) || 0),
      0
    );

    return {
      sizes: serializeSizeVariants(variants),
      stock: newTotalStock,
      variants,
    };
  } else {
    const totalPurchased = purchasedItems.reduce((s, i) => s + i.quantity, 0);
    const newStock = Math.max(0, (Number(dbProduct.stock) || 0) - totalPurchased);
    return {
      sizes: dbProduct.sizes,
      stock: newStock,
      variants: [],
    };
  }
}

describe("R1. Inventory Stock Limits Verification Suite", () => {
  describe("1. Zero-Stock (0 stock) Selection & Error Display", () => {
    const oosProduct = {
      id: "test-shirt",
      name: "Test Shirt",
      category: "Shirts",
      price: 15000,
      stock: 5,
      sizes: [
        JSON.stringify({ size: "S", stock: 0, isDefault: false }),
        JSON.stringify({ size: "M", stock: 5, isDefault: true }),
      ],
    };

    it("should block adding a 0-stock size and return exact error message", () => {
      const result = simulateAddToCart({
        product: oosProduct,
        selectedSize: "S",
        cartItems: [],
      });

      assert.equal(result.success, false);
      assert.equal(result.blocked, true);
      assert.equal(result.error, "out of stock please choose a different size");
    });

    it("cart store addItem must reject items when maxStock is 0", () => {
      const store = createTestCartStore();
      store.getState().addItem({
        lookId: "test-shirt",
        name: "Test Shirt",
        size: "S",
        price: 15000,
        quantity: 1,
        maxStock: 0,
      });

      assert.equal(store.getState().items.length, 0);
    });

    it("server pre-order check must reject checkout when an item has 0 stock", () => {
      const check = simulatePreOrderStockCheck([oosProduct], [
        { lookId: "test-shirt", size: "S", quantity: 1 },
      ]);

      assert.equal(check.valid, false);
      assert.equal(check.status, 400);
      assert.equal(check.error, "out of stock please choose a different size");
    });
  });

  describe("2. Exceeding Available Stock Limit (stock=1 scenarios)", () => {
    const singleStockProduct = {
      id: "anime-gojo-jersey",
      name: "Jujutsu Kaisen Gojo Jersey",
      category: "Jerseys",
      price: 16500,
      stock: 4,
      sizes: [
        JSON.stringify({ size: "S", stock: 1, isDefault: true }),
        JSON.stringify({ size: "M", stock: 1, isDefault: false }),
        JSON.stringify({ size: "L", stock: 1, isDefault: false }),
        JSON.stringify({ size: "XL", stock: 1, isDefault: false }),
      ],
    };

    it("allows adding 1 item when stock is 1", () => {
      const store = createTestCartStore();
      const firstAdd = simulateAddToCart({
        product: singleStockProduct,
        selectedSize: "S",
        cartItems: store.getState().items,
      });

      assert.equal(firstAdd.success, true);
      store.getState().addItem(firstAdd.itemToAdd);
      assert.equal(store.getState().items.length, 1);
      assert.equal(store.getState().items[0].quantity, 1);
    });

    it("blocks second addition when stock is 1 and displays verbatim error message", () => {
      const store = createTestCartStore();
      // First add
      const firstAdd = simulateAddToCart({
        product: singleStockProduct,
        selectedSize: "S",
        cartItems: [],
      });
      store.getState().addItem(firstAdd.itemToAdd);

      // Attempt second add with item already in cart
      const secondAdd = simulateAddToCart({
        product: singleStockProduct,
        selectedSize: "S",
        cartItems: store.getState().items,
      });

      assert.equal(secondAdd.success, false);
      assert.equal(secondAdd.blocked, true);
      assert.equal(secondAdd.error, "out of stock please choose a different size");

      // Attempt adding directly into store
      store.getState().addItem(firstAdd.itemToAdd);
      assert.equal(store.getState().items[0].quantity, 1, "Quantity must not exceed maxStock");
    });

    it("enforces stock limit across waist variants with matching primary size", () => {
      const outfitProduct = {
        id: "test-outfit",
        name: "Test Outfit",
        category: "Outfits",
        price: 25000,
        stock: 1,
        sizes: [JSON.stringify({ size: "M", stock: 1, isDefault: true })],
      };

      const existingCart = [
        {
          lookId: "test-outfit",
          size: "M / 30",
          quantity: 1,
        },
      ];

      // User tries to add "M / 32"
      const result = simulateAddToCart({
        product: outfitProduct,
        selectedSize: "M",
        selectedWaist: "32",
        cartItems: existingCart,
      });

      assert.equal(result.success, false);
      assert.equal(result.blocked, true);
      assert.equal(result.error, "out of stock please choose a different size");
    });

    it("server pre-order check rejects order requesting quantity > available size stock", () => {
      const check = simulatePreOrderStockCheck([singleStockProduct], [
        { lookId: "anime-gojo-jersey", size: "S", quantity: 2 },
      ]);

      assert.equal(check.valid, false);
      assert.equal(check.status, 400);
      assert.equal(check.error, "out of stock please choose a different size");
    });
  });

  describe("3. Database Stock Decrement on Order", () => {
    const dbProduct = {
      id: "anime-gojo-jersey",
      name: "Jujutsu Kaisen Gojo Jersey",
      stock: 4,
      sizes: [
        JSON.stringify({ size: "S", stock: 1, isDefault: true }),
        JSON.stringify({ size: "M", stock: 1, isDefault: false }),
        JSON.stringify({ size: "L", stock: 1, isDefault: false }),
        JSON.stringify({ size: "XL", stock: 1, isDefault: false }),
      ],
    };

    it("correctly decrements size stock and recomputes total aggregate stock", () => {
      const updated = simulateOrderStockDecrement(dbProduct, [
        { size: "S", quantity: 1 },
      ]);

      assert.equal(updated.stock, 3, "Total stock should decrement from 4 to 3");
      const sVariant = updated.variants.find((v) => v.size === "S");
      const mVariant = updated.variants.find((v) => v.size === "M");

      assert.equal(sVariant.stock, 0, "Purchased size S stock must be 0");
      assert.equal(mVariant.stock, 1, "Unpurchased size M stock must remain 1");

      // Verify serialized sizes format
      assert.ok(Array.isArray(updated.sizes));
      assert.equal(updated.sizes.length, 4);
      const parsedS = JSON.parse(updated.sizes[0]);
      assert.equal(parsedS.size, "S");
      assert.equal(parsedS.stock, 0);
    });

    it("correctly handles primary size matching with waist specification (e.g. 'M / 32')", () => {
      const updated = simulateOrderStockDecrement(dbProduct, [
        { size: "M / 32", quantity: 1 },
      ]);

      assert.equal(updated.stock, 3);
      const mVariant = updated.variants.find((v) => v.size === "M");
      assert.equal(mVariant.stock, 0);
    });

    it("clamps stock at 0 and does not result in negative numbers", () => {
      const updated = simulateOrderStockDecrement(dbProduct, [
        { size: "L", quantity: 99 },
      ]);

      const lVariant = updated.variants.find((v) => v.size === "L");
      assert.equal(lVariant.stock, 0, "Stock cannot be negative");
      assert.equal(updated.stock, 3, "Aggregate stock must remain non-negative sum");
    });
  });

  describe("4. Static Code Inspection & File Ownership Conformance", () => {
    it("ProductDetailClient.tsx has verbatim error message and removed disabled attribute", () => {
      const clientPath = path.join(
        projectRoot,
        "app/product/[slug]/ProductDetailClient.tsx"
      );
      const content = fs.readFileSync(clientPath, "utf-8");

      assert.ok(
        content.includes("out of stock please choose a different size"),
        "Must contain verbatim error message 'out of stock please choose a different size'"
      );

      assert.ok(
        !content.includes("Sorry, this size just sold out. Please pick another size to continue."),
        "Old error message must be removed"
      );

      assert.ok(
        !content.includes("disabled={isOOS}"),
        "disabled={isOOS} must be removed to allow clicking 0-stock size buttons"
      );
    });

    it("lib/cart-store.ts defines maxStock on CartItem and guards addItem", () => {
      const storePath = path.join(projectRoot, "lib/cart-store.ts");
      const content = fs.readFileSync(storePath, "utf-8");

      assert.ok(
        content.includes("maxStock?: number"),
        "CartItem must define maxStock?: number"
      );

      assert.ok(
        content.includes("item.maxStock !== undefined && item.maxStock <= 0"),
        "addItem must guard against adding items with maxStock <= 0"
      );

      assert.ok(
        content.includes("currentQty + item.quantity > max"),
        "addItem must guard against exceeding maxStock for existing items"
      );
    });

    it("app/api/checkout/route.ts contains pre-order check, stock decrement and cache revalidation", () => {
      const routePath = path.join(projectRoot, "app/api/checkout/route.ts");
      const content = fs.readFileSync(routePath, "utf-8");

      assert.ok(
        content.includes("out of stock please choose a different size"),
        "Pre-order check must return exact error string"
      );

      assert.ok(
        content.includes("revalidatePath"),
        "Must call revalidatePath"
      );

      assert.ok(
        content.includes("parseSizeVariants") && content.includes("serializeSizeVariants"),
        "Must parse and serialize size variants"
      );
    });

    it("app/product/[slug]/page.tsx exports dynamic = 'force-dynamic'", () => {
      const pagePath = path.join(projectRoot, "app/product/[slug]/page.tsx");
      const content = fs.readFileSync(pagePath, "utf-8");

      assert.ok(
        content.includes('export const dynamic = "force-dynamic";'),
        "Must export dynamic = 'force-dynamic'"
      );
    });
  });
});
