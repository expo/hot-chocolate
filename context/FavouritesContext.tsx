import Storage from 'expo-sqlite/kv-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

function getStoredSet(key: string): Set<number> {
  const value = Storage.getItemSync(key);
  if (value) {
    try {
      return new Set(JSON.parse(value));
    } catch {
      return new Set();
    }
  }
  return new Set();
}

function storeSet(key: string, value: Set<number>) {
  Storage.setItem(key, JSON.stringify([...value]));
}

type FavouritesContextType = {
  favourites: Set<number>;
  tasted: Set<number>;
  toggleFavourite: (id: number) => void;
  toggleTasted: (id: number) => void;
  isFavourite: (id: number) => boolean;
  isTasted: (id: number) => boolean;
};

const FavouritesContext = createContext<FavouritesContextType | null>(null);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<Set<number>>(() => getStoredSet('favourites'));
  const [tasted, setTasted] = useState<Set<number>>(() => getStoredSet('tasted'));

  useEffect(() => {
    storeSet('favourites', favourites);
  }, [favourites]);

  useEffect(() => {
    storeSet('tasted', tasted);
  }, [tasted]);

  const toggleFavourite = (id: number) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleTasted = (id: number) => {
    setTasted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isFavourite = (id: number) => favourites.has(id);
  const isTasted = (id: number) => tasted.has(id);

  return (
    <FavouritesContext.Provider
      value={{ favourites, tasted, toggleFavourite, toggleTasted, isFavourite, isTasted }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}
