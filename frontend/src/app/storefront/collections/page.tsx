"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categoriesAPI } from "@/lib/api";

const CATEGORY_IMAGES: Record<string, string> = {
  women: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800",
  men: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=800",
  children: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800",
  accessories: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
  shoes: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
  watches: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
  shirts: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
  pants: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800";

export default function CollectionsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAllCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen bg-white pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Collections
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse our curated collections of luxury clothing and accessories.
          </p>
        </div>

        {/* Featured Collection */}
        <div className="mb-16 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 sm:p-12 items-center">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">
                Trending Now
              </span>
              <h2 className="text-3xl font-black text-gray-900 mb-3">Summer 2026</h2>
              <p className="text-gray-600 text-lg mb-6">
                Discover our latest summer collection featuring vibrant colors and breathable fabrics perfect for warm weather.
              </p>
              <Link
                href="/storefront/shop?filter=new"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Shop Summer Collection
              </Link>
            </div>
            <div className="relative h-64 sm:h-80 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1595777707802-52b966efb60f?w=500"
                alt="Summer Collection"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-sm">Loading collections...</p>
          </div>
        ) : (
          <div>
            {/* Collections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => {
                const slug = cat.slug || cat.name.toLowerCase();
                const image = CATEGORY_IMAGES[slug] || DEFAULT_IMAGE;

                return (
                  <Link
                    key={cat.id}
                    href={`/storefront/shop?category=${slug}`}
                    className="group"
                  >
                    <div className="relative h-64 sm:h-72 rounded-lg overflow-hidden mb-4 cursor-pointer shadow-sm group-hover:shadow-md transition-shadow">
                      <Image
                        src={image}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {cat.name} Collection
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">Premium {cat.name.toLowerCase()} wear items</p>
                    <p className="text-sm font-semibold text-blue-600">View Collection →</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 sm:p-12 text-center border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Browse all products or use our advanced search and filters to find exactly what you want.
          </p>
          <Link
            href="/storefront/shop"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </main>
  );
}
