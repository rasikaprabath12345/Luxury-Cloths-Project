"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Link from "next/link";

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
      <div className="ch-empty-page">
        <div className="ch-empty-icon">🛒</div>
        <h2 className="ch-empty-title">Your cart is empty</h2>
        <p className="ch-empty-sub">Add items to your cart before checking out.</p>
        <button
          onClick={() => router.push("/storefront/product")}
          className="ch-empty-btn"
        >
          Continue Shopping
        </button>

        <style>{`
          .ch-empty-page {
            min-height: 100vh;
            background: #f5f5f7;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 20px;
            padding: 120px 24px 60px;
            text-align: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .ch-empty-icon {
            font-size: 64px;
            margin-bottom: 8px;
          }
          .ch-empty-title {
            color: #1d1d1f;
            font-size: 26px;
            font-weight: 800;
            margin: 0;
          }
          .ch-empty-sub {
            color: #666;
            margin: 0;
            font-size: 15px;
          }
          .ch-empty-btn {
            background: linear-gradient(135deg, #d4af37, #aa841c);
            color: #fff;
            border: none;
            border-radius: 14px;
            padding: 14px 36px;
            fontWeight: 800;
            fontSize: 15px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
            transition: all 0.25s ease;
          }
          .ch-empty-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(212, 175, 55, 0.35);
          }
        `}</style>
      </div>
    );
  }

  /* ── Main checkout ───────────────────────────────────────────────── */
  return (
    <div className="ch-page">
      {/* ── HERO BANNER ── */}
      <div className="ch-hero">
        <div className="ch-hero-inner">
          <p className="ch-hero-eyebrow">Secure Checkout</p>
          <h1 className="ch-hero-title">Finalize Order</h1>
          <div className="ch-breadcrumb">
            <Link href="/" className="ch-breadcrumb-link">Home</Link>
            <span className="ch-breadcrumb-sep">›</span>
            <Link href="/storefront/cart" className="ch-breadcrumb-link">Cart</Link>
            <span className="ch-breadcrumb-sep">›</span>
            <span className="ch-breadcrumb-current">Checkout</span>
          </div>
        </div>
      </div>

      <div className="ch-container">
        <div className="ch-grid">
          {/* ── Left: form + order list ───────────────────────────── */}
          <div className="ch-left-card">
            {/* Cart items */}
            <div className="ch-section-header">
              <h2 className="ch-section-title">Order Items</h2>
              <span className="ch-item-badge">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="ch-items-list">
              {cartItems.map((item: any) => (
                <div key={item.id} className="ch-item-row">
                  <img
                    src={
                      item.imageUrl ||
                      item.image ||
                      "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600"
                    }
                    alt={item.name}
                    className="ch-item-img"
                  />
                  <div className="ch-item-details">
                    <p className="ch-item-name">{item.name}</p>
                    <p className="ch-item-qty">Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="ch-item-total-price">
                    Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Shipping form */}
            <h2 className="ch-section-title" style={{ marginTop: 32, marginBottom: 20 }}>
              Shipping Address
            </h2>

            <form onSubmit={handleSubmitOrder} className="ch-form">
              <div className="ch-input-grid">
                {[
                  { name: "fullName", placeholder: "Full Name", type: "text" },
                  { name: "email", placeholder: "Email Address", type: "email" },
                  { name: "phone", placeholder: "Phone Number", type: "tel" },
                  { name: "city", placeholder: "City", type: "text" },
                  { name: "zipCode", placeholder: "ZIP / Postal Code", type: "text" },
                ].map((field) => (
                  <div key={field.name} className="ch-input-field">
                    <input
                      type={field.type}
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      required
                      className="ch-input"
                    />
                  </div>
                ))}
              </div>

              <div className="ch-input-field" style={{ marginTop: 16 }}>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                  required
                  rows={3}
                  className="ch-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ch-submit-btn"
              >
                {loading ? "Processing…" : "Place Order 💳"}
              </button>
            </form>
          </div>

          {/* ── Right: price summary ──────────────────────────────── */}
          <div className="ch-right-sidebar">
            <div className="ch-summary-card">
              <h2 className="ch-summary-title">Summary Breakdown</h2>

              <div className="ch-summary-rows">
                {[
                  { label: "Subtotal", value: `Rs. ${totalPrice.toLocaleString()}` },
                  { label: "Shipping", value: "FREE" },
                  { label: "Tax & Service", value: "Rs. 0" },
                ].map((row) => (
                  <div key={row.label} className="ch-summary-row">
                    <span className="label">{row.label}</span>
                    <span className={`value ${row.value === "FREE" ? "free-tag" : ""}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="ch-summary-divider" />

              <div className="ch-total-row">
                <span className="total-label">Total Amount</span>
                <span className="total-value">Rs. {totalPrice.toLocaleString()}</span>
              </div>

              <div className="ch-secure-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure 256-bit SSL checkout
              </div>

              <button
                onClick={() => router.push("/storefront/shop")}
                className="ch-back-btn"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        .ch-page {
          min-height: 100vh;
          background: #f5f5f7;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1d1d1f;
          padding-bottom: 80px;
        }

        /* ── HERO BANNER ── */
        .ch-hero {
          position: relative;
          padding: 100px 32px 50px;
          background: linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        .ch-hero::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }
        .ch-hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .ch-hero-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #aa841c;
          margin: 0 0 12px;
        }
        .ch-hero-title {
          font-size: clamp(32px, 4vw, 46px);
          font-weight: 800;
          letter-spacing: -1px;
          color: #1d1d1f;
          margin: 0 0 16px;
          line-height: 1.1;
        }
        .ch-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .ch-breadcrumb-link {
          color: #888;
          text-decoration: none;
          transition: color 0.2s;
        }
        .ch-breadcrumb-link:hover { color: #aa841c; }
        .ch-breadcrumb-sep { color: #ccc; }
        .ch-breadcrumb-current { color: #666; }

        /* ── MAIN GRID ── */
        .ch-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px 0;
        }
        .ch-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .ch-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── LEFT CONTAINER ── */
        .ch-left-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }
        @media (max-width: 600px) {
          .ch-left-card {
            padding: 24px;
          }
        }
        .ch-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: 12px;
        }
        .ch-section-title {
          font-size: 18px;
          font-weight: 800;
          color: #1d1d1f;
          margin: 0;
        }
        .ch-item-badge {
          font-size: 12px;
          font-weight: 700;
          color: #aa841c;
          background: rgba(212, 175, 55, 0.08);
          padding: 3px 10px;
          border-radius: 99px;
        }

        /* Cart List */
        .ch-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .ch-items-list::-webkit-scrollbar {
          width: 4px;
        }
        .ch-items-list::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 10px;
        }
        .ch-item-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .ch-item-img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .ch-item-details {
          flex: 1;
          min-width: 0;
        }
        .ch-item-name {
          color: #1d1d1f;
          font-weight: 700;
          margin: 0 0 4px;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ch-item-qty {
          color: #777;
          font-size: 12px;
          margin: 0;
        }
        .ch-item-total-price {
          color: #1d1d1f;
          font-weight: 800;
          font-size: 15px;
          margin: 0;
        }

        /* Forms */
        .ch-form {
          display: flex;
          flex-direction: column;
        }
        .ch-input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .ch-input-grid {
            grid-template-columns: 1fr;
          }
        }
        .ch-input-field {
          width: 100%;
        }
        .ch-input {
          background: #f9f9fb;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          padding: 14px 18px;
          color: #1d1d1f;
          font-size: 14px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .ch-input:focus {
          border-color: rgba(212, 175, 55, 0.4);
        }
        .ch-textarea {
          background: #f9f9fb;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          padding: 14px 18px;
          color: #1d1d1f;
          font-size: 14px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .ch-textarea:focus {
          border-color: rgba(212, 175, 55, 0.4);
        }

        .ch-submit-btn {
          background: linear-gradient(135deg, #1d1d1f, #000000);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 16px 0;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          margin-top: 24px;
          transition: all 0.25s ease;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .ch-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
        .ch-submit-btn:disabled {
          background: rgba(0, 0, 0, 0.05);
          color: #999;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* ── RIGHT CONTAINER ── */
        .ch-right-sidebar {
          position: sticky;
          top: 100px;
        }
        .ch-summary-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }
        .ch-summary-title {
          font-size: 17px;
          font-weight: 800;
          color: #1d1d1f;
          margin: 0 0 20px;
        }
        .ch-summary-rows {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ch-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
        }
        .ch-summary-row .label {
          color: #777;
        }
        .ch-summary-row .value {
          color: #1d1d1f;
          font-weight: 600;
        }
        .ch-summary-row .value.free-tag {
          color: #15803d;
          font-weight: 700;
          background: rgba(22, 163, 74, 0.08);
          padding: 1px 7px;
          border-radius: 5px;
        }
        .ch-summary-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.05);
          margin: 16px 0;
        }
        .ch-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .ch-total-row .total-label {
          font-size: 15px;
          font-weight: 800;
          color: #1d1d1f;
        }
        .ch-total-row .total-value {
          font-size: 22px;
          font-weight: 800;
          color: #aa841c;
        }
        .ch-secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 10px;
          padding: 10px;
          font-size: 12px;
          color: #aa841c;
          font-weight: 600;
        }
        .ch-back-btn {
          width: 100%;
          margin-top: 14px;
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          padding: 12px 0;
          color: #666;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ch-back-btn:hover {
          background: rgba(0, 0, 0, 0.02);
          color: #aa841c;
          border-color: rgba(212, 175, 55, 0.2);
        }
        
        @media (max-width: 600px) {
          .ch-container {
            padding: 20px 16px 0;
          }
          .ch-left-card {
            padding: 20px;
            border-radius: 20px;
          }
          .ch-input-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .ch-item-row {
            gap: 12px;
            padding-bottom: 12px;
          }
          .ch-item-img {
            width: 50px;
            height: 50px;
            border-radius: 8px;
          }
          .ch-item-name {
            font-size: 13px;
          }
          .ch-item-total-price {
            font-size: 13px;
          }
          .ch-summary-card {
            padding: 20px;
            border-radius: 20px;
          }
          .ch-total-row .total-value {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
