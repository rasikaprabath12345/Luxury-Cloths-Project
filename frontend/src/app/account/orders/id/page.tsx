"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Fetch order details from backend
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("luxury_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isAuthenticated]);

  if (loading) {
    return <div className="p-4">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="p-4">
        <p>Order not found</p>
        <Link href="/account/orders">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600">Order Date</p>
          <p className="font-semibold">{new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Status</p>
          <p className="font-semibold">{order.status}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h2 className="text-xl font-bold mb-2">Items</h2>
        <div className="space-y-2">
          {/* Display order items */}
          <p>Total: ${order.totalAmount?.toFixed(2)}</p>
        </div>
      </div>

      <Link href="/account/orders" className="mt-4 text-blue-600 hover:underline">
        Back to Orders
      </Link>
    </div>
  );
}
