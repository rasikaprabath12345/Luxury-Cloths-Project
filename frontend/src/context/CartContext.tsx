"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  image?: string;
  description?: string;
  variants?: any[];
}

interface CartItem extends Product {
  quantity: number;
  size?: string;
  color?: string;
  variantId?: number;
  availableStock?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    size?: string,
    color?: string,
    variantId?: number,
    availableStock?: number
  ) => void;
  updateQuantity: (id: number, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (id: number, size?: string, color?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadedUserId, setLoadedUserId] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (authLoading) return;

    const key = user ? `cart_${user.id}` : "cart";
    const savedCart = localStorage.getItem(key);
    let itemsToSet: CartItem[] = [];

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const hasLegacy = Array.isArray(parsed) && parsed.some((item: any) => !item.variantId);
        if (!hasLegacy) {
          itemsToSet = parsed;
        }
      } catch (error) {
        console.error("Failed to parse cart:", error);
      }
    }

    // Merge logic: If user just logged in, merge guest cart into user cart
    if (user) {
      const guestCart = localStorage.getItem("cart");
      if (guestCart) {
        try {
          const parsedGuest = JSON.parse(guestCart);
          if (Array.isArray(parsedGuest) && parsedGuest.length > 0) {
            const merged = [...itemsToSet];
            parsedGuest.forEach((gItem: CartItem) => {
              const exist = merged.find(
                (item) => item.id === gItem.id && item.size === gItem.size && item.color === gItem.color
              );
              if (exist) {
                exist.quantity = (exist.quantity || 1) + (gItem.quantity || 1);
              } else {
                merged.push(gItem);
              }
            });
            itemsToSet = merged;
          }
        } catch (error) {
          console.error("Failed to parse guest cart:", error);
        }
        localStorage.removeItem("cart");
      }
    }

    setCartItems(itemsToSet);
    setLoadedUserId(user ? user.id : null);
    setIsLoaded(true);
  }, [user, authLoading]);

  useEffect(() => {
    const currentUserId = user ? user.id : null;
    if (isLoaded && !authLoading && loadedUserId === currentUserId) {
      const key = user ? `cart_${user.id}` : "cart";
      localStorage.setItem(key, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded, user, authLoading, loadedUserId]);

  useEffect(() => {
    const handleLogout = () => {
      setCartItems([]);
      setLoadedUserId(undefined);
    };
    window.addEventListener("luxury-logout", handleLogout);
    return () => {
      window.removeEventListener("luxury-logout", handleLogout);
    };
  }, []);

  const addToCart = (
    product: Product,
    qty: number = 1,
    size?: string,
    color?: string,
    variantId?: number,
    availableStock?: number
  ) => {
    // Resolve variant details from product metadata if not passed directly (safeguard for lists)
    let finalVariantId = variantId;
    let finalSize = size;
    let finalColor = color;
    let finalAvailStock = availableStock;

    if (!finalVariantId && (product as any).variants && (product as any).variants.length > 0) {
      const firstAvail = (product as any).variants.find((v: any) => v.stockQuantity > 0) || (product as any).variants[0];
      if (firstAvail) {
        finalVariantId = firstAvail.variantId || firstAvail.id;
        finalSize = finalSize || firstAvail.size;
        finalColor = finalColor || firstAvail.color;
        finalAvailStock = firstAvail.stockQuantity - (firstAvail.reservedQuantity || 0);
      }
    }

    setCartItems((prev) => {
      const exist = prev.find(
        (item) => item.id === product.id && item.size === finalSize && item.color === finalColor
      );
      if (exist) {
        const newQty = (exist.quantity || 1) + qty;
        const stockLimit = finalAvailStock !== undefined ? finalAvailStock : exist.availableStock;
        const finalQty = stockLimit !== undefined ? Math.min(newQty, stockLimit) : newQty;

        return prev.map((item) =>
          item.id === product.id && item.size === finalSize && item.color === finalColor
            ? { ...item, quantity: finalQty, variantId: finalVariantId || item.variantId, availableStock: stockLimit }
            : item
        );
      }
      const stockLimit = finalAvailStock;
      const finalQty = stockLimit !== undefined ? Math.min(qty, stockLimit) : qty;
      return [
        ...prev,
        {
          ...product,
          quantity: finalQty,
          size: finalSize,
          color: finalColor,
          variantId: finalVariantId,
          availableStock: stockLimit,
        },
      ];
    });
  };

  const updateQuantity = (id: number, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.size === size && item.color === color) {
          const finalQty = item.availableStock !== undefined ? Math.min(quantity, item.availableStock) : quantity;
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: number, size?: string, color?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size && item.color === color))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};