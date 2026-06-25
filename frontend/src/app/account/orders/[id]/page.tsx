"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI } from "@/lib/api";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isAuthenticated && orderId) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const response = await ordersAPI.getOrderById(parseInt(orderId));
          setOrder(response.data);
        } catch (err: any) {
          console.error("Error fetching order:", err);
          setError(err.response?.data || "Order details not found or access denied.");
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [orderId, isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-24 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-2"></div>
        <span>Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-2xl mx-auto shadow-sm">
        <div className="text-red-500 text-3xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load order</h2>
        <p className="text-gray-600 mb-6">{error || "The requested order could not be retrieved."}</p>
        <Link href="/account/orders" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-zinc-800 px-6 py-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Order Details</span>
            <h1 className="text-3xl font-black mt-1">Order #ORD-{order.id}</h1>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            order.status === "Delivered"
              ? "bg-green-500 text-white"
              : order.status === "Shipped"
              ? "bg-blue-500 text-white"
              : order.status === "Processing"
              ? "bg-yellow-500 text-black"
              : "bg-zinc-600 text-white"
          }`}>
            {order.status?.toUpperCase() || "PENDING"}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Order Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order Date</p>
              <p className="font-bold text-gray-900 mt-1">
                {new Date(order.orderDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Payment Method</p>
              <p className="font-bold text-gray-900 mt-1">{order.paymentMethod || "Bank Transfer"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Value</p>
              <p className="font-extrabold text-blue-600 mt-1 text-xl">Rs. {order.totalAmount?.toLocaleString()}</p>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ordered Apparel</h2>
            <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {order.items && order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{item.productName}</h4>
                    <p className="text-sm text-gray-500 mt-1">Quantity: <span className="font-bold text-gray-700">{item.quantity}</span></p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-extrabold text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Rs. {item.price.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-between items-center">
          <Link href="/account/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
