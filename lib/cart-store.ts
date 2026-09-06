import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  lookId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (lookId: string, size: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),
      removeItem: (lookId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.lookId === lookId && i.size === size)
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "flipmeet-cart" }
  )
);
