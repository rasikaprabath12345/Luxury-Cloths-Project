"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PaymentPage() {
  const { isAuthenticated } = useAuth();
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-4 pt-20 text-center">
        <p className="mb-4">Please log in to complete checkout</p>
        <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold mb-6">Payment</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Card Details</h2>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Card Number</label>
            <input 
              type="text" 
              placeholder="1234 5678 9012 3456"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expiry</label>
              <input 
                type="text" 
                placeholder="MM/YY"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CVV</label>
              <input 
                type="text" 
                placeholder="123"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold">
            Complete Payment
          </button>
        </form>

        <Link href="/storefront" className="mt-4 block text-center text-blue-600">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
