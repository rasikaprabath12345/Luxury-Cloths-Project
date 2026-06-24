"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CategoryContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("name") || "Products";

  return (
    <div className="max-w-6xl mx-auto p-4 pt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{category}</h1>
        <Link href="/storefront/shop" className="text-blue-600">Back to Shop</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-full text-center py-12 text-gray-500">
          No products in this category
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CategoryContent />
    </Suspense>
  );
}

