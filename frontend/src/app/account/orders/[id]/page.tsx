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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#aa841c] mr-3"></div>
        <span className="font-montserrat text-sm font-medium">Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <div className="text-[#aa841c] text-4xl mb-4 font-montserrat">⚠️</div>
        <h2 className="text-xl font-bold font-playfair text-[#1C1C1E] mb-3">Failed to load order</h2>
        <p className="text-sm font-montserrat text-gray-500 mb-8 font-light">{error || "The requested order could not be retrieved."}</p>
        <Link
          href="/account/orders"
          className="inline-block bg-[#1C1C1E] hover:bg-[#aa841c] text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition duration-300 font-montserrat shadow-md shadow-[#1C1C1E]/5"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1C1C1E] px-8 py-10 text-white relative overflow-hidden border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#aa841c]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#aa841c] uppercase block mb-1 font-montserrat">Order Details</span>
            <h1 className="text-3xl font-bold font-playfair tracking-tight">Order #ORD-{order.id}</h1>
          </div>
          <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide border uppercase font-montserrat ${
            order.status?.toLowerCase() === "delivered"
              ? "bg-green-50/10 text-green-400 border-green-500/20"
              : order.status?.toLowerCase() === "processing" || order.status?.toLowerCase() === "pending"
              ? "bg-amber-50/10 text-amber-400 border-amber-500/20"
              : order.status?.toLowerCase() === "cancelled"
              ? "bg-red-50/10 text-red-400 border-red-500/20"
              : "bg-sky-50/10 text-sky-400 border-sky-500/20"
          }`}>
            {order.status || "PENDING"}
          </span>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10 font-montserrat">
          {/* Order Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order Date</p>
              <p className="font-semibold text-[#1C1C1E] text-base mt-2">
                {new Date(order.createdAt || order.orderDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Mode</p>
              <p className="font-semibold text-[#1C1C1E] text-base mt-2">{order.paymentMethod || "Bank Transfer"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Value</p>
              <p className="font-extrabold text-[#aa841c] text-xl mt-2">Rs. {order.totalAmount?.toLocaleString()}</p>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h2 className="text-base font-bold font-playfair text-[#1C1C1E] mb-5 tracking-wide">Ordered Apparel</h2>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)] bg-[#F9F8F6]/20">
              {order.items && order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-semibold text-[#1C1C1E] text-base">{item.productName}</h4>
                    <p className="text-xs text-gray-400 mt-1 font-light">Quantity: <span className="font-bold text-[#aa841c]">{item.quantity}</span></p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-extrabold text-[#1C1C1E] text-base">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-light">Rs. {item.price.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-[#F9F8F6]/50 border-t border-gray-100 px-8 py-5 flex justify-between items-center font-montserrat">
          <Link href="/account/orders" className="text-xs font-bold text-[#aa841c] hover:underline flex items-center gap-1.5 transition-colors duration-200">
            ← Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
