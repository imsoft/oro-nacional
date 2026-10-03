import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  // Precio unitario SIEMPRE en MXN; la conversión a USD se hace al mostrar/cobrar
  price: number;
  // Precio fijo en USD si el producto/talla lo tiene (si no, se convierte desde MXN)
  priceUSD?: number | null;
  image: string;
  quantity: number;
  size?: string;
  material: string;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.size === item.size
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),

      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && item.size === size)
          ),
        })),

      updateQuantity: (id, quantity, size) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) => !(item.id === id && item.size === size)
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === id && item.size === size ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "oro-nacional-cart",
      storage: createJSONStorage(() => localStorage),
      // v2: los precios se guardan en MXN. Los carritos anteriores mezclaban
      // monedas, así que se descartan al migrar.
      version: 2,
      migrate: () => ({ items: [] }),
    }
  )
);
