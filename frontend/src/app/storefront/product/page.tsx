"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useCart, Product } from "../../../context/CartContext";

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { addToCart } = useCart();

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



  return (
    <div className="bg-black text-white min-h-screen relative overflow-x-hidden">
      
      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto px-4 py-10 flex items-center justify-between border-b border-zinc-900">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Luxury Clothing Collection</h1>
          <p className="text-zinc-500 text-sm mt-1">සුවපහසු වාරික ඇඟලුම් එකතුව.</p>
        </div>
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
    </div>
  );
}