"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { productsAPI } from "@/lib/api";
import { useCart } from "@/context/CartContext";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600";

function CategoryContent() {
  const searchParams = useSearchParams();
  const categoryName = searchParams.get("name") || "Products";
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAllProducts();
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product: any) => 
    product.category?.name?.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pt-24 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{categoryName}</h1>
          <p className="text-gray-500 mt-2">Explore our premium selection under {categoryName}.</p>
        </div>
        <Link href="/storefront/shop" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Back to Shop
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm">Loading category products...</p>
        </div>
      ) : (
        <div>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <span className="text-4xl">🛍️</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">No products found</h3>
              <p className="text-gray-500 mt-2">There are currently no products available in the "{categoryName}" category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product: any) => {
                const imgUrl = product.imageUrl || product.image || PLACEHOLDER_IMG;
                const hasDiscount = product.discount > 0;
                const finalPrice = hasDiscount 
                  ? product.price - (product.price * product.discount / 100) 
                  : product.price;

                return (
                  <div key={product.id} className="group relative flex flex-col justify-between bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                    <Link href={`/storefront/product/${product.slug}`} className="cursor-pointer">
                      <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
                        <img 
                          src={imgUrl} 
                          alt={product.name} 
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        {hasDiscount && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow">
                            {product.discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-grow">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
                          {product.category?.name || "Apparel"}
                        </span>
                        <h3 className="mt-2 text-base font-bold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-gray-950">
                            Rs. {finalPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                              Rs. {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="px-5 pb-5 pt-0">
                      <button 
                        onClick={() => {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: finalPrice,
                            imageUrl: imgUrl,
                            description: product.description,
                          });
                          alert(`${product.name} added to cart! 🛒`);
                        }}
                        className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
                      >
                        Add to Bag 🛍️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading category...</div>}>
      <CategoryContent />
    </Suspense>
  );
}
