import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FavoriteItem {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  material: string;
  description: string;
}

interface FavoritesStore {
  items: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  getFavoriteCount: () => number;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      addFavorite: (item) => {
        const items = get().items;
        if (!items.find((i) => i.id === item.id)) {
          set({ items: [...items, item] });
        }
      },

      removeFavorite: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      isFavorite: (id) => {
        return get().items.some((item) => item.id === id);
      },

      getFavoriteCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "oro-nacional-favorites",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
