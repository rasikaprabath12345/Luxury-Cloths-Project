"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  paymentMethod?: string;
  paymentSlipUrl?: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const triggerUpload = (orderId: number) => {
    setSelectedOrderId(orderId);
    document.getElementById("slip-file-input")?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selectedOrderId === null) return;

    setUploadingId(selectedOrderId);
    try {
      const uploadRes = await uploadAPI.uploadImage(file);
      const fileUrl = uploadRes.data.url;

      await ordersAPI.uploadOrderSlip(selectedOrderId, fileUrl);

      alert("🎉 Receipt uploaded successfully!");

      const response = await ordersAPI.getUserOrders();
      setOrders(response.data);
    } catch (error: any) {
      console.error("Receipt upload failed:", error);
      alert(error.response?.data?.message || "Failed to upload receipt. Please try again.");
    } finally {
      setUploadingId(null);
      setSelectedOrderId(null);
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      const fetchOrders = async () => {
        try {
          const response = await ordersAPI.getUserOrders();
          setOrders(response.data);
        } catch (error: any) {
          console.error("Orders ලබා ගැනීමට නොහැකි විය:", error);
          // If 401 (auth expired), redirect to login
          if (error.response?.status === 401) {
            localStorage.removeItem("luxury_token");
            localStorage.removeItem("luxury_user");
            router.push("/auth/login");
            return;
          }
          setError(error.response?.data?.message || error.message || "Failed to load orders. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }
  }, [user, authLoading, router]);

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

  if (!user) {
    return null;
  }

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
      background: "linear-gradient(160deg, #F2F2F7 0%, #E8E8F0 40%, #EEF0F8 100%)",
      minHeight: "100vh", color: "#1C1C1E",
      paddingTop: 30,
      paddingBottom: 100,
      position: "relative"
    }}>
      {/* Hidden file input for payment slips */}
      <input
        type="file"
        id="slip-file-input"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
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

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        
        {/* Navigation & Header */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 8, marginBottom: 40,
          borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: 24
        }}>
          <Link href="/storefront/shop" style={{
            display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
            color: "#8E8E93", fontSize: 13, fontWeight: 600,
            transition: "all 0.2s ease"
          }} className="back-link">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Continue Boutique Shopping
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
            <div>
              <p style={{
                margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "#aa841c"
              }}>Account Orders</p>
              <h1 style={{ margin: 0, fontSize: "clamp(28px, 4.5vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#1C1C1E" }}>
                My Orders
              </h1>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: 24, padding: "20px 24px",
            background: "rgba(255, 59, 48, 0.06)", border: "0.5px solid rgba(255, 59, 48, 0.2)",
            borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#FF3B30" }}>Unable to Load Orders</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8E8E93" }}>{error}</p>
            </div>
            <Link href="/auth/login" style={{
              background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
              color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700,
              padding: "10px 20px", borderRadius: 10, whiteSpace: "nowrap",
              boxShadow: "0 2px 10px rgba(170,132,28,0.2)"
            }}>
              Sign In Again
            </Link>
          </div>
        )}

        {orders.length === 0 ? (
          /* Empty Orders state */
          <div style={{ 
            ...glass.card, padding: "80px 40px", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
            boxShadow: "0 8px 40px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(170,132,28,0.05)", border: "1px dashed rgba(170,132,28,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#aa841c", fontSize: 28
            }}>
              📦
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#1C1C1E" }}>No Orders Placed Yet</h3>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#8E8E93", lineHeight: 1.5 }}>
                You have not placed any orders from our online store yet. Start exploring our boutique.
              </p>
            </div>
            <Link href="/storefront/shop" style={{
              background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
              color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700,
              padding: "14px 36px", borderRadius: 14,
              boxShadow: "0 4px 16px rgba(170,132,28,0.2)", transition: "all 0.25s ease",
              letterSpacing: "0.5px", textTransform: "uppercase"
            }} className="explore-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {orders.map((order) => {
              const orderDateFormatted = new Date(order.orderDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              // Status styles
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

              return (
                <div
                  key={order.id}
                  style={{
                    ...glass.card,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.9)",
                    background: "rgba(255,255,255,0.65)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.03)"
                  }}
                  className="order-card"
                >
                  {/* Order header row */}
                  <div style={{
                    padding: "20px 24px",
                    background: "rgba(0, 0, 0, 0.02)",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 16
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.08em" }}>Order Reference</p>
                      <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 800, color: "#1C1C1E" }}>#ORD-{order.id}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.08em" }}>Date Placed</p>
                      <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>{orderDateFormatted}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Amount</p>
                      <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 800, color: "#aa841c" }}>Rs. {order.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Status</p>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 12px",
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 700,
                        background: statusBg,
                        border: `0.5px solid ${statusBorder}`,
                        color: statusColor
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order items nested list */}
                  <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: idx === order.items.length - 1 ? "none" : "0.5px solid rgba(0,0,0,0.05)",
                          paddingBottom: idx === order.items.length - 1 ? 0 : 12
                        }}
                      >
                        <div>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1C1C1E" }}>{item.productName}</h4>
                          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8E8E93" }}>
                            Quantity: <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1C1C1E" }}>
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8E8E93" }}>
                            Rs. {item.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Slip Upload section */}
                  {order.paymentMethod === "BankTransfer" && (
                    <div style={{
                      margin: "0 24px 20px",
                      padding: "16px 20px",
                      borderRadius: 12,
                      background: "rgba(170, 132, 28, 0.03)",
                      border: "0.5px solid rgba(170, 132, 28, 0.15)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 16
                    }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#aa841c", display: "flex", alignItems: "center", gap: 6 }}>
                          🏛️ Bank Transfer Payment
                        </p>
                        {order.paymentSlipUrl ? (
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#16A34A", fontWeight: 600 }}>
                            ✓ Payment receipt uploaded successfully
                          </p>
                        ) : (
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#FF3B30", fontWeight: 600 }}>
                            ⚠️ Action Required: Please upload your bank deposit slip
                          </p>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {order.paymentSlipUrl && (
                          <a
                            href={order.paymentSlipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#aa841c",
                              textDecoration: "none",
                              padding: "8px 16px",
                              borderRadius: 8,
                              background: "rgba(255, 255, 255, 0.6)",
                              border: "0.5px solid rgba(170, 132, 28, 0.2)",
                              transition: "background 0.2s"
                            }}
                          >
                            View Receipt
                          </a>
                        )}

                        <button
                          onClick={() => triggerUpload(order.id)}
                          disabled={uploadingId === order.id}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#fff",
                            background: "linear-gradient(135deg, #d4af37 0%, #aa841c 100%)",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: 8,
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(170, 132, 28, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "opacity 0.2s"
                          }}
                        >
                          {uploadingId === order.id ? (
                            <>
                              <span className="cp-spinner" style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                              Uploading…
                            </>
                          ) : (
                            <>
                              📤 {order.paymentSlipUrl ? "Re-upload Receipt" : "Upload Receipt"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Order card footer action */}
                  <div style={{
                    padding: "16px 24px",
                    background: "rgba(0, 0, 0, 0.01)",
                    borderTop: "0.5px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: 12, color: "#8E8E93", fontWeight: 600 }}>
                      {order.items.length} product{order.items.length !== 1 ? "s" : ""}
                    </span>
                    <Link
                      href={`/orders/${order.id}`}
                      style={{
                        color: "#aa841c",
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s"
                      }}
                      className="details-link"
                    >
                      View Order Details
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .back-link:hover {
          color: #aa841c !important;
          transform: translateX(-4px);
        }

        .order-card {
          transition: all 0.3s ease !important;
        }
        .order-card:hover {
          border-color: rgba(170,132,28,0.2) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important;
        }

        .details-link:hover {
          color: #d4af37 !important;
          transform: translateX(3px);
        }

        .explore-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 24px rgba(170,132,28,0.3) !important;
        }
      `}</style>
    </div>
  );
}