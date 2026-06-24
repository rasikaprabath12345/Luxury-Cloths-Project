"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    zipCode: "",
    country: "Sri Lanka",
  });

  const totalPrice = cartItems.reduce(
    (acc, item: any) => acc + item.price * (item.quantity || 1),
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!user) {
      alert("Please sign in to place an order");
      router.push("/auth/login");
      return;
    }

    if (!user.id) {
      alert("User ID not found. Please sign in again.");
      return;
    }

    setLoading(true);

    try {
      // Prepare order data matching backend API
      const orderData = {
        userId: user.id,
        paymentMethod: "OnlinePayment",
        items: cartItems.map((item: any) => ({
          productVariantId: item.id, // Assuming item.id is the productVariantId
          quantity: item.quantity || 1,
        })),
      };

      console.log("Submitting order with data:", orderData);

      // Submit order to backend API
      const response = await axios.post(
        "http://localhost:5226/api/Orders",
        orderData
      );

      console.log("Order response:", response);

      if (response.status === 200) {
        alert("Order placed successfully! 🎉");
        clearCart();
        router.push("/orders");
      }
    } catch (error: any) {
      console.error("Order submission error:", error);
      console.error("Error URL:", error.config?.url);
      console.error("Error status:", error.response?.status);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="pt-20 bg-white text-gray-900 min-h-screen py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-12">Checkout</h1>
          <p className="text-lg text-gray-600 mb-8">Your cart is empty. Add items to proceed with checkout.</p>
          <button
            onClick={() => router.push("/storefront/product")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-white text-gray-900 min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">Order Summary</h2>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b border-gray-200"
                  >
                    <img
                      src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity || 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${(item.price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-6 mt-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600"
                    />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street Address"
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Zip Code"
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition"
                >
                  {loading ? "Processing..." : "Place Order 💳"}
                </button>
              </form>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold mb-6">Price Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>$0.00</span>
              </div>
              <div className="border-t border-gray-300 pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/storefront/product")}
              className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-xl transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
