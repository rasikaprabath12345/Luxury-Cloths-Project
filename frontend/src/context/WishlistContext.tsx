"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/components/ProductCard";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadedUserId, setLoadedUserId] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (authLoading) return;

    const key = user ? `wishlist_${user.id}` : "wishlist";
    const savedWishlist = localStorage.getItem(key);
    let itemsToSet: Product[] = [];

    if (savedWishlist) {
      try {
        itemsToSet = JSON.parse(savedWishlist);
      } catch (error) {
        console.error("Failed to parse wishlist:", error);
      }
    }

    // Merge logic: If user just logged in, merge guest wishlist into user wishlist
    if (user) {
      const guestWishlist = localStorage.getItem("wishlist");
      if (guestWishlist) {
        try {
          const parsedGuest = JSON.parse(guestWishlist);
          if (Array.isArray(parsedGuest) && parsedGuest.length > 0) {
            const merged = [...itemsToSet];
            parsedGuest.forEach((gItem: Product) => {
              if (!merged.some((item) => item.id === gItem.id)) {
                merged.push(gItem);
              }
            });
            itemsToSet = merged;
          }
        } catch (error) {
          console.error("Failed to parse guest wishlist:", error);
        }
        localStorage.removeItem("wishlist");
      }
    }

    setWishlistItems(itemsToSet);
    setLoadedUserId(user ? user.id : null);
    setIsLoaded(true);
  }, [user, authLoading]);

  useEffect(() => {
    const currentUserId = user ? user.id : null;
    if (isLoaded && !authLoading && loadedUserId === currentUserId) {
      const key = user ? `wishlist_${user.id}` : "wishlist";
      localStorage.setItem(key, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded, user, authLoading, loadedUserId]);

  useEffect(() => {
    const handleLogout = () => {
      setWishlistItems([]);
      setLoadedUserId(undefined);
    };
    window.addEventListener("luxury-logout", handleLogout);
    return () => {
      window.removeEventListener("luxury-logout", handleLogout);
    };
  }, []);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id: number) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWishlist = (id: number) => {
    return wishlistItems.some((item) => item.id === id);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
