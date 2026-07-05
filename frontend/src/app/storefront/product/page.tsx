"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function ProductPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
              const isOutOfStock = product.variants && product.variants.length > 0
                ? product.variants.every((v: any) => v.stockQuantity <= 0)
                : false;
              return (
                <div key={product.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden group hover:border-zinc-800 transition flex flex-col justify-between">
                  <Link href={`/storefront/product/${product.slug}`} className="cursor-pointer">
                    <div className="h-72 w-full bg-zinc-900 overflow-hidden relative">
                      <img src={validImageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-zinc-200 text-base truncate">{product.name}</h3>
                      <div className="text-lg font-black text-white">Rs. {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  </Link>
                  <div className="px-5 pb-5 pt-0">
                    <Link href={`/storefront/product/${product.slug}`} className="w-full block">
                      <button 
                        className="w-full border rounded-xl py-3 text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 bg-transparent border-zinc-800 hover:bg-zinc-900 text-white cursor-pointer"
                      >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        Select Options
                      </button>
                    </Link>
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