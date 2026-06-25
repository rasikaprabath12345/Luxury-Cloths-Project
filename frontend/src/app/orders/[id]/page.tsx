"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI } from "@/lib/api";

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  shippingAddress?: string;
  phoneNumber?: string;
  userEmail?: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user && orderId) {
      const fetchOrder = async () => {
        try {
          const response = await ordersAPI.getOrderById(parseInt(orderId));
          setOrder(response.data);
        } catch (error: any) {
          console.error("Failed to fetch order:", error);
          setError("Failed to load order details");
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [user, authLoading, orderId, router]);

  if (authLoading || loading) {
    return (
      <div className="pt-20 min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !order) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link
            href="/orders"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <Link href="/orders" className="text-blue-600 hover:text-blue-700 font-semibold mb-6 inline-block">
          ← Back to Orders
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600 uppercase font-semibold">Order Number</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">#ORD-{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 uppercase font-semibold">Order Date</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                {new Date(order.orderDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 uppercase font-semibold">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">${order.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 uppercase font-semibold">Status</p>
              <span
                className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold ${
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "Shipped"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "Processing"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: <span className="font-medium">{item.quantity}</span> × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-3">
                {order.userEmail && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900 font-medium">{order.userEmail}</p>
                  </div>
                )}
                {order.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900 font-medium">{order.phoneNumber}</p>
                  </div>
                )}
                {order.shippingAddress && (
                  <div>
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="text-gray-900 font-medium">{order.shippingAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/orders"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg text-center transition"
          >
            Back to Orders
          </Link>
          <Link
            href="/storefront/product"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-center transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
