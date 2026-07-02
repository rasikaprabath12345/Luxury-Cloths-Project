"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const hasLegacy = Array.isArray(parsed) && parsed.some((item: any) => !item.variantId);
        if (hasLegacy) {
          localStorage.removeItem("cart");
          setCartItems([]);
        } else {
          setCartItems(parsed);
        }
      } catch (error) {
        console.error("Failed to parse cart:", error);
        localStorage.removeItem("cart");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

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