"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") {
    return <div className="p-4">Access denied. Admin only.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pt-20">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/products"
          className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition"
        >
          <h2 className="text-xl font-bold text-blue-900">Products</h2>
          <p className="text-blue-700">Manage products</p>
        </Link>

        <Link
          href="/admin/orders"
          className="p-6 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition"
        >
          <h2 className="text-xl font-bold text-green-900">Orders</h2>
          <p className="text-green-700">View orders</p>
        </Link>

        <Link
          href="/admin/users"
          className="p-6 bg-purple-50 border border-purple-200 rounded-lg hover:shadow-md transition"
        >
          <h2 className="text-xl font-bold text-purple-900">Users</h2>
          <p className="text-purple-700">Manage users</p>
        </Link>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Welcome, {user?.fullName}</h2>
        <p className="text-gray-600">Use the navigation above to manage your store.</p>
      </div>
    </div>
  );
}
