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
    fullName: (user as any)?.fullName || "",
    email: (user as any)?.email || "",
    phone: (user as any)?.phone || "",
    address: "",
    city: "",
    zipCode: "",
    country: "Sri Lanka",
  });

  const totalPrice = cartItems.reduce(
    (acc: number, item: any) => acc + item.price * (item.quantity || 1),
    0
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      alert("Please sign in to place an order.");
      router.push("/auth/login");
      return;
    }

    if (!(user as any).id) {
      alert("User ID not found. Please sign in again.");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        userId: (user as any).id,
        paymentMethod: "OnlinePayment",
        items: cartItems.map((item: any) => ({
          productVariantId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      const response = await axios.post(
        "http://localhost:5226/api/Orders",
        orderData
      );

      if (response.status === 200 || response.status === 201) {
        alert("Order placed successfully! 🎉");
        clearCart();
        router.push("/");
      }
    } catch (error: any) {
      console.error("Order submission error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Empty cart state ────────────────────────────────────────────── */
  if (cartItems.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#0a0a0a 0%,#111 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24,
          paddingTop: 100,
        }}
      >
        <div style={{ fontSize: 64 }}>🛒</div>
        <h2
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
          }}
        >
          Your cart is empty
        </h2>
        <p style={{ color: "#888", margin: 0 }}>
          Add items to your cart before checking out.
        </p>
        <button
          onClick={() => router.push("/storefront/product")}
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: "14px 36px",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  /* ── Main checkout ───────────────────────────────────────────────── */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0a0a0a 0%,#111 100%)",
        paddingTop: 100,
        paddingBottom: 60,
        fontFamily:
          "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <h1
          style={{
            color: "#fff",
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 40,
            letterSpacing: "-0.5px",
          }}
        >
          Checkout
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* ── Left: form + order list ───────────────────────────── */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 36,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Cart items */}
            <h2
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              Order Summary ({cartItems.length} item
              {cartItems.length !== 1 ? "s" : ""})
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxHeight: 280,
                overflowY: "auto",
                marginBottom: 36,
                paddingRight: 4,
              }}
            >
              {cartItems.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingBottom: 16,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <img
                    src={
                      item.imageUrl ||
                      item.image ||
                      "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600"
                    }
                    alt={item.name}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        color: "#fff",
                        fontWeight: 600,
                        margin: "0 0 4px",
                        fontSize: 15,
                      }}
                    >
                      {item.name}
                    </p>
                    <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
                      Qty: {item.quantity || 1}
                    </p>
                  </div>
                  <p
                    style={{
                      color: "#a78bfa",
                      fontWeight: 700,
                      fontSize: 16,
                      margin: 0,
                    }}
                  >
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Shipping form */}
            <h2
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              Shipping Information
            </h2>

            <form
              onSubmit={handleSubmitOrder}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {[
                { name: "fullName", placeholder: "Full Name", type: "text" },
                { name: "email", placeholder: "Email Address", type: "email" },
                { name: "phone", placeholder: "Phone Number", type: "tel" },
                { name: "city", placeholder: "City", type: "text" },
                { name: "zipCode", placeholder: "ZIP / Postal Code", type: "text" },
              ].map((field) => (
                <input
                  key={field.name}
                  type={field.type}
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "14px 18px",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              ))}

              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street Address"
                required
                rows={3}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "14px 18px",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading
                    ? "rgba(255,255,255,0.1)"
                    : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: loading ? "#666" : "#fff",
                  border: "none",
                  borderRadius: 14,
                  padding: "16px 0",
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: 8,
                  transition: "all 0.2s ease",
                  letterSpacing: "0.3px",
                }}
              >
                {loading ? "Processing…" : "Place Order 💳"}
              </button>
            </form>
          </div>

          {/* ── Right: price summary ──────────────────────────────── */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 28,
              backdropFilter: "blur(20px)",
              position: "sticky",
              top: 110,
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 24,
              }}
            >
              Price Breakdown
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Subtotal", value: `$${totalPrice.toFixed(2)}` },
                { label: "Shipping", value: "Free" },
                { label: "Tax", value: "$0.00" },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#999" }}>{row.label}</span>
                  <span style={{ color: "#ccc", fontWeight: 600 }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                marginTop: 18,
                paddingTop: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}
              >
                Total
              </span>
              <span
                style={{
                  color: "#a78bfa",
                  fontWeight: 800,
                  fontSize: 22,
                }}
              >
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <div
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 12,
                padding: "12px 16px",
                marginTop: 24,
                fontSize: 13,
                color: "#a78bfa",
                textAlign: "center",
              }}
            >
              🔒 Secure &amp; Encrypted Checkout
            </div>

            <button
              onClick={() => router.push("/storefront/product")}
              style={{
                width: "100%",
                marginTop: 16,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "12px 0",
                color: "#aaa",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
