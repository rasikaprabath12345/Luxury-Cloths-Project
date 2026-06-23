"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";

export default function CartDrawer({ onClose }: { onClose: () => void }) {
    const { cartItems } = useCart();
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-80 h-full p-6 shadow-xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">ඔබේ Cart එක</h2>
                    <button onClick={onClose} className="text-xl">X</button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {cartItems.length === 0 ? <p>Cart එක හිස්.</p> : (
                        cartItems.map((item, index) => (
                            <div key={index} className="flex justify-between py-2 border-b">
                                <span>{item.name}</span>
                                <span>${item.price.toFixed(2)}</span>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t pt-4">
                    <p className="text-lg font-bold">මුළු මුදල: ${total.toFixed(2)}</p>
                    <Link href="/storefront/checkout" onClick={onClose}>
                        <button className="w-full bg-black text-white py-3 mt-4 rounded-lg">Checkout යන්න</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}