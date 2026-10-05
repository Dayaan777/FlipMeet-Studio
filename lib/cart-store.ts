import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BundleSize = {
  outfitName: string;
  topSize: string;
  waist: string;
};

export type CartItem = {
  lookId: string;
  name: string;
  size: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  image?: string;
  /** True when this item is a bundle (e.g. anime-bundle-5-outfits) */
  isBundle?: boolean;
  /** Size breakdown for each outfit in a bundle */
  bundleSizes?: BundleSize[];
  /** Product category, used for referral discount filtering */
  category?: string;
};

type CartState = {
  items: CartItem[];
  /** Referral code applied to this cart */
  referralCode?: string;
  /** Discount percentage (0-100) granted by the applied referral code */
  referralDiscountPct?: number;
  /** Product categories eligible for the referral discount */
  referralCategories?: string[];

  addItem: (item: CartItem) => void;
  removeItem: (lookId: string, size: string) => void;
  clear: () => void;
  /** Apply a referral code with its discount percentage and eligible categories */
  setReferral: (code: string, pct: number, categories: string[]) => void;
  /** Remove any applied referral code */
  clearReferral: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      referralCode: undefined,
      referralDiscountPct: undefined,
      referralCategories: undefined,

      addItem: (item) =>
        set((state) => {
          if (item.isBundle) {
            // Bundle items are matched only by lookId — quantity is always 1
            const index = state.items.findIndex(
              (i) => i.lookId === item.lookId && i.isBundle
            );
            if (index > -1) {
              // Replace bundle in place (e.g. to update bundleSizes)
              const updated = [...state.items];
              updated[index] = { ...item, quantity: 1 };
              return { items: updated };
            }
            return { items: [...state.items, { ...item, quantity: 1 }] };
          }

          // Regular items matched by lookId + size
          const index = state.items.findIndex(
            (i) => i.lookId === item.lookId && i.size === item.size
          );
          if (index > -1) {
            const updated = [...state.items];
            updated[index] = {
              ...updated[index],
              quantity: updated[index].quantity + item.quantity,
            };
            return { items: updated };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (lookId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.lookId === lookId && i.size === size)
          ),
        })),

      clear: () =>
        set({
          items: [],
          referralCode: undefined,
          referralDiscountPct: undefined,
          referralCategories: undefined,
        }),

      setReferral: (code, pct, categories) =>
        set({
          referralCode: code,
          referralDiscountPct: pct,
          referralCategories: categories,
        }),

      clearReferral: () =>
        set({
          referralCode: undefined,
          referralDiscountPct: undefined,
          referralCategories: undefined,
        }),
    }),
    { name: "flipmeet-cart" }
  )
);
