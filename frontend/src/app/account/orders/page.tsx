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
  orderDate?: string;
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
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Header */}
        <div className="h-28 bg-gradient-to-br from-[#1C1C1E] via-[#2C2C2E] to-[#1C1C1E] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23aa841c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#aa841c]/10 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Header Text */}
          <div className="relative z-10 px-8 pt-5">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#d4af37] uppercase block mb-0.5 font-montserrat">
              Shopping History
            </span>
            <h1 className="text-xl font-bold font-playfair tracking-tight text-white">Your Orders</h1>
            <p className="text-gray-500 mt-0.5 text-[10px] font-montserrat font-light">
              View, track, and manage your purchase history
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-5 flex items-center gap-2.5 font-montserrat text-sm text-red-800 font-medium animate-in">
              <span className="text-red-500">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#aa841c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xs font-montserrat text-gray-400 font-medium">Loading your orders...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-3 font-montserrat">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block border border-gray-100 rounded-xl p-4 hover:shadow-[0_6px_20px_rgba(0,0,0,0.03)] hover:border-[#aa841c]/25 transition-all duration-300 cursor-pointer hover:no-underline group bg-[#FAFAF9]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#1C1C1E] text-sm group-hover:text-[#aa841c] transition-colors duration-200">
                        Order #ORD-{order.id}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-light">
                        Placed on {new Date(order.orderDate || order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5">
                      <p className="text-base font-extrabold text-[#1C1C1E]">
                        Rs. {order.totalAmount?.toLocaleString() || "0.00"}
                      </p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide border uppercase ${
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
            <div className="text-center py-12 font-montserrat">
              <div className="text-4xl mb-4">🛍️</div>
              <p className="text-sm text-gray-400 font-medium">
                You haven't placed any orders yet.
              </p>
              <a
                href="/storefront/shop"
                className="mt-4 inline-block px-5 py-2 bg-[#1C1C1E] text-white rounded-xl hover:bg-[#aa841c] font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-md shadow-[#1C1C1E]/5"
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
