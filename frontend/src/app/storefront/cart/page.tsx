"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CartItem {
  id: number;
  variantId: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("BankTransfer");
  const [loading, setLoading] = useState<boolean>(true);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem("luxury_cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      const dummyItems: CartItem[] = [
        { id: 1, variantId: 1, name: "Premium Luxury Silk Dress", price: 12500, quantity: 1, size: "M", color: "Black", image: "https://images.unsplash.com/photo-1566479179817-97d2d10a5bbe?q=80&w=600&auto=format&fit=crop" },
        { id: 2, variantId: 2, name: "Classic Slim Fit Designer Shirt", price: 8500, quantity: 2, size: "L", color: "White", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop" },
      ];
      setCartItems(dummyItems);
      localStorage.setItem("luxury_cart", JSON.stringify(dummyItems));
    }
    setLoading(false);
  }, []);

  const updateQuantity = (variantId: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = cartItems.map(item =>
      item.variantId === variantId ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    localStorage.setItem("luxury_cart", JSON.stringify(updated));
  };

  const removeItem = (variantId: number) => {
    setRemovingId(variantId);
    setTimeout(() => {
      const filtered = cartItems.filter(item => item.variantId !== variantId);
      setCartItems(filtered);
      localStorage.setItem("luxury_cart", JSON.stringify(filtered));
      setRemovingId(null);
    }, 380);
  };

  const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = couponApplied ? Math.round(subTotal * 0.1) : 0;
  const shippingFee = cartItems.length > 0 ? 500 : 0;
  const totalAmount = subTotal - discount + shippingFee;
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === "LUXURY10") {
      setCouponApplied(true);
    } else {
      alert("Invalid coupon code.");
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    const savedUserId = localStorage.getItem("luxury_userId");
    if (!savedUserId) {
      alert("Please log in to place an order.");
      router.push("/auth");
      return;
    }
    setIsOrdering(true);
    try {
      const orderData = {
        userId: parseInt(savedUserId),
        paymentMethod,
        items: cartItems.map(item => ({
          productVariantId: item.variantId,
          quantity: item.quantity,
        })),
      };
      const response = await axios.post("http://localhost:5226/api/Orders", orderData);
      if (response.status === 200) {
        alert("🎉 " + response.data.message);
        setCartItems([]);
        localStorage.removeItem("luxury_cart");
        router.push("/orders");
      }
    } catch (error: any) {
      console.error("Order failed:", error);
      alert("Order failed. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="cp-loading">
        <div className="cp-spinner" />
      </div>
    );
  }

  return (
    <div className="cp-page">
      {/* ── HERO BANNER ── */}
      <div className="cp-hero">
        <div className="cp-hero-inner">
          <p className="cp-hero-eyebrow">Shopping Cart</p>
          <h1 className="cp-hero-title">Your Selections</h1>
          <div className="cp-breadcrumb">
            <Link href="/" className="cp-breadcrumb-link">Home</Link>
            <span className="cp-breadcrumb-sep">›</span>
            <span className="cp-breadcrumb-current">Cart</span>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="cp-main">
        {cartItems.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <h2 className="cp-empty-title">Your cart is empty</h2>
            <p className="cp-empty-sub">Looks like you haven't added any luxury pieces yet.</p>
            <Link href="/storefront/shop" className="cp-empty-btn">Explore Collection →</Link>
          </div>
        ) : (
          <div className="cp-grid">
            {/* ── LEFT: ITEMS ── */}
            <div className="cp-left">
              <div className="cp-section-header">
                <h2 className="cp-section-title">Cart Items</h2>
                <span className="cp-item-count">{totalItems} {totalItems === 1 ? "item" : "items"}</span>
              </div>

              <div className="cp-items-list">
                {cartItems.map((item) => {
                  const img = item.image || PLACEHOLDER_IMG;
                  const isRemoving = removingId === item.variantId;
                  return (
                    <div
                      key={item.variantId}
                      className={`cp-item ${isRemoving ? "cp-item-exit" : ""}`}
                    >
                      {/* Image */}
                      <div className="cp-item-img-wrap">
                        <img src={img} alt={item.name} className="cp-item-img" />
                        <span className="cp-item-qty-badge">{item.quantity}</span>
                      </div>

                      {/* Info */}
                      <div className="cp-item-info">
                        <div className="cp-item-top">
                          <div>
                            <p className="cp-item-category">Luxury Collection</p>
                            <h3 className="cp-item-name">{item.name}</h3>
                            <div className="cp-item-meta">
                              {item.size && <span className="cp-item-tag">Size: {item.size}</span>}
                              {item.color && <span className="cp-item-tag">Color: {item.color}</span>}
                            </div>
                          </div>
                          <button
                            className="cp-remove-btn"
                            onClick={() => removeItem(item.variantId)}
                            aria-label="Remove item"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>

                        <div className="cp-item-bottom">
                          {/* Qty Controls */}
                          <div className="cp-qty-wrap">
                            <button className="cp-qty-btn" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>−</button>
                            <span className="cp-qty-num">{item.quantity}</span>
                            <button className="cp-qty-btn" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                          </div>

                          {/* Price */}
                          <div className="cp-item-price-wrap">
                            <p className="cp-item-unit">Rs. {item.price.toLocaleString()} × {item.quantity}</p>
                            <p className="cp-item-total">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping */}
              <Link href="/storefront/shop" className="cp-continue">
                ← Continue Shopping
              </Link>
            </div>

            {/* ── RIGHT: SUMMARY ── */}
            <div className="cp-right">
              {/* Order Summary Card */}
              <div className="cp-summary-card">
                <h2 className="cp-summary-title">Order Summary</h2>

                <div className="cp-summary-rows">
                  <div className="cp-summary-row">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>Rs. {subTotal.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="cp-summary-row cp-discount-row">
                      <span>Discount (LUXURY10)</span>
                      <span>− Rs. {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="cp-summary-row">
                    <span>Delivery</span>
                    <span className="cp-free-tag">Rs. {shippingFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="cp-summary-divider" />

                <div className="cp-total-row">
                  <span className="cp-total-label">Total</span>
                  <span className="cp-total-value">Rs. {totalAmount.toLocaleString()}</span>
                </div>

                {/* Coupon */}
                <div className="cp-coupon-wrap">
                  <input
                    className="cp-coupon-input"
                    placeholder="Promo code (e.g. LUXURY10)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    disabled={couponApplied}
                  />
                  <button
                    className="cp-coupon-btn"
                    onClick={handleApplyCoupon}
                    disabled={couponApplied}
                  >
                    {couponApplied ? "✓" : "Apply"}
                  </button>
                </div>

                {/* Payment Method */}
                <div className="cp-payment-section">
                  <p className="cp-payment-label">Payment Method</p>
                  <div className="cp-payment-options">
                    {[
                      { value: "BankTransfer", label: "Bank Transfer", sub: "Upload slip after order" },
                      { value: "COD", label: "Cash on Delivery", sub: "Pay when you receive" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`cp-payment-option ${paymentMethod === opt.value ? "cp-payment-active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={opt.value}
                          checked={paymentMethod === opt.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="cp-radio"
                        />
                        <div className="cp-payment-icon">
                          {opt.value === "BankTransfer" ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <rect x="2" y="5" width="20" height="14" rx="2" />
                              <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="cp-payment-name">{opt.label}</p>
                          <p className="cp-payment-sub">{opt.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  className="cp-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isOrdering || cartItems.length === 0}
                >
                  {isOrdering ? (
                    <span className="cp-order-loading">
                      <span className="cp-order-spinner" />
                      Processing…
                    </span>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Trust badges */}
                <div className="cp-trust-row">
                  {["🔒 Secure Payment", "🚚 Fast Delivery", "↩ Easy Returns"].map((badge) => (
                    <span key={badge} className="cp-trust-badge">{badge}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .cp-page {
          font-family: 'Inter', sans-serif;
          background: #f5f5f7;
          min-height: 100vh;
          color: #1d1d1f;
        }

        /* ── LOADING ── */
        .cp-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f5f5f7;
        }
        .cp-spinner {
          width: 44px;
          height: 44px;
          border: 3px solid rgba(0, 0, 0, 0.05);
          border-top-color: #aa841c;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── HERO ── */
        .cp-hero {
          position: relative;
          padding: 100px 32px 60px;
          background: linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        .cp-hero::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .cp-hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .cp-hero-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #aa841c;
          margin: 0 0 12px;
        }
        .cp-hero-title {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800;
          letter-spacing: -1.5px;
          color: #1d1d1f;
          margin: 0 0 20px;
          line-height: 1.05;
        }
        .cp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .cp-breadcrumb-link {
          color: #888;
          text-decoration: none;
          transition: color 0.2s;
        }
        .cp-breadcrumb-link:hover { color: #aa841c; }
        .cp-breadcrumb-sep { color: #ccc; }
        .cp-breadcrumb-current { color: #666; }

        /* ── MAIN ── */
        .cp-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 32px 80px;
        }

        /* ── EMPTY STATE ── */
        .cp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 100px 24px;
          border: 1px dashed rgba(0, 0, 0, 0.1);
          border-radius: 24px;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .cp-empty-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aa841c;
          margin-bottom: 28px;
        }
        .cp-empty-title {
          font-size: 26px;
          font-weight: 800;
          color: #1d1d1f;
          margin: 0 0 10px;
        }
        .cp-empty-sub {
          font-size: 15px;
          color: #666;
          margin: 0 0 32px;
        }
        .cp-empty-btn {
          background: linear-gradient(135deg, #d4af37, #aa841c);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          padding: 14px 32px;
          border-radius: 12px;
          text-decoration: none;
          letter-spacing: 0.3px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25);
        }
        .cp-empty-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.35);
        }

        /* ── GRID ── */
        .cp-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .cp-grid { grid-template-columns: 1fr; }
        }

        /* ── LEFT PANEL ── */
        .cp-left {}
        .cp-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .cp-section-title {
          font-size: 20px;
          font-weight: 800;
          color: #1d1d1f;
          margin: 0;
        }
        .cp-item-count {
          font-size: 13px;
          font-weight: 600;
          color: #aa841c;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.15);
          padding: 4px 12px;
          border-radius: 99px;
        }

        /* ── ITEM CARD ── */
        .cp-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }
        .cp-item {
          display: flex;
          gap: 20px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 20px;
          padding: 20px;
          transition: all 0.38s cubic-bezier(0.16,1,0.3,1);
          animation: itemSlideIn 0.4s ease forwards;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);
        }
        .cp-item:hover {
          border-color: rgba(212, 175, 55, 0.25);
          background: #fafafa;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.03);
        }
        .cp-item-exit {
          opacity: 0;
          transform: translateX(40px) scale(0.96);
        }
        @keyframes itemSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Item image */
        .cp-item-img-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .cp-item-img {
          width: 110px;
          height: 130px;
          object-fit: cover;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .cp-item-qty-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #1d1d1f;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* Item info */
        .cp-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }
        .cp-item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .cp-item-category {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #aa841c;
          margin: 0 0 6px;
        }
        .cp-item-name {
          font-size: 17px;
          font-weight: 700;
          color: #1d1d1f;
          margin: 0 0 10px;
          line-height: 1.3;
        }
        .cp-item-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cp-item-tag {
          font-size: 11px;
          font-weight: 600;
          color: #666;
          background: #f2f2f4;
          border: 1px solid rgba(0, 0, 0, 0.04);
          padding: 3px 10px;
          border-radius: 6px;
        }
        .cp-remove-btn {
          background: transparent;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .cp-remove-btn:hover {
          color: #ef4444;
          background: rgba(239,68,68,0.05);
        }

        /* Bottom row */
        .cp-item-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .cp-qty-wrap {
          display: flex;
          align-items: center;
          background: #f2f2f4;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 10px;
          overflow: hidden;
        }
        .cp-qty-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: #555;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          line-height: 1;
        }
        .cp-qty-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #000;
        }
        .cp-qty-num {
          font-size: 14px;
          font-weight: 700;
          color: #1d1d1f;
          min-width: 32px;
          text-align: center;
        }
        .cp-item-price-wrap {
          text-align: right;
        }
        .cp-item-unit {
          font-size: 12px;
          color: #777;
          margin: 0 0 4px;
        }
        .cp-item-total {
          font-size: 18px;
          font-weight: 800;
          color: #aa841c;
          margin: 0;
        }

        /* Continue link */
        .cp-continue {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          color: #888;
          text-decoration: none;
          transition: color 0.2s ease;
          padding: 4px 0;
        }
        .cp-continue:hover { color: #aa841c; }

        /* ── RIGHT: SUMMARY CARD ── */
        .cp-right {
          position: sticky;
          top: 100px;
        }
        .cp-summary-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }
        .cp-summary-title {
          font-size: 18px;
          font-weight: 800;
          color: #1d1d1f;
          margin: 0 0 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .cp-summary-rows {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .cp-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #666;
        }
        .cp-summary-row span:last-child { color: #1d1d1f; font-weight: 600; }
        .cp-discount-row span { color: #15803d !important; }
        .cp-free-tag {
          color: #15803d !important;
          font-weight: 700 !important;
          background: rgba(22, 163, 74, 0.08);
          padding: 2px 8px;
          border-radius: 6px;
        }
        .cp-summary-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.06);
          margin-bottom: 20px;
        }
        .cp-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .cp-total-label {
          font-size: 16px;
          font-weight: 800;
          color: #1d1d1f;
        }
        .cp-total-value {
          font-size: 26px;
          font-weight: 800;
          color: #aa841c;
          letter-spacing: -0.5px;
        }

        /* Coupon */
        .cp-coupon-wrap {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }
        .cp-coupon-input {
          flex: 1;
          background: #f2f2f4;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #1d1d1f;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .cp-coupon-input:focus { border-color: rgba(212, 175, 55, 0.4); }
        .cp-coupon-input::placeholder { color: #999; }
        .cp-coupon-input:disabled { opacity: 0.5; }
        .cp-coupon-btn {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.06);
          color: #aa841c;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .cp-coupon-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.05);
        }
        .cp-coupon-btn:disabled { opacity: 0.6; cursor: default; }

        /* Payment */
        .cp-payment-section { margin-bottom: 24px; }
        .cp-payment-label {
          font-size: 13px;
          font-weight: 700;
          color: #888;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .cp-payment-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cp-payment-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cp-payment-option:hover {
          border-color: rgba(212, 175, 55, 0.2);
        }
        .cp-payment-active {
          border-color: rgba(212, 175, 55, 0.4) !important;
          background: rgba(212, 175, 55, 0.04) !important;
        }
        .cp-radio { display: none; }
        .cp-payment-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f2f2f4;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
          flex-shrink: 0;
        }
        .cp-payment-active .cp-payment-icon {
          background: rgba(212, 175, 55, 0.1);
          color: #aa841c;
        }
        .cp-payment-name {
          font-size: 13px;
          font-weight: 700;
          color: #1d1d1f;
          margin: 0 0 3px;
        }
        .cp-payment-sub {
          font-size: 11px;
          color: #777;
          margin: 0;
        }

        /* Order button */
        .cp-order-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #1d1d1f 0%, #000000 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          padding: 17px 24px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          margin-bottom: 18px;
          position: relative;
          overflow: hidden;
        }
        .cp-order-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
        }
        .cp-order-btn:disabled {
          background: rgba(0, 0, 0, 0.05);
          color: #999;
          box-shadow: none;
          cursor: not-allowed;
        }
        .cp-order-loading {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cp-order-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        /* Trust badges */
        .cp-trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .cp-trust-badge {
          font-size: 11px;
          font-weight: 600;
          color: #666;
          background: #f2f2f4;
          border: 1px solid rgba(0, 0, 0, 0.04);
          padding: 5px 12px;
          border-radius: 8px;
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .cp-main { padding: 24px 16px 60px; }
          .cp-hero { padding: 80px 16px 40px; }
          .cp-grid { gap: 24px; }
          .cp-item {
            padding: 12px;
            gap: 12px;
            border-radius: 16px;
          }
          .cp-item-img {
            width: 75px;
            height: 95px;
            border-radius: 10px;
          }
          .cp-item-name {
            font-size: 14px;
            margin-bottom: 6px;
          }
          .cp-qty-btn {
            width: 30px;
            height: 30px;
            font-size: 15px;
          }
          .cp-qty-num {
            min-width: 24px;
            font-size: 13px;
          }
          .cp-item-total {
            font-size: 15px;
          }
          .cp-summary-card {
            padding: 20px;
            border-radius: 20px;
          }
          .cp-total-value {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}