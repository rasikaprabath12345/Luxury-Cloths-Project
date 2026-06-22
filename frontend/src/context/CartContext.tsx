"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartContextType {
    cartItems: any[];
    addToCart: (product: any) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<any[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart from localStorage:", error);
                localStorage.removeItem("cart");
            }
        }
    }, []);

    const addToCart = (product: any) => {
        const newCart = [...cartItems, product];
        setCartItems(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem("cart");
    };

    const value: CartContextType = { cartItems, addToCart, clearCart };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within CartProvider");
    }
    return context;
};