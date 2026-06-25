"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI, uploadAPI } from "@/lib/api";
import { glass } from "@/utils/theme";

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
  paymentMethod?: string;
  paymentSlipUrl?: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

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
          if (error.response?.status === 401) {
            localStorage.removeItem("luxury_token");
            localStorage.removeItem("luxury_user");
            router.push("/auth/login");
            return;
          }
          setError(error.response?.data?.message || "Failed to load order details");
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [user, authLoading, orderId, router]);

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;

    setUploading(true);
    try {
      // 1. Upload file to backend uploads
      const uploadRes = await uploadAPI.uploadImage(file);
      const slipUrl = uploadRes.data.url;

      // 2. Save slip URL to order
      await ordersAPI.uploadOrderSlip(order.id, slipUrl);

      // 3. Update state
      setOrder(prev => prev ? { ...prev, paymentSlipUrl: slipUrl } : null);
      alert("🎉 ගෙවීම් රිසිට්පත සාර්ථකව upload කරන ලදී! අපගේ කණ්ඩායම මෙය ඉක්මනින්ම තහවුරු කරනු ඇත.");
    } catch (err: any) {
      console.error("Slip upload error:", err);
      alert(err.response?.data?.message || "රසීද පත upload කිරීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "linear-gradient(160deg, #F2F2F7 0%, #E8E8F0 40%, #EEF0F8 100%)"
      }}>
        <div className="cp-spinner" style={{
          width: 44, height: 44,
          border: "3px solid rgba(0,0,0,0.05)",
          borderTopColor: "#aa841c", borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
      </div>
    );
  }

  if (!user || !order) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20,
        minHeight: "100vh", background: "linear-gradient(160deg, #F2F2F7 0%, #E8E8F0 40%, #EEF0F8 100%)"
      }}>
        <div style={{ ...glass.card, padding: 40, textAlign: "center", maxWidth: 440 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1C1C1E", margin: "0 0 12px" }}>Order Not Found</h1>
          <p style={{ fontSize: 14, color: "#8E8E93", margin: "0 0 24px" }}>We couldn't retrieve details for this order reference.</p>
          <Link href="/orders" style={{
            background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
            color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700,
            padding: "12px 32px", borderRadius: 14, display: "inline-block"
          }}>
            Back to Orders List
          </Link>
        </div>
      </div>
    );
  }

  const orderDateFormatted = new Date(order.orderDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Status badge styling
  let statusBg = "rgba(142, 142, 147, 0.08)";
  let statusBorder = "rgba(142, 142, 147, 0.2)";
  let statusColor = "#8E8E93";
  if (order.status === "Delivered") {
    statusBg = "rgba(22, 163, 74, 0.08)";
    statusBorder = "rgba(22, 163, 74, 0.2)";
    statusColor = "#16A34A";
  } else if (order.status === "Shipped") {
    statusBg = "rgba(0, 122, 255, 0.08)";
    statusBorder = "rgba(0, 122, 255, 0.2)";
    statusColor = "#007AFF";
  } else if (order.status === "Processing" || order.status === "Pending") {
    statusBg = "rgba(170, 132, 28, 0.08)";
    statusBorder = "rgba(170, 132, 28, 0.2)";
    statusColor = "#aa841c";
  }

  const isBankTransfer = order.paymentMethod === "BankTransfer";

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
      background: "linear-gradient(160deg, #F2F2F7 0%, #E8E8F0 40%, #EEF0F8 100%)",
      minHeight: "100vh", color: "#1C1C1E",
      paddingTop: 130,
      paddingBottom: 100,
      position: "relative"
    }}>
      {/* Ambient background blur blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "-8%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(170,132,28,0.03) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
      </div>

      <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        
        {/* Navigation & Header */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 8, marginBottom: 40,
          borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: 24
        }}>
          <Link href="/orders" style={{
            display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
            color: "#8E8E93", fontSize: 13, fontWeight: 600,
            transition: "all 0.2s ease"
          }} className="back-link">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Orders List
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
            <div>
              <p style={{
                margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "#aa841c"
              }}>Invoice Details</p>
              <h1 style={{ margin: 0, fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#1C1C1E" }}>
                Order #ORD-{order.id}
              </h1>
            </div>
            <span style={{
              display: "inline-block",
              padding: "4px 16px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 700,
              background: statusBg,
              border: `0.5px solid ${statusBorder}`,
              color: statusColor
            }}>
              {order.status}
            </span>
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: 24, padding: "16px 20px",
            background: "rgba(255, 59, 48, 0.08)", border: "0.5px solid rgba(255, 59, 48, 0.2)",
            borderRadius: 14, color: "#FF3B30", fontSize: 14, fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          
          {/* MAIN INFO CARD */}
          <div style={{
            ...glass.card,
            padding: 32,
            border: "1px solid rgba(255,255,255,0.9)",
            background: "rgba(255,255,255,0.65)"
          }}>
            {/* Meta Row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 20,
              paddingBottom: 24,
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              marginBottom: 28
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em" }}>Order Date</p>
                <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>{orderDateFormatted}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Method</p>
                <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>
                  {isBankTransfer ? "🏦 Bank Transfer" : "💵 Cash on Delivery"}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Amount</p>
                <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 900, color: "#aa841c" }}>Rs. {order.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1C1C1E", margin: "0 0 16px" }}>Purchased Items</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: idx === order.items.length - 1 ? "none" : "0.5px solid rgba(0,0,0,0.05)",
                      paddingBottom: idx === order.items.length - 1 ? 0 : 16
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1C1C1E" }}>{item.productName}</h4>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8E8E93" }}>
                        Quantity: <span style={{ fontWeight: 600, color: "#1C1C1E" }}>{item.quantity}</span> × Rs. {item.price.toLocaleString()}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#aa841c" }}>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Footer Row */}
            <div style={{
              background: "rgba(0,0,0,0.02)",
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "0.5px solid rgba(0,0,0,0.04)"
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#8E8E93" }}>Total Charged</span>
              <span style={{ fontSize: 19, fontWeight: 900, color: "#aa841c" }}>Rs. {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* PAYMENT SLIP WIDGET - Only for Bank Transfer */}
          {isBankTransfer && (
            <div style={{
              ...glass.card,
              padding: 32,
              border: "1px solid rgba(255,255,255,0.9)",
              background: "rgba(255,255,255,0.65)"
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1C1C1E", margin: "0 0 8px" }}>Bank Payment Verification</h2>
              
              {!order.paymentSlipUrl ? (
                /* Slip not uploaded yet */
                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>
                  <div style={{
                    padding: "16px",
                    borderRadius: 16,
                    background: "rgba(170,132,28,0.03)",
                    border: "0.5px solid rgba(170,132,28,0.2)",
                    fontSize: 12,
                    lineHeight: "1.6em",
                    color: "#5C460D"
                  }}>
                    <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#aa841c", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>Sampath Bank Transfer Details</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div><strong>Bank:</strong> Sampath Bank PLC</div>
                      <div><strong>Account Name:</strong> Luxury Clothing Store</div>
                      <div><strong>Account Number:</strong> 1009 5421 9882</div>
                      <div><strong>Branch:</strong> Colombo Corporate Branch</div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: 13, color: "#8E8E93", lineHeight: 1.5 }}>
                    Please transfer the total sum of <strong>Rs. {order.totalAmount.toLocaleString()}</strong> to the bank details above, then upload a screenshot or image of the transaction slip below to verify payment.
                  </p>

                  <div style={{ marginTop: 8 }}>
                    <label style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      padding: "14px 28px",
                      borderRadius: 12,
                      cursor: uploading ? "default" : "pointer",
                      boxShadow: "0 4px 14px rgba(170,132,28,0.2)",
                      transition: "all 0.2s"
                    }} className="upload-btn">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleSlipUpload} 
                        disabled={uploading}
                        style={{ display: "none" }} 
                      />
                      {uploading ? (
                        <>
                          <span className="cp-order-spinner" style={{
                            width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)",
                            borderTopColor: "#fff", borderRadius: "50%",
                            animation: "spin 0.6s linear infinite"
                          }} />
                          Uploading Slip…
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          Upload Payment Slip
                        </>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                /* Slip is uploaded */
                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    background: "rgba(22,163,74,0.06)",
                    border: "0.5px solid rgba(22,163,74,0.2)",
                    borderRadius: 12,
                    color: "#15803D",
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    <span>✓ Payment Slip Submitted Successfully</span>
                  </div>
                  
                  <div>
                    <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase" }}>Receipt Preview</p>
                    <a href={order.paymentSlipUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
                      <div style={{
                        position: "relative",
                        width: 120,
                        height: 150,
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "rgba(0,0,0,0.02)"
                      }} className="slip-preview-container">
                        <img 
                          src={order.paymentSlipUrl} 
                          alt="Payment Receipt" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "rgba(0,0,0,0.4)",
                          opacity: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 11, fontWeight: 700, transition: "opacity 0.2s"
                        }} className="slip-hover-overlay">
                          Open Original
                        </div>
                      </div>
                    </a>
                  </div>

                  <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)", paddingTop: 16 }}>
                    <p style={{ margin: "0 0 12px", fontSize: 12, color: "#8E8E93" }}>Need to update the slip? You can upload a new receipt below.</p>
                    <label style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: "rgba(0,0,0,0.03)",
                      border: "0.5px solid rgba(0,0,0,0.1)",
                      color: "#aa841c",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "10px 20px",
                      borderRadius: 10,
                      cursor: uploading ? "default" : "pointer",
                      transition: "all 0.2s"
                    }} className="reupload-btn">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleSlipUpload} 
                        disabled={uploading}
                        style={{ display: "none" }} 
                      />
                      {uploading ? "Uploading..." : "Replace Receipt"}
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SHIPPING & CUSTOMER DETAILS */}
          <div style={{
            ...glass.card,
            padding: 32,
            border: "1px solid rgba(255,255,255,0.9)",
            background: "rgba(255,255,255,0.65)"
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1C1C1E", margin: "0 0 16px" }}>Shipping & Delivery Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {order.userEmail && (
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase" }}>Customer Email</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{order.userEmail}</p>
                </div>
              )}
              {order.phoneNumber && (
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase" }}>Contact Phone</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>{order.phoneNumber}</p>
                </div>
              )}
              {order.shippingAddress && (
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase" }}>Delivery Address</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "#1C1C1E", lineHeight: 1.5 }}>{order.shippingAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* ACTION NAVIGATION BUTTONS */}
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <Link
              href="/orders"
              style={{
                flex: 1, background: "rgba(0,0,0,0.03)", border: "0.5px solid rgba(0,0,0,0.08)",
                color: "#1C1C1E", fontSize: 13, fontWeight: 700, borderRadius: 14,
                textDecoration: "none", display: "inline-block", textAlign: "center", padding: "14px 0",
                transition: "all 0.2s"
              }}
              className="action-btn-back"
            >
              Back to Orders
            </Link>
            <Link
              href="/storefront/shop"
              style={{
                flex: 1, background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
                color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 14,
                textDecoration: "none", display: "inline-block", textAlign: "center", padding: "14px 0",
                transition: "all 0.2s", boxShadow: "0 4px 14px rgba(170,132,28,0.2)"
              }}
              className="action-btn-shop"
            >
              Continue Shopping
            </Link>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .back-link:hover {
          color: #aa841c !important;
          transform: translateX(-4px);
        }

        .upload-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(170,132,28,0.3) !important;
        }

        .reupload-btn:hover {
          background: rgba(170,132,28,0.06) !important;
        }

        .slip-preview-container:hover .slip-hover-overlay {
          opacity: 1 !important;
        }

        .action-btn-back:hover {
          background: rgba(0,0,0,0.06) !important;
        }

        .action-btn-shop:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(170,132,28,0.3) !important;
        }
      `}</style>
    </div>
  );
}
