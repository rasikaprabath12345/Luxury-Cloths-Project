"use client";

import Link from "next/link";

export default function StorefrontPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 pt-20">
      <h1 className="text-3xl font-bold mb-4">Welcome to Luxury Clothing</h1>
      <p className="text-gray-600 mb-8">Browse our exclusive collection of luxury clothing items.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/storefront/product"
          className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition"
        >
          <h2 className="text-xl font-bold">All Products</h2>
          <p className="text-gray-600">Browse all available items</p>
        </Link>

        <Link
          href="/storefront/collections"
          className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition"
        >
          <h2 className="text-xl font-bold">Collections</h2>
          <p className="text-gray-600">Browse by collection</p>
        </Link>

        <Link
          href="/storefront/blog"
          className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition"
        >
          <h2 className="text-xl font-bold">Blog</h2>
          <p className="text-gray-600">Read latest updates</p>
        </Link>
      </div>
    </div>
  );
}
