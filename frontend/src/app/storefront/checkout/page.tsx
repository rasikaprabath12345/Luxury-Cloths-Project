"use client";

import { useCart } from "../../../context/CartContext";
import { useState, useEffect } from "react";
import axios from "axios";

export default function CheckoutPage() {
    const cart = useCart();
    const cartItems = cart?.cartItems || [];
    const clearCart = cart?.clearCart || (() => {});
    const [customerName, setCustomerName] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const total = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0);

    const handleCheckout = async () => {
        setError("");
        
        if (!customerName.trim() || !address.trim()) {
            setError("කරුණාකර සියලුම ක්ෂේත්ර පුරවන්න");
            return;
        }

        if (cartItems.length === 0) {
            setError("කරුණාකර බඩුවක් සමඟ එකතු කරන්න");
            return;
        }

        setLoading(true);
        const orderData = {
            customerName,
            address,
            items: cartItems.map((item: any) => ({ productId: item.id, quantity: 1 })),
            totalAmount: total
        };

        try {
            await axios.post("http://localhost:5226/api/orders", orderData);
            alert("ඇණවුම සාර්ථකව සිදු විය!");
            clearCart();
            window.location.href = "/";
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "ඇණවුම සිදු කිරීමේදී දෝෂයක් ඇති විය.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-10 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            
            {!isClient ? (
                <div className="text-center">Loading...</div>
            ) : cartItems.length === 0 ? (
                <div className="bg-yellow-100 text-yellow-700 p-4 rounded">
                    <p>ඔබගේ කාටය හිස් ඇත</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
                    
                    <div className="bg-gray-50 p-4 rounded border">
                        <h2 className="font-bold mb-3">ඇණවුම සාරාංශය</h2>
                        {cartItems.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between py-2 border-b text-sm">
                                <span>{item.name || "Unknown"}</span>
                                <span>${(item.price || 0).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between py-2 font-bold pt-2">
                            <span>එකතුව:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="ඔබේ නම" 
                        className="w-full border p-2 rounded" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)} 
                        required 
                    />
                    <textarea 
                        placeholder="ලිපිනය" 
                        className="w-full border p-2 rounded h-24" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        required 
                    />
                    
                    <button 
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full bg-black text-white py-3 mt-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed font-bold"
                    >
                        {loading ? "ඉවසා ඇත..." : "ඇණවුම තහවුරු කරන්න"}
                    </button>
                </div>
            )}
        </div>
    );
}