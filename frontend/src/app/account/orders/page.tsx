"use client";
import { useState, useEffect } from "react";
import { ordersAPI } from "@/lib/api";
import Link from "next/link";

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await ordersAPI.getUserOrders();
        setOrders(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <p className="text-blue-100 mt-2">View and track your orders</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm font-medium text-red-800">{error}</div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading your orders...</div>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-blue-500 hover:no-underline"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order #ORD-{order.id}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {order.items.length} item(s)
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Rs. {order.totalAmount?.toLocaleString() || "0.00"}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                        order.status?.toLowerCase() === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status?.toLowerCase() === "processing" || order.status?.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status?.toLowerCase() === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {order.status?.toUpperCase() || "PENDING"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-600">
                You haven't placed any orders yet.
              </div>
              <a
                href="/storefront"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Shopping
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
