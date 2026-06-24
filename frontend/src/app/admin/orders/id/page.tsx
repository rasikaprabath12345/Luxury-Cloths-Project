"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
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
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold mb-4">Order #{orderId}</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-4">
        <p className="text-gray-600">Order details loading...</p>
      </div>

      <Link href="/admin/orders" className="text-blue-600 hover:underline">
        Back to Orders
      </Link>
    </div>
  );
}
