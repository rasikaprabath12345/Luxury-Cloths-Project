"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from backend
    setLoading(false);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 pt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shop</h1>
        <Link href="/storefront" className="text-blue-600">Back</Link>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No products available
            </div>
          ) : (
            products.map((product: any) => (
              <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="bg-gray-200 h-48"></div>
                <div className="p-4">
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-gray-600">${product.price}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
