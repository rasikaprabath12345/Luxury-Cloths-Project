"use client";

import { useState, useEffect } from "react";
import axios from "axios";
// 💡 Relative path එකක් පාවිච්චි කරලා එරර් එක සම්පූර්ණයෙන්ම විසඳා ඇත
import { useCart, Product } from "../../../context/CartContext"; 

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false); 

  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5226/api/Products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const totalPrice = cartItems.reduce((acc, item: any) => acc + item.price * (item.quantity || 1), 0);

  return (
    <div className="bg-black text-white min-h-screen relative overflow-x-hidden">
      
      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto px-4 py-10 flex items-center justify-between border-b border-zinc-900">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Luxury Clothing Collection</h1>
          <p className="text-zinc-500 text-sm mt-1">සුවපහසු වාරික ඇඟලුම් එකතුව.</p>
        </div>

        {/* 🛒 CART BUTTON WITH BADGE */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-4 rounded-xl transition"
        >
          <span>🛒</span>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
              {cartItems.reduce((sum, item: any) => sum + (item.quantity || 1), 0)}
            </span>
          )}
        </button>
      </div>

      {/* PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-zinc-500 text-sm">නිෂ්පාදන ලෝඩ් වෙමින් පවතී...🔄</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const validImageUrl = product.imageUrl || product.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";
              return (
                <div key={product.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden group hover:border-zinc-800 transition flex flex-col justify-between">
                  <div className="h-72 w-full bg-zinc-900 overflow-hidden relative">
                    <img src={validImageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-zinc-200 text-base truncate">{product.name}</h3>
                    <div className="text-lg font-black text-white">${product.price.toFixed(2)}</div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
                    >
                      Add to Cart 🛒
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🛍️ SLIDING CART SIDEBAR */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-900 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <h2 className="text-xl font-black text-blue-500">ඔබේ කරත්තය (Cart)</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-500 hover:text-white text-lg">✕</button>
              </div>

              <div className="mt-6 space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                {cartItems.length === 0 ? (
                  <p className="text-zinc-500 text-center text-sm py-10">කාර්ට් එක හිස්ව පවතී. 📦</p>
                ) : (
                  cartItems.map((item: any) => {
                    const itemImg = item.imageUrl || item.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";
                    const itemQuantity = item.quantity || 1;

                    return (
                      <div key={item.id} className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-900">
                        <img src={itemImg} className="w-14 h-14 object-cover rounded-lg" alt={item.name}/>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-zinc-200 truncate">{item.name}</h4>
                          <p className="text-xs text-blue-500 font-bold mt-0.5">${(item.price * itemQuantity).toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQuantity(item.id, itemQuantity - 1)} className="bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-xs">-</button>
                            <span className="text-xs font-bold">{itemQuantity}</span>
                            <button onClick={() => updateQuantity(item.id, itemQuantity + 1)} className="bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-xs">+</button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 text-xs font-semibold">Remove</button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Total & Checkout */}
            <div className="border-t border-zinc-900 pt-4 space-y-4">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-zinc-400">මුළු එකතුව (Total):</span>
                <span className="text-xl text-white">${totalPrice.toFixed(2)}</span>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-sm transition">
                Checkout කරන්න 💳
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}