"use client";

import { useState, useEffect } from "react";
import { stockAPI } from "@/lib/api";
import { showToast } from "@/lib/adminUtils";

interface StockVariant {
  variantId: number;
  size: string;
  color: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableStock: number;
  lowStockThreshold: number;
  status: string;
}

interface StockProduct {
  productId: number;
  productName: string;
  imageUrl?: string;
  categoryName: string;
  variants: StockVariant[];
  totalStock: number;
  totalAvailable: number;
  overallStatus: string;
}

interface StockSummary {
  totalProducts: number;
  totalVariants: number;
  totalItemsInStock: number;
  outOfStockCount: number;
  lowStockCount: number;
  inStockCount: number;
}

interface StockMovement {
  id: number;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  orderId?: number;
  createdAt: string;
}

export default function AdminStockPage() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "InStock" | "LowStock" | "OutOfStock">("All");

  // Modal states
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; variant: StockVariant | null; productName: string }>({
    open: false, variant: null, productName: ""
  });
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // History modal
  const [historyModal, setHistoryModal] = useState<{ open: boolean; variantId: number; productName: string; size: string }>({
    open: false, variantId: 0, productName: "", size: ""
  });
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Expanded product rows
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      const [stockRes, summaryRes] = await Promise.allSettled([
        stockAPI.getAllStock(),
        stockAPI.getStockSummary(),
      ]);
      if (stockRes.status === "fulfilled") setProducts(stockRes.value.data);
      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value.data);
    } catch (err) {
      console.error("Failed to load stock data:", err);
      showToast("Failed to load stock data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.overallStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (productId: number) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const openAdjustModal = (variant: StockVariant, productName: string) => {
    setAdjustModal({ open: true, variant, productName });
    setAdjustAmount("");
    setAdjustReason("");
  };

  const handleAdjustStock = async () => {
    if (!adjustModal.variant || !adjustAmount) return;
    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount === 0) {
      showToast("Enter a valid non-zero amount", "warning");
      return;
    }

    setAdjusting(true);
    try {
      await stockAPI.adjustStock(adjustModal.variant.variantId, {
        adjustment: amount,
        reason: adjustReason || "Manual adjustment",
      });
      showToast(`Stock updated: ${amount > 0 ? "+" : ""}${amount}`, "success");
      setAdjustModal({ open: false, variant: null, productName: "" });
      fetchData();
    } catch (err: any) {
      showToast(err?.response?.data || "Failed to adjust stock", "error");
    } finally {
      setAdjusting(false);
    }
  };

  const openHistoryModal = async (variantId: number, productName: string, size: string) => {
    setHistoryModal({ open: true, variantId, productName, size });
    setLoadingHistory(true);
    try {
      const res = await stockAPI.getStockMovements(variantId);
      setMovements(res.data);
    } catch {
      showToast("Failed to load history", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; border: string; label: string; icon: string }> = {
      InStock: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "In Stock", icon: "🟢" },
      LowStock: { bg: "#fffbeb", color: "#d97706", border: "#fef3c7", label: "Low Stock", icon: "🟡" },
      OutOfStock: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Out of Stock", icon: "🔴" },
    };
    const s = styles[status] || styles.InStock;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      }}>
        <span style={{ fontSize: 8 }}>{s.icon}</span> {s.label}
      </span>
    );
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "StockIn": return "📥";
      case "StockOut": return "📤";
      case "OrderDeduct": return "🛒";
      case "OrderCancel": return "↩️";
      case "Adjustment": return "🔧";
      default: return "📋";
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
    padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 24px" }}>Stock Management</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer" style={{ height: 100, borderRadius: 16 }} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="shimmer" style={{ height: 64, borderRadius: 12, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>📋 Stock Management</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Track and manage inventory levels for all products
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Items in Stock", value: summary.totalItemsInStock.toLocaleString(), icon: "📦", color: "#3b82f6", bg: "#eff6ff" },
            { label: "In Stock Variants", value: summary.inStockCount, icon: "🟢", color: "#16a34a", bg: "#f0fdf4" },
            { label: "Low Stock", value: summary.lowStockCount, icon: "🟡", color: "#d97706", bg: "#fffbeb" },
            { label: "Out of Stock", value: summary.outOfStockCount, icon: "🔴", color: "#dc2626", bg: "#fef2f2" },
          ].map((card, i) => (
            <div key={i} style={{
              ...cardStyle,
              display: "flex", alignItems: "center", gap: 16,
              transition: "transform 0.2s, box-shadow 0.2s", cursor: "default",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: card.bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
              }}>{card.icon}</div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: card.color, margin: 0 }}>{card.value}</p>
                <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0", fontWeight: 500 }}>{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ ...cardStyle, marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "16px 20px" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.4 }}>🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px 10px 38px", borderRadius: 10,
              border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a",
              outline: "none", background: "#f8fafc",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["All", "InStock", "LowStock", "OutOfStock"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              background: statusFilter === f ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#f1f5f9",
              color: statusFilter === f ? "#fff" : "#475569",
              transition: "all 0.2s",
            }}>
              {f === "All" ? "All" : f === "InStock" ? "🟢 In Stock" : f === "LowStock" ? "🟡 Low" : "🔴 Out"}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ ...thStyle, width: 50 }}></th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Category</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Total Stock</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Available</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                  No products found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isExpanded = expandedProducts.has(product.productId);
                return (
                  <>
                    {/* Product Row */}
                    <tr
                      key={product.productId}
                      style={{
                        borderBottom: isExpanded ? "none" : "1px solid #f1f5f9",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onClick={() => toggleExpand(product.productId)}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{
                          display: "inline-block", transition: "transform 0.2s",
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", fontSize: 12, color: "#94a3b8",
                        }}>▶</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img
                            src={product.imageUrl || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=100&auto=format&fit=crop"}
                            alt={product.productName}
                            style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", border: "1px solid #e2e8f0" }}
                          />
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{product.productName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>{product.categoryName}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "#0f172a" }}>
                        {product.totalStock}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: "#475569" }}>
                        {product.totalAvailable}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {getStatusBadge(product.overallStatus)}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>
                          {isExpanded ? "Collapse" : "Expand"} ({product.variants.length})
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Variants */}
                    {isExpanded && product.variants.map((v) => (
                      <tr key={v.variantId} style={{
                        background: "#fafbff", borderBottom: "1px solid #f1f5f9",
                      }}>
                        <td style={{ padding: "10px 16px" }}></td>
                        <td style={{ padding: "10px 16px", paddingLeft: 68 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {v.color && v.color !== "Default" && (
                              <span style={{
                                width: 16, height: 16, borderRadius: 4, border: "1px solid #e2e8f0",
                                background: v.color, display: "inline-block", flexShrink: 0,
                              }} />
                            )}
                            <span style={{ fontSize: 12, color: "#475569" }}>
                              Size: <strong>{v.size}</strong>
                              {v.color && v.color !== "Default" && ` · Color: ${v.color}`}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 16px" }}></td>
                        <td style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, fontSize: 14 }}>
                          {v.stockQuantity}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, color: "#475569" }}>
                          {v.availableStock}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "center" }}>
                          {getStatusBadge(v.status)}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); openAdjustModal(v, product.productName); }}
                              style={{
                                padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
                                background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600,
                                color: "#3b82f6", transition: "all 0.2s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#3b82f6"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                            >
                              ± Adjust
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openHistoryModal(v.variantId, product.productName, v.size); }}
                              style={{
                                padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
                                background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600,
                                color: "#64748b", transition: "all 0.2s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#94a3b8"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                            >
                              📜 History
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModal.open && adjustModal.variant && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(6px)",
          zIndex: 9990, display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease",
        }} onClick={() => setAdjustModal({ open: false, variant: null, productName: "" })}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: 32, maxWidth: 440, width: "90%",
            boxShadow: "0 24px 48px rgba(15,23,42,0.15)", animation: "scaleIn 0.25s ease",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
              ± Adjust Stock
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 20px" }}>
              {adjustModal.productName} — Size: {adjustModal.variant.size}
            </p>

            <div style={{
              background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 20,
              border: "1px solid #e2e8f0",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Current Stock</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{adjustModal.variant.stockQuantity}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Available</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>{adjustModal.variant.availableStock}</span>
              </div>
            </div>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Adjustment Amount
            </label>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 8px" }}>
              Use positive numbers to add stock, negative to remove (e.g. +50 or -10)
            </p>
            <input
              type="number"
              value={adjustAmount}
              onChange={e => setAdjustAmount(e.target.value)}
              placeholder="e.g. +50 or -10"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a",
                outline: "none", background: "#fff", marginBottom: 16,
                boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Reason
            </label>
            <input
              type="text"
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              placeholder="e.g. New shipment received, Damaged goods..."
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a",
                outline: "none", background: "#fff", marginBottom: 24,
                boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />

            {adjustAmount && !isNaN(parseInt(adjustAmount)) && parseInt(adjustAmount) !== 0 && (
              <div style={{
                background: parseInt(adjustAmount) > 0 ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${parseInt(adjustAmount) > 0 ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 12, fontWeight: 600,
                color: parseInt(adjustAmount) > 0 ? "#16a34a" : "#dc2626",
              }}>
                New stock will be: {adjustModal.variant.stockQuantity + parseInt(adjustAmount)}
                {adjustModal.variant.stockQuantity + parseInt(adjustAmount) < 0 && (
                  <span style={{ display: "block", marginTop: 4, color: "#dc2626", fontWeight: 500 }}>
                    ⚠️ Stock cannot go below 0
                  </span>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setAdjustModal({ open: false, variant: null, productName: "" })}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0",
                  background: "#f1f5f9", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >Cancel</button>
              <button
                onClick={handleAdjustStock}
                disabled={adjusting || !adjustAmount || parseInt(adjustAmount) === 0}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: adjusting ? "#94a3b8" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff", fontSize: 13, fontWeight: 600, cursor: adjusting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
                }}
              >{adjusting ? "Updating..." : "Update Stock"}</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal.open && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(6px)",
          zIndex: 9990, display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease",
        }} onClick={() => setHistoryModal({ open: false, variantId: 0, productName: "", size: "" })}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: 32, maxWidth: 560, width: "90%",
            maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 24px 48px rgba(15,23,42,0.15)", animation: "scaleIn 0.25s ease",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
              📜 Stock History
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 20px" }}>
              {historyModal.productName} — Size: {historyModal.size}
            </p>

            {loadingHistory ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading...</div>
            ) : movements.length === 0 ? (
              <div style={{
                textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13,
                background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0",
              }}>
                No stock movements recorded yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {movements.map((m) => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 16px", borderRadius: 12,
                    background: "#f8fafc", border: "1px solid #f1f5f9",
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{getMovementIcon(m.type)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: m.quantity > 0 ? "#16a34a" : "#dc2626",
                          background: m.quantity > 0 ? "#f0fdf4" : "#fef2f2",
                          padding: "2px 8px", borderRadius: 6,
                        }}>
                          {m.quantity > 0 ? "+" : ""}{m.quantity}
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                          {m.previousStock} → {m.newStock}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#475569", margin: "0 0 2px" }}>{m.reason}</p>
                      <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
                        {new Date(m.createdAt).toLocaleString()}
                        {m.orderId && ` · Order #${m.orderId}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setHistoryModal({ open: false, variantId: 0, productName: "", size: "" })}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0",
                  background: "#f1f5f9", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  textAlign: "left",
};
