"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminAddProductPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return <div className="p-4 text-center text-gray-500">Redirecting...</div>;
  }

  if (user?.role !== "admin") {
    return <div className="p-4 text-center text-red-600">Access denied. Admin only.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>

      <form className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input type="text" className="w-full border rounded px-3 py-2" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea className="w-full border rounded px-3 py-2" rows={4}></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Price</label>
          <input type="number" step="0.01" className="w-full border rounded px-3 py-2" />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Add Product</button>
          <Link href="/admin/products" className="border px-6 py-2 rounded">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
