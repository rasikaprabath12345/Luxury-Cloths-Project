"use client";

import Link from "next/link";
import Image from "next/image";

const COLLECTIONS = [
  {
    id: 1,
    name: "New Arrivals",
    slug: "new-arrivals",
    image: "https://images.unsplash.com/photo-1595777707802-52b966efb60f?w=500",
    count: 48,
    description: "Fresh styles just in stock"
  },
  {
    id: 2,
    name: "Best Sellers",
    slug: "best-sellers",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500",
    count: 32,
    description: "Customer favorites"
  },
  {
    id: 3,
    name: "Dresses",
    slug: "dresses",
    image: "https://images.unsplash.com/photo-1595777707802-52b966efb60f?w=500",
    count: 64,
    description: "Elegant dresses for every occasion"
  },
  {
    id: 4,
    name: "Tops & Shirts",
    slug: "tops",
    image: "https://images.unsplash.com/photo-1548346328-9e8e8b68ae6b?w=500",
    count: 56,
    description: "Stylish tops and shirts"
  },
  {
    id: 5,
    name: "Bottoms",
    slug: "bottoms",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
    count: 44,
    description: "Perfect pants and skirts"
  },
  {
    id: 6,
    name: "Outerwear",
    slug: "outerwear",
    image: "https://images.unsplash.com/photo-1539533057440-7814bae87776?w=500",
    count: 28,
    description: "Jackets and coats"
  },
  {
    id: 7,
    name: "Accessories",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
    count: 92,
    description: "Complete your look"
  },
  {
    id: 8,
    name: "Sale",
    slug: "sale",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500",
    count: 156,
    description: "Up to 50% off",
    badge: "HOT"
  }
];

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
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
              <h2 className="text-3xl font-black text-gray-900 mb-3">Summer 2026</h2>
              <p className="text-gray-600 text-lg mb-6">
                Discover our latest summer collection featuring vibrant colors and breathable fabrics perfect for warm weather.
              </p>
              <Link
                href="/storefront/product"
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

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.id}
              href={`/storefront/product?collection=${collection.slug}`}
              className="group"
            >
              <div className="relative h-64 sm:h-72 rounded-lg overflow-hidden mb-4 cursor-pointer">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {collection.badge && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {collection.badge}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {collection.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
              <p className="text-sm font-semibold text-gray-500">{collection.count} items</p>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 sm:p-12 text-center border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Browse all products or use our advanced search and filters to find exactly what you want.
          </p>
          <Link
            href="/storefront/product"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </main>
  );
}
