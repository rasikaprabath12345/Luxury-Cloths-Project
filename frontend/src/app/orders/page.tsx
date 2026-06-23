"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// Order දත්ත වල හැඩය (TypeScript Type)
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
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // පසුකාලීනව මෙයට JWT Token එක ඇතුළත් කළ යුතුයි
        const response = await axios.get("http://localhost:5226/api/Orders", {
          withCredentials: true,
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Orders ලබා ගැනීමට නොහැකි විය:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">මගේ ඇණවුම් ඉතිහාසය</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500 text-lg">ඔබ තවමත් කිසිදු ඇණවුමක් සිදු කර නොමැත.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">ඇණවුම් අංකය</p>
                  <p className="text-sm font-medium text-gray-900">#Luxury-{order.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">දිනය</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">මුළු මුදල</p>
                  <p className="text-sm font-bold text-gray-900">Rs. {order.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === "Delivered" ? "bg-green-100 text-green-800" :
                    order.status === "Shipped" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="p-4 divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-xs text-gray-500">ප්‍රමාණය: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}