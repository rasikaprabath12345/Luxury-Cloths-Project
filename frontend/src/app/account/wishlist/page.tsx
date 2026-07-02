"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: "1",
      name: "Premium Silk Dress",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1595777707802-52b966efb60f?w=400",
      inStock: true,
    },
    {
      id: "2",
      name: "Wool Blend Coat",
      price: 449.99,
      image: "https://images.unsplash.com/photo-1539533057440-7814bae87776?w=400",
      inStock: true,
    },
    {
      id: "3",
      name: "Leather Handbag",
      price: 399.99,
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
      inStock: false,
    },
  ]);

  const removeFromWishlist = (id: string) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
  };

  const totalPrice = wishlistItems.reduce((sum, item) => sum + item.price, 0);

  if (wishlistItems.length === 0) {
    return (
      <main className="min-h-screen bg-white pt-20 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8">
            Start adding your favorite items to create a wishlist. We'll help you keep track of items you love!
          </p>
          <Link
            href="/storefront/product"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            You have <span className="font-bold">{wishlistItems.length}</span> items saved
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wishlist Items */}
          <div className="lg:col-span-2 space-y-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p
                      className={`text-sm font-semibold ${
                        item.inStock ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">Rs. {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-center">
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    disabled={!item.inStock}
                    className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:text-gray-400 disabled:hover:bg-transparent"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-semibold text-gray-900">{wishlistItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In Stock:</span>
                  <span className="font-semibold text-green-600">
                    {wishlistItems.filter((i) => i.inStock).length}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-3">
                Add All to Cart
              </button>

              <Link
                href="/storefront/product"
                className="block text-center px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </Link>

              {/* Share Wishlist */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-3">Share Your Wishlist</p>
                <div className="flex gap-2">
                  <button className="flex-1 p-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-600 font-semibold text-sm transition-colors">
                    Facebook
                  </button>
                  <button className="flex-1 p-2 bg-sky-100 hover:bg-sky-200 rounded text-sky-600 font-semibold text-sm transition-colors">
                    Twitter
                  </button>
                  <button className="flex-1 p-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold text-sm transition-colors">
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
