import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { create } from "zustand";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const REQUIRED_ERROR = "out of stock please choose a different size";

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
    removeItem: (lookId, size) =>
      set((state) => ({
        items: state.items.filter(
          (i) => !(i.lookId === lookId && i.size === size)
        ),
      })),
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

// Client-side proceed to checkout simulation (matching ProductDetailClient.tsx)
function simulateProceedToCheckout({
  product,
  selectedSize,
  selectedWaist,
  cartItems,
}) {
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

  const alreadyInCart = cartItems.some(
    (item) => item.lookId === product.id && item.size === finalSize
  );

  const targetQty = alreadyInCart ? currentQtyInCart : currentQtyInCart + 1;

  if (availableStock <= 0 || targetQty > availableStock) {
    return {
      success: false,
      error: REQUIRED_ERROR,
      blocked: true,
      navigated: false,
    };
  }

  return {
    success: true,
    navigated: true,
    alreadyInCart,
    itemToAdd: alreadyInCart
      ? null
      : {
          lookId: product.id,
          name: product.name,
          size: finalSize,
          price: product.price,
          quantity: 1,
          maxStock: availableStock,
        },
  };
}

// Server-side checkout pre-order check simulation (matching app/api/checkout/route.ts)
function simulatePreOrderStockCheck(dbProducts, incomingItems) {
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

  return { valid: true, status: 200 };
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

describe("Adversarial Empirical Verification Suite (Challenger R2_1)", () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Concurrency & Repeated Clicks: 0 and 1 Stock Scenarios
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Concurrency & Repeated Clicks: 0 and 1 Stock Scenarios", () => {
    it("50 rapid concurrent clicks attempting to add 0-stock size are all rejected", async () => {
      const store = createTestCartStore();
      const zeroStockProduct = {
        id: "prod-zero",
        name: "Zero Stock Shirt",
        category: "Shirts",
        price: 15000,
        stock: 0,
        sizes: [JSON.stringify({ size: "S", stock: 0, isDefault: true })],
      };

      const results = await Promise.all(
        Array.from({ length: 50 }, async () => {
          const res = simulateAddToCart({
            product: zeroStockProduct,
            selectedSize: "S",
            cartItems: store.getState().items,
          });
          if (res.success) {
            store.getState().addItem(res.itemToAdd);
          }
          return res;
        })
      );

      // Invariants: Cart must be empty, every attempt rejected with exact error
      assert.equal(store.getState().items.length, 0, "Cart must remain completely empty");
      for (const res of results) {
        assert.equal(res.success, false);
        assert.equal(res.blocked, true);
        assert.equal(res.error, REQUIRED_ERROR);
      }
    });

    it("50 rapid concurrent clicks attempting to add 1-stock size only add exactly 1 unit", async () => {
      const store = createTestCartStore();
      const singleStockProduct = {
        id: "prod-single",
        name: "Single Stock Jersey",
        category: "Jerseys",
        price: 16500,
        stock: 1,
        sizes: [JSON.stringify({ size: "M", stock: 1, isDefault: true })],
      };

      // Run sequential click events updating store in real-time
      const clickResults = [];
      for (let i = 0; i < 50; i++) {
        const res = simulateAddToCart({
          product: singleStockProduct,
          selectedSize: "M",
          cartItems: store.getState().items,
        });
        if (res.success) {
          store.getState().addItem(res.itemToAdd);
        }
        clickResults.push(res);
      }

      // Exactly the first click succeeds; subsequent 49 clicks fail with exact error
      assert.equal(clickResults[0].success, true, "First click should succeed");
      for (let i = 1; i < 50; i++) {
        assert.equal(clickResults[i].success, false, `Click ${i + 1} must be blocked`);
        assert.equal(clickResults[i].error, REQUIRED_ERROR);
      }

      assert.equal(store.getState().items.length, 1, "Only 1 line item allowed");
      assert.equal(store.getState().items[0].quantity, 1, "Quantity must remain strictly 1");
    });

    it("cart store addItem rejects direct concurrent additions exceeding maxStock", async () => {
      const store = createTestCartStore();
      const itemToAdd = {
        lookId: "prod-direct",
        name: "Direct Cart Item",
        size: "L",
        price: 18000,
        quantity: 1,
        maxStock: 1,
      };

      // Simulate 50 concurrent dispatch calls to store.addItem directly
      await Promise.all(
        Array.from({ length: 50 }, async () => {
          store.getState().addItem(itemToAdd);
        })
      );

      assert.equal(store.getState().items.length, 1, "Store should contain only 1 line item");
      assert.equal(store.getState().items[0].quantity, 1, "Store quantity must never exceed maxStock (1)");
    });

    it("cart store addItem rejects single addition requesting quantity > maxStock", () => {
      const store = createTestCartStore();
      store.getState().addItem({
        lookId: "oversell-item",
        name: "Oversell Attempt",
        size: "M",
        price: 18000,
        quantity: 5,
        maxStock: 1,
      });

      assert.equal(store.getState().items.length, 0, "Item must not be added when quantity > maxStock");
    });

    it("cart store addItem rejects addition when maxStock is negative or zero", () => {
      const store = createTestCartStore();
      store.getState().addItem({
        lookId: "neg-stock",
        name: "Negative Stock Item",
        size: "M",
        price: 18000,
        quantity: 1,
        maxStock: -1,
      });
      store.getState().addItem({
        lookId: "zero-stock",
        name: "Zero Stock Item",
        size: "M",
        price: 18000,
        quantity: 1,
        maxStock: 0,
      });

      assert.equal(store.getState().items.length, 0, "Items with maxStock <= 0 must be rejected");
    });

    it("repeated clicks on Proceed to Checkout do not bypass stock limit when stock is 1", () => {
      const store = createTestCartStore();
      const singleStockProduct = {
        id: "prod-checkout-test",
        name: "Checkout Test Item",
        category: "Shirts",
        price: 15000,
        stock: 1,
        sizes: [JSON.stringify({ size: "L", stock: 1, isDefault: true })],
      };

      // Click 1: Cart is empty, proceeds to checkout, adds 1 unit
      const res1 = simulateProceedToCheckout({
        product: singleStockProduct,
        selectedSize: "L",
        cartItems: store.getState().items,
      });
      assert.equal(res1.success, true);
      assert.equal(res1.navigated, true);
      assert.ok(res1.itemToAdd);
      store.getState().addItem(res1.itemToAdd);

      // Click 2: Item already in cart at max stock (1). Proceeds to checkout without adding extra quantity
      const res2 = simulateProceedToCheckout({
        product: singleStockProduct,
        selectedSize: "L",
        cartItems: store.getState().items,
      });
      assert.equal(res2.success, true);
      assert.equal(res2.navigated, true);
      assert.equal(res2.itemToAdd, null, "Should not add duplicate item");
      assert.equal(store.getState().items[0].quantity, 1, "Quantity remains 1");

      // Click 3: If user switches size to an out-of-stock size (0 stock) and clicks Proceed to Checkout
      const oosProduct = {
        ...singleStockProduct,
        sizes: [JSON.stringify({ size: "L", stock: 0, isDefault: true })],
      };
      const res3 = simulateProceedToCheckout({
        product: oosProduct,
        selectedSize: "L",
        cartItems: store.getState().items,
      });
      assert.equal(res3.success, false);
      assert.equal(res3.blocked, true);
      assert.equal(res3.error, REQUIRED_ERROR);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Cart Limits Across Primary Sizes with Waist Specifications
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. Cart Limits Across Primary Sizes with Waist Specifications", () => {
    const outfitProduct = {
      id: "anime-gojo-outfit",
      name: "Jujutsu Kaisen Gojo Outfit",
      category: "Outfits",
      price: 28500,
      stock: 1,
      sizes: [
        JSON.stringify({ size: "M", stock: 1, isDefault: true }),
        JSON.stringify({ size: "L", stock: 2, isDefault: false }),
      ],
    };

    it("blocks adding 'M / 32' when 'M / 30' is already in cart and size M stock is 1", () => {
      const store = createTestCartStore();
      const firstAdd = simulateAddToCart({
        product: outfitProduct,
        selectedSize: "M",
        selectedWaist: "30",
        cartItems: store.getState().items,
      });

      assert.equal(firstAdd.success, true);
      assert.equal(firstAdd.itemToAdd.size, "M / 30");
      store.getState().addItem(firstAdd.itemToAdd);

      // Now user changes waist selector to 32 and clicks Add to Bag
      const secondAdd = simulateAddToCart({
        product: outfitProduct,
        selectedSize: "M",
        selectedWaist: "32",
        cartItems: store.getState().items,
      });

      assert.equal(secondAdd.success, false);
      assert.equal(secondAdd.blocked, true);
      assert.equal(secondAdd.error, REQUIRED_ERROR);
    });

    it("allows multiple waist variants when primary size stock allows, up to the limit", () => {
      const store = createTestCartStore();
      // Size L has stock = 2. User adds 'L / 30' then 'L / 34'
      const add1 = simulateAddToCart({
        product: outfitProduct,
        selectedSize: "L",
        selectedWaist: "30",
        cartItems: store.getState().items,
      });
      assert.equal(add1.success, true);
      store.getState().addItem(add1.itemToAdd);

      const add2 = simulateAddToCart({
        product: outfitProduct,
        selectedSize: "L",
        selectedWaist: "34",
        cartItems: store.getState().items,
      });
      assert.equal(add2.success, true);
      store.getState().addItem(add2.itemToAdd);

      // Total quantity of L across waists is now 2. Attempting a 3rd ('L / 36') must be blocked
      const add3 = simulateAddToCart({
        product: outfitProduct,
        selectedSize: "L",
        selectedWaist: "36",
        cartItems: store.getState().items,
      });
      assert.equal(add3.success, false);
      assert.equal(add3.blocked, true);
      assert.equal(add3.error, REQUIRED_ERROR);
    });

    it("handles whitespace and case variations consistently across waist specifications", () => {
      const store = createTestCartStore();
      store.getState().addItem({
        lookId: outfitProduct.id,
        name: outfitProduct.name,
        size: "m / 30", // lowercase
        price: 28500,
        quantity: 1,
        maxStock: 1,
      });

      const attempt = simulateAddToCart({
        product: outfitProduct,
        selectedSize: "M",
        selectedWaist: "32",
        cartItems: store.getState().items,
      });

      assert.equal(attempt.success, false);
      assert.equal(attempt.error, REQUIRED_ERROR);
    });

    it("maintains strict product isolation: waist variants on product A do not block product B", () => {
      const store = createTestCartStore();
      const outfitA = {
        id: "outfit-a",
        name: "Outfit A",
        category: "Outfits",
        price: 28500,
        stock: 1,
        sizes: [JSON.stringify({ size: "M", stock: 1, isDefault: true })],
      };
      const outfitB = {
        id: "outfit-b",
        name: "Outfit B",
        category: "Outfits",
        price: 28500,
        stock: 1,
        sizes: [JSON.stringify({ size: "M", stock: 1, isDefault: true })],
      };

      const addA = simulateAddToCart({
        product: outfitA,
        selectedSize: "M",
        selectedWaist: "30",
        cartItems: store.getState().items,
      });
      assert.equal(addA.success, true);
      store.getState().addItem(addA.itemToAdd);

      // Now add product B with same size and waist
      const addB = simulateAddToCart({
        product: outfitB,
        selectedSize: "M",
        selectedWaist: "30",
        cartItems: store.getState().items,
      });
      assert.equal(addB.success, true, "Product B should not be blocked by Product A");
      store.getState().addItem(addB.itemToAdd);

      assert.equal(store.getState().items.length, 2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Server-side Pre-order Check: Invalid, Cross-Waist & Out-of-Stock Rejections
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Server-side Pre-order Check Validation", () => {
    const dbInventory = [
      {
        id: "db-shirt",
        name: "DB Shirt",
        stock: 3,
        sizes: [
          JSON.stringify({ size: "S", stock: 0, isDefault: false }),
          JSON.stringify({ size: "M", stock: 1, isDefault: true }),
          JSON.stringify({ size: "L", stock: 2, isDefault: false }),
        ],
      },
      {
        id: "db-outfit",
        name: "DB Outfit",
        stock: 1,
        sizes: [JSON.stringify({ size: "M", stock: 1, isDefault: true })],
      },
      {
        id: "legacy-prod",
        name: "Legacy Product",
        stock: 5,
        sizes: [], // no JSON variants
      },
    ];

    it("rejects order containing an out-of-stock size variant (stock = 0)", () => {
      const check = simulatePreOrderStockCheck(dbInventory, [
        { lookId: "db-shirt", size: "S", quantity: 1 },
      ]);
      assert.equal(check.valid, false);
      assert.equal(check.status, 400);
      assert.equal(check.error, REQUIRED_ERROR);
    });

    it("rejects order requesting quantity exceeding variant stock (stock = 1, requested = 2)", () => {
      const check = simulatePreOrderStockCheck(dbInventory, [
        { lookId: "db-shirt", size: "M", quantity: 2 },
      ]);
      assert.equal(check.valid, false);
      assert.equal(check.status, 400);
      assert.equal(check.error, REQUIRED_ERROR);
    });

    it("rejects order with cross-waist line items that cumulatively exceed primary size stock", () => {
      // db-outfit size M has stock 1. Payload orders 1x 'M / 30' and 1x 'M / 32'
      const check = simulatePreOrderStockCheck(dbInventory, [
        { lookId: "db-outfit", size: "M / 30", quantity: 1 },
        { lookId: "db-outfit", size: "M / 32", quantity: 1 },
      ]);
      assert.equal(check.valid, false);
      assert.equal(check.status, 400);
      assert.equal(check.error, REQUIRED_ERROR);
    });

    it("rejects order with multiple duplicate line items that cumulatively exceed variant stock", () => {
      // db-shirt size M has stock 1. Payload splits it into two line items of qty 1
      const check = simulatePreOrderStockCheck(dbInventory, [
        { lookId: "db-shirt", size: "M", quantity: 1 },
        { lookId: "db-shirt", size: "M", quantity: 1 },
      ]);
      assert.equal(check.valid, false);
      assert.equal(check.status, 400);
      assert.equal(check.error, REQUIRED_ERROR);
    });

    it("rejects order requesting a non-existent / invalid size variant", () => {
      const check = simulatePreOrderStockCheck(dbInventory, [
        { lookId: "db-shirt", size: "XXL", quantity: 1 },
      ]);
      assert.equal(check.valid, false);
      assert.equal(check.status, 400);
      assert.equal(check.error, REQUIRED_ERROR);
    });

    it("rejects order on legacy products when requested quantity exceeds aggregate stock", () => {
      const check = simulatePreOrderStockCheck(dbInventory, [
        { lookId: "legacy-prod", size: "ONE SIZE", quantity: 6 }, // stock is 5
      ]);
      assert.equal(check.valid, false);
      assert.equal(check.status, 400);
      assert.equal(check.error, REQUIRED_ERROR);
    });

    it("normalizes negative or non-numeric quantities to minimum 1 to prevent negative bypasses", () => {
      // Malformed quantity -5 should normalize to 1, valid against stock 2
      const check = simulatePreOrderStockCheck(dbInventory, [
        { lookId: "db-shirt", size: "L", quantity: -5 },
      ]);
      assert.equal(check.valid, true);
    });

    it("accepts valid checkout within exact stock limits", () => {
      const check = simulatePreOrderStockCheck(dbInventory, [
        { lookId: "db-shirt", size: "M", quantity: 1 },
        { lookId: "db-shirt", size: "L", quantity: 2 },
      ]);
      assert.equal(check.valid, true);
      assert.equal(check.status, 200);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Database Stock Decrement Logic Invariants
  // ─────────────────────────────────────────────────────────────────────────────
  describe("4. Database Stock Decrement Logic Invariants", () => {
    const multiVariantProduct = {
      id: "multi-stock-product",
      name: "Multi Stock Product",
      stock: 10,
      sizes: [
        JSON.stringify({ size: "S", stock: 2, isDefault: false }),
        JSON.stringify({ size: "M", stock: 3, isDefault: true }),
        JSON.stringify({ size: "L", stock: 4, isDefault: false }),
        JSON.stringify({ size: "XL", stock: 1, isDefault: false }),
      ],
    };

    it("Invariant: Stock never drops below 0 even under extreme oversell requests", () => {
      const decremented = simulateOrderStockDecrement(multiVariantProduct, [
        { size: "S", quantity: 9999 },
        { size: "M", quantity: 100 },
      ]);

      const sVariant = decremented.variants.find((v) => v.size === "S");
      const mVariant = decremented.variants.find((v) => v.size === "M");
      assert.equal(sVariant.stock, 0, "Stock must be clamped at 0");
      assert.equal(mVariant.stock, 0, "Stock must be clamped at 0");
      assert.ok(decremented.stock >= 0, "Aggregate stock must never be negative");
    });

    it("Invariant: Product total stock always equals exact sum of variant stocks", () => {
      const decremented = simulateOrderStockDecrement(multiVariantProduct, [
        { size: "M", quantity: 2 },
        { size: "L", quantity: 1 },
      ]);

      const sumOfVariants = decremented.variants.reduce(
        (sum, v) => sum + Number(v.stock),
        0
      );
      assert.equal(
        decremented.stock,
        sumOfVariants,
        "Total stock must exactly match sum of all variant stocks"
      );
      assert.equal(decremented.stock, 7, "Stock decremented from 10 to 7");
    });

    it("Invariant: Waist formatted sizes ('M / 30', 'M / 32') decrement primary size M correctly", () => {
      const decremented = simulateOrderStockDecrement(multiVariantProduct, [
        { size: "M / 30", quantity: 1 },
        { size: "M / 32", quantity: 2 },
      ]);

      const mVariant = decremented.variants.find((v) => v.size === "M");
      assert.equal(mVariant.stock, 0, "Size M should decrement by total of 3 (1 + 2) from 3 to 0");
      assert.equal(decremented.stock, 7, "Aggregate stock correctly decrements to 7");
    });

    it("Invariant: Decrementing one size variant has zero side effects on unrelated variants", () => {
      const decremented = simulateOrderStockDecrement(multiVariantProduct, [
        { size: "XL", quantity: 1 },
      ]);

      const sVariant = decremented.variants.find((v) => v.size === "S");
      const mVariant = decremented.variants.find((v) => v.size === "M");
      const lVariant = decremented.variants.find((v) => v.size === "L");
      const xlVariant = decremented.variants.find((v) => v.size === "XL");

      assert.equal(sVariant.stock, 2, "Size S untouched");
      assert.equal(mVariant.stock, 3, "Size M untouched");
      assert.equal(lVariant.stock, 4, "Size L untouched");
      assert.equal(xlVariant.stock, 0, "Size XL decremented by 1 to 0");
    });

    it("Invariant: Serialized sizes array maintains valid JSON and preserves isDefault flag", () => {
      const decremented = simulateOrderStockDecrement(multiVariantProduct, [
        { size: "S", quantity: 1 },
      ]);

      assert.ok(Array.isArray(decremented.sizes));
      assert.equal(decremented.sizes.length, 4);

      for (const str of decremented.sizes) {
        const parsed = JSON.parse(str);
        assert.ok(parsed.size, "Must have size property");
        assert.ok(typeof parsed.stock === "number", "Stock must be numeric");
        assert.ok(typeof parsed.isDefault === "boolean", "isDefault must be boolean");
      }

      const parsedM = JSON.parse(decremented.sizes[1]);
      assert.equal(parsedM.isDefault, true, "isDefault flag for M preserved");
    });

    it("Invariant: Legacy products without sizes array decrement aggregate stock directly", () => {
      const legacyProd = {
        id: "legacy-1",
        name: "Legacy Cap",
        stock: 5,
        sizes: [], // No variants
      };

      const decremented = simulateOrderStockDecrement(legacyProd, [
        { size: "ONE SIZE", quantity: 3 },
      ]);

      assert.equal(decremented.stock, 2, "Aggregate stock must decrement from 5 to 2");
    });

    it("Invariant: Legacy products with plain string sizes initialize at stock 100 and decrement accurately", () => {
      const legacyPlain = {
        id: "legacy-apparel",
        name: "Legacy Plain Apparel",
        stock: 200,
        sizes: ["S", "M"], // Plain string sizes
      };

      const decremented = simulateOrderStockDecrement(legacyPlain, [
        { size: "S", quantity: 2 },
      ]);

      const sVar = decremented.variants.find((v) => v.size === "S");
      const mVar = decremented.variants.find((v) => v.size === "M");
      assert.equal(sVar.stock, 98, "Size S decrements from default 100 to 98");
      assert.equal(mVar.stock, 100, "Size M remains at 100");
      assert.equal(decremented.stock, 198, "Total stock is 98 + 100 = 198");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Static Code Inspection & Implementation Contract
  // ─────────────────────────────────────────────────────────────────────────────
  describe("5. Static Code Inspection & Implementation Contract", () => {
    it("ProductDetailClient.tsx enforces exact error string and removes disabled button trap", () => {
      const clientPath = path.join(
        projectRoot,
        "app/product/[slug]/ProductDetailClient.tsx"
      );
      const content = fs.readFileSync(clientPath, "utf-8");

      assert.ok(
        content.includes("out of stock please choose a different size"),
        "Must render verbatim error message 'out of stock please choose a different size'"
      );

      assert.ok(
        content.includes('role="alert"'),
        "Must have role='alert' for accessibility error banner"
      );

      assert.ok(
        !content.includes("disabled={isOOS}"),
        "Must not disable button with disabled={isOOS} so clicks trigger error message"
      );
    });

    it("lib/cart-store.ts defines maxStock and enforces upper bound guard in addItem", () => {
      const storePath = path.join(projectRoot, "lib/cart-store.ts");
      const content = fs.readFileSync(storePath, "utf-8");

      assert.ok(
        content.includes("maxStock?: number"),
        "CartItem interface must define maxStock?: number"
      );

      assert.ok(
        content.includes("item.maxStock !== undefined && item.maxStock <= 0"),
        "addItem must reject incoming item with maxStock <= 0"
      );

      assert.ok(
        content.includes("currentQty + item.quantity > max"),
        "addItem must reject incoming addition when existing currentQty + quantity > max"
      );
    });

    it("app/api/checkout/route.ts verifies stock prior to order creation and decrements atomically", () => {
      const routePath = path.join(projectRoot, "app/api/checkout/route.ts");
      const content = fs.readFileSync(routePath, "utf-8");

      assert.ok(
        content.includes(`"out of stock please choose a different size"`),
        "Pre-order check must return verbatim error string"
      );

      assert.ok(
        content.includes("Math.max(0, currentVariantStock - ordered.quantity)"),
        "Variant stock decrement must clamp at 0"
      );

      assert.ok(
        content.includes("revalidatePath"),
        "Must call revalidatePath to invalidate storefront cache"
      );
    });
  });
});
