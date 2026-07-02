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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1C1C1E] px-8 py-10 text-white relative overflow-hidden border-b border-gray-800">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#aa841c]/5 rounded-full blur-3xl pointer-events-none"></div>
          <span className="text-[10px] font-bold tracking-widest text-[#aa841c] uppercase block mb-1.5 font-montserrat">
            Shopping History
          </span>
          <h1 className="text-3xl font-bold font-playfair tracking-tight">Your Orders</h1>
          <p className="text-gray-400 mt-1.5 text-xs font-montserrat font-light">
            View, track, and manage your purchase history
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-6 flex items-center gap-2.5 font-montserrat text-sm text-red-800 font-medium">
              <span className="text-red-500">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-[#aa841c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xs font-montserrat text-gray-400 font-medium">Loading your orders...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4 font-montserrat">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block border border-gray-100 rounded-xl p-5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.03)] hover:border-[#aa841c]/25 transition-all duration-300 cursor-pointer hover:no-underline group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#1C1C1E] text-base group-hover:text-[#aa841c] transition-colors duration-200">
                        Order #ORD-{order.id}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 font-light">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <p className="text-lg font-extrabold text-[#1C1C1E]">
                        Rs. {order.totalAmount?.toLocaleString() || "0.00"}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border uppercase ${
                        order.status?.toLowerCase() === "delivered"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : order.status?.toLowerCase() === "processing" || order.status?.toLowerCase() === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : order.status?.toLowerCase() === "cancelled"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-sky-50 text-sky-700 border-sky-100"
                      }`}>
                        {order.status || "PENDING"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 font-montserrat">
              <div className="text-4xl mb-4">🛍️</div>
              <p className="text-sm text-gray-400 font-medium">
                You haven't placed any orders yet.
              </p>
              <a
                href="/storefront/shop"
                className="mt-6 inline-block px-6 py-2.5 bg-[#1C1C1E] text-white rounded-xl hover:bg-[#aa841c] font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-md shadow-[#1C1C1E]/5"
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
