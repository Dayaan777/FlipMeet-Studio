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
        set((state) => {
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
      clear: () => set({ items: [] }),
    }),
    { name: "flipmeet-cart" }
  )
);
