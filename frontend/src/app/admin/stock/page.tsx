"use client";

import { useState, useEffect, Fragment } from "react";
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
    const classes = {
      InStock: "status-instock",
      LowStock: "status-lowstock",
      OutOfStock: "status-outofstock",
    };
    const labels = {
      InStock: "🟢 In Stock",
      LowStock: "🟡 Low Stock",
      OutOfStock: "🔴 Out of Stock",
    };
    return (
      <span className={`status-badge ${classes[status as keyof typeof classes] || "status-instock"}`}>
        {labels[status as keyof typeof labels] || "🟢 In Stock"}
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

  if (loading) {
    return (
      <div className="stock-container">
        <h1 className="page-title">Stock Management</h1>
        <p className="page-subtitle">Loading inventory information...</p>
        <div className="loading-grid-skeleton">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer skeleton-card" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="shimmer skeleton-row-item" />
        ))}
        <style jsx>{`
          .stock-container { max-width: 1200px; margin: 0 auto; }
          .page-title { font-size: 32px; font-weight: 900; color: var(--admin-text-main); margin: 0 0 4px; }
          .page-subtitle { font-size: 13.5px; color: var(--admin-text-muted); margin-bottom: 24px; }
          .loading-grid-skeleton { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
          .skeleton-card { height: 100px; border-radius: var(--admin-radius-lg); }
          .skeleton-row-item { height: 60px; border-radius: var(--admin-radius-md); margin-bottom: 12px; }
          @media (max-width: 768px) {
            .loading-grid-skeleton { grid-template-columns: 1fr 1fr; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="stock-container">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Stock Management</h1>
          <p className="page-subtitle">Track and manage inventory levels for all products</p>
        </div>
      </header>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          {[
            { label: "Total Items in Stock", value: summary.totalItemsInStock.toLocaleString(), icon: "📦", className: "card-blue" },
            { label: "In Stock Variants", value: summary.inStockCount, icon: "🟢", className: "card-green" },
            { label: "Low Stock Alert", value: summary.lowStockCount, icon: "🟡", className: "card-yellow" },
            { label: "Out of Stock", value: summary.outOfStockCount, icon: "🔴", className: "card-red" },
          ].map((card, i) => (
            <div key={i} className={`summary-card ${card.className}`}>
              <div className="card-icon">{card.icon}</div>
              <div>
                <span className="card-value">{card.value}</span>
                <span className="card-label">{card.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      <div className="toolbar-section">
        <div className="search-box">
          <svg className="search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            type="text"
            placeholder="Search products or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="toolbar-input"
          />
        </div>
        <div className="filter-buttons">
          {(["All", "InStock", "LowStock", "OutOfStock"] as const).map(f => (
            <button 
              key={f} 
              onClick={() => setStatusFilter(f)} 
              className={`filter-btn ${statusFilter === f ? "active" : ""}`}
            >
              {f === "All" ? "All" : f === "InStock" ? "🟢 In Stock" : f === "LowStock" ? "🟡 Low" : "🔴 Out"}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="stock-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>Product</th>
                <th>Category</th>
                <th className="text-center">Total Stock</th>
                <th className="text-center">Available</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isExpanded = expandedProducts.has(product.productId);
                  return (
                    <Fragment key={product.productId}>
                      {/* Product Row */}
                      <tr
                        className={`product-row ${isExpanded ? "row-expanded" : ""}`}
                        onClick={() => toggleExpand(product.productId)}
                      >
                        <td className="text-center">
                          <span className={`expand-arrow ${isExpanded ? "rotated" : ""}`}>▶</span>
                        </td>
                        <td>
                          <div className="product-info-cell">
                            <img
                              src={product.imageUrl || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=100&auto=format&fit=crop"}
                              alt={product.productName}
                              className="product-thumb"
                            />
                            <span className="product-title-name">{product.productName}</span>
                          </div>
                        </td>
                        <td className="category-cell-text">{product.categoryName}</td>
                        <td className="text-center bold-count">{product.totalStock}</td>
                        <td className="text-center bold-avail">{product.totalAvailable}</td>
                        <td className="text-center">
                          {getStatusBadge(product.overallStatus)}
                        </td>
                        <td className="text-center">
                          <span className="action-toggle-link">
                            {isExpanded ? "Collapse" : "Expand"} ({product.variants.length})
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Variants */}
                      {isExpanded && product.variants.map((v) => (
                        <tr key={v.variantId} className="variant-row">
                          <td></td>
                          <td className="variant-details-cell">
                            <div className="variant-spec-wrapper">
                              {v.color && v.color !== "Default" && (
                                <span 
                                  className="color-dot" 
                                  style={{ background: v.color }} 
                                />
                              )}
                              <span>
                                Size: <strong>{v.size}</strong>
                                {v.color && v.color !== "Default" && ` · Color: ${v.color}`}
                              </span>
                            </div>
                          </td>
                          <td></td>
                          <td className="text-center variant-count-bold">{v.stockQuantity}</td>
                          <td className="text-center variant-avail-bold">{v.availableStock}</td>
                          <td className="text-center">
                            {getStatusBadge(v.status)}
                          </td>
                          <td className="text-center">
                            <div className="variant-actions">
                              <button
                                onClick={(e) => { e.stopPropagation(); openAdjustModal(v, product.productName); }}
                                className="variant-btn btn-adjust"
                              >
                                ± Adjust
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); openHistoryModal(v.variantId, product.productName, v.size); }}
                                className="variant-btn btn-history"
                              >
                                📜 History
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModal.open && adjustModal.variant && (
        <div className="modal-overlay" onClick={() => setAdjustModal({ open: false, variant: null, productName: "" })}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">± Adjust Stock</h3>
                <p className="modal-subtitle">{adjustModal.productName} — Size: {adjustModal.variant.size}</p>
              </div>
              <button className="modal-close" onClick={() => setAdjustModal({ open: false, variant: null, productName: "" })}>✕</button>
            </div>

            <div className="modal-body">
              <div className="current-stats-box">
                <div className="stat-line">
                  <span className="stat-label">Current Stock</span>
                  <span className="stat-val bold">{adjustModal.variant.stockQuantity}</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">Available Stock</span>
                  <span className="stat-val">{adjustModal.variant.availableStock}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Adjustment Amount</label>
                <p className="form-help">Use positive numbers to add stock, negative to remove (e.g. +10 or -5)</p>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  placeholder="e.g. +10 or -5"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Shipment received, damaged items..."
                  className="form-input"
                />
              </div>

              {adjustAmount && !isNaN(parseInt(adjustAmount)) && parseInt(adjustAmount) !== 0 && (
                <div className={`preview-box ${parseInt(adjustAmount) > 0 ? "positive" : "negative"}`}>
                  New stock will be: <strong>{adjustModal.variant.stockQuantity + parseInt(adjustAmount)}</strong>
                  {adjustModal.variant.stockQuantity + parseInt(adjustAmount) < 0 && (
                    <span className="stock-warning">⚠️ Stock cannot go below 0</span>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setAdjustModal({ open: false, variant: null, productName: "" })}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={adjusting || !adjustAmount || parseInt(adjustAmount) === 0 || (adjustModal.variant.stockQuantity + parseInt(adjustAmount) < 0)}
                className="btn-submit"
              >
                {adjusting ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal.open && (
        <div className="modal-overlay" onClick={() => setHistoryModal({ open: false, variantId: 0, productName: "", size: "" })}>
          <div className="modal-card history-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">📜 Stock History</h3>
                <p className="modal-subtitle">{historyModal.productName} — Size: {historyModal.size}</p>
              </div>
              <button className="modal-close" onClick={() => setHistoryModal({ open: false, variantId: 0, productName: "", size: "" })}>✕</button>
            </div>

            <div className="modal-body scrollable-body">
              {loadingHistory ? (
                <div className="loading-spinner-state">
                  <div className="spinner-glow" />
                  <p>Loading history records...</p>
                </div>
              ) : movements.length === 0 ? (
                <div className="empty-history">No stock movements recorded yet for this item.</div>
              ) : (
                <div className="movements-list">
                  {movements.map((m) => (
                    <div key={m.id} className="movement-item-card">
                      <span className="movement-badge-icon">{getMovementIcon(m.type)}</span>
                      <div className="movement-details">
                        <div className="movement-top-info">
                          <span className={`qty-indicator ${m.quantity > 0 ? "positive" : "negative"}`}>
                            {m.quantity > 0 ? "+" : ""}{m.quantity}
                          </span>
                          <span className="stock-flow">
                            {m.previousStock} → {m.newStock}
                          </span>
                        </div>
                        <p className="movement-reason">{m.reason}</p>
                        <p className="movement-meta">
                          {new Date(m.createdAt + (m.createdAt.endsWith("Z") ? "" : "Z")).toLocaleString()}
                          {m.orderId && ` · Order #ORD-${m.orderId}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setHistoryModal({ open: false, variantId: 0, productName: "", size: "" })}
                className="btn-cancel"
                style={{ width: "100%" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .stock-container { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .page-header { margin-bottom: 28px; }
        .page-title { font-size: 32px; font-weight: 950; color: var(--admin-text-main); margin: 0 0 4px; }
        .page-subtitle { font-size: 13.5px; color: var(--admin-text-muted); margin: 0; }

        /* Summary Cards Grid */
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 28px; }
        .summary-card {
          background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg);
          padding: 22px; display: flex; align-items: center; gap: 16px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .summary-card:hover { transform: translateY(-2px); border-color: var(--admin-accent-gold); box-shadow: 0 10px 24px rgba(15,23,42,0.03); }
        .card-icon {
          width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
        }
        .card-value { display: block; font-size: 24px; font-weight: 800; line-height: 1.1; margin-bottom: 4px; font-family: var(--font-display); }
        .card-label { display: block; font-size: 11.5px; color: var(--admin-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        .card-blue .card-icon { background: #eff6ff; }
        .card-blue .card-value { color: var(--admin-primary); }
        .card-green .card-icon { background: #f0fdf4; }
        .card-green .card-value { color: #16a34a; }
        .card-yellow .card-icon { background: #fffbeb; }
        .card-yellow .card-value { color: #d97706; }
        .card-red .card-icon { background: #fef2f2; }
        .card-red .card-value { color: #dc2626; }

        /* Toolbar Section */
        .toolbar-section { 
          background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg); 
          margin-bottom: 20px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 16px 20px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.01);
        }
        .search-box { position: relative; flex: 1; min-width: 260px; }
        .search-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); }
        .toolbar-input {
          width: 100%; padding: 11px 16px 11px 40px; background: #ffffff; border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md); color: var(--admin-text-main); outline: none; font-size: 13.5px;
          font-family: var(--font-body); transition: border-color 0.2s;
        }
        .toolbar-input:focus { border-color: var(--admin-accent-gold-dark); box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.1); }

        .filter-buttons { display: flex; gap: 8px; }
        .filter-btn {
          padding: 9px 14px; border-radius: var(--admin-radius-md); border: 1.5px solid var(--admin-border); cursor: pointer;
          font-size: 12px; font-weight: 700; background: #ffffff; color: var(--admin-text-muted);
          transition: all 0.2s; font-family: var(--font-body);
        }
        .filter-btn:hover { border-color: var(--admin-accent-gold-dark); color: var(--admin-text-main); }
        .filter-btn.active {
          background: var(--admin-primary); border-color: var(--admin-primary); color: #ffffff;
        }

        /* Products Table */
        .table-card { background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg); overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.01); }
        .table-responsive { overflow-x: auto; }
        .stock-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .stock-table th {
          color: var(--admin-text-muted); font-weight: 700; padding: 16px 20px; border-bottom: 1px solid var(--admin-border);
          text-transform: uppercase; font-size: 11px; letter-spacing: 0.8px; text-align: left; background: #f8fafc;
        }
        .stock-table td { padding: 16px 20px; border-bottom: 1px solid var(--admin-border); color: var(--admin-text-main); vertical-align: middle; }
        .empty-row { text-align: center; padding: 48px; color: var(--admin-text-muted); }

        .product-row { cursor: pointer; transition: background-color 0.15s; }
        .product-row:hover { background-color: rgba(15,23,42,0.01); }
        .product-row.row-expanded { background-color: #fafbfc; }

        .expand-arrow { display: inline-block; transition: transform 0.2s; font-size: 10px; color: #cbd5e1; }
        .expand-arrow.rotated { transform: rotate(90deg); color: var(--admin-text-main); }

        .product-info-cell { display: flex; align-items: center; gap: 14px; }
        .product-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: var(--admin-radius-md); border: 1.5px solid var(--admin-border); background: #f1f5f9; }
        .product-title-name { font-weight: 700; color: var(--admin-text-main); font-size: 14.5px; }
        
        .category-cell-text { color: var(--admin-text-muted); font-weight: 500; }
        .bold-count { font-family: var(--font-display); font-weight: 800; font-size: 14px; color: var(--admin-text-main); }
        .bold-avail { font-family: var(--font-display); font-weight: 700; font-size: 14px; color: var(--admin-text-muted); }

        /* Variant Row Specifics */
        .variant-row { background: #fafbfc; }
        .variant-row td { padding: 12px 20px; border-bottom: 1px dashed var(--admin-border); }
        .variant-details-cell { padding-left: 48px !important; }
        .variant-spec-wrapper { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--admin-text-muted); }
        .color-dot { width: 14px; height: 14px; border-radius: 4px; border: 1px solid var(--admin-border); display: inline-block; flex-shrink: 0; }
        .variant-count-bold { font-family: var(--font-display); font-weight: 700; font-size: 13.5px; color: var(--admin-text-main); }
        .variant-avail-bold { font-family: var(--font-display); font-weight: 600; font-size: 13.5px; color: var(--admin-text-muted); }

        .variant-actions { display: flex; gap: 6px; justify-content: center; }
        .variant-btn {
          padding: 6px 12px; border-radius: 6px; border: 1.5px solid var(--admin-border);
          background: #ffffff; cursor: pointer; font-size: 11px; font-weight: 700; transition: all 0.2s;
          font-family: var(--font-body);
        }
        .btn-adjust { color: var(--admin-accent-gold-dark); }
        .btn-adjust:hover { border-color: var(--admin-accent-gold); background: rgba(197, 168, 128, 0.05); }
        .btn-history { color: var(--admin-text-muted); }
        .btn-history:hover { border-color: #cbd5e1; background: #f8fafc; color: var(--admin-text-main); }

        .status-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 8px; font-size: 10.5px; font-weight: 700;
        }
        .status-instock { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .status-lowstock { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
        .status-outofstock { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        .action-toggle-link { font-size: 12px; color: var(--admin-accent-gold-dark); font-weight: 700; cursor: pointer; }
        .action-toggle-link:hover { text-decoration: underline; }

        .text-center { text-align: center; }

        /* Modals & Popups */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(8px);
          zIndex: 9990; display: flex; align-items: center; justify-content: center; padding: 16px;
          animation: fadeIn 0.2s ease;
        }
        .modal-card {
          background: #ffffff; borderRadius: var(--admin-radius-lg); padding: 32px; maxWidth: 440px; width: 100%;
          boxShadow: 0 24px 48px rgba(15,23,42,0.12); border: 1.5px solid var(--admin-border);
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .history-modal-card { maxWidth: 560px; display: flex; flex-direction: column; max-height: 80vh; overflow: hidden; }

        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .modal-title { font-size: 18px; font-weight: 850; color: var(--admin-text-main); margin: 0 0 2px; }
        .modal-subtitle { font-size: 12px; color: var(--admin-text-muted); margin: 0; }
        .modal-close { background: none; border: none; color: var(--admin-text-muted); font-size: 16px; cursor: pointer; padding: 4px; }
        .modal-close:hover { color: var(--admin-text-main); }

        .modal-body { display: flex; flex-direction: column; gap: 16px; }
        .scrollable-body { overflow-y: auto; flex: 1; padding-right: 4px; }
        
        .current-stats-box {
          background: #f8fafc; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-md); padding: 14px;
        }
        .stat-line { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
        .stat-line:last-child { margin-bottom: 0; }
        .stat-label { color: var(--admin-text-muted); font-weight: 500; }
        .stat-val { color: var(--admin-text-main); font-weight: 700; font-family: var(--font-display); }

        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12.5px; font-weight: 700; color: var(--admin-text-main); }
        .form-help { font-size: 11px; color: var(--admin-text-muted); margin: 0; }
        .form-input {
          width: 100%; padding: 11px 14px; border: 1.5px solid var(--admin-border); border-radius: var(--admin-radius-md);
          font-size: 13.5px; color: var(--admin-text-main); outline: none; background: #ffffff; font-family: var(--font-body);
        }
        .form-input:focus { border-color: var(--admin-accent-gold-dark); box-shadow: 0 0 0 3px rgba(197,168,128,0.1); }

        .preview-box {
          border-radius: var(--admin-radius-md); padding: 12px; font-size: 13px; font-weight: 600;
          display: flex; flex-direction: column; gap: 4px;
        }
        .preview-box.positive { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .preview-box.negative { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .stock-warning { color: #dc2626; font-size: 11px; font-weight: 700; }

        .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
        .btn-cancel {
          flex: 1; padding: 11px; background: #f8fafc; border: 1px solid var(--admin-border); color: var(--admin-text-muted);
          border-radius: var(--admin-radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 13px;
        }
        .btn-cancel:hover { background: #f1f5f9; color: var(--admin-text-main); }
        
        .btn-submit {
          flex: 1; padding: 11px; background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-light)); border: none;
          color: #fff; border-radius: var(--admin-radius-md); font-weight: 700; cursor: pointer; transition: all 0.2s;
          font-size: 13px; box-shadow: 0 4px 12px rgba(15,23,42,0.1);
        }
        .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(15,23,42,0.15); }
        .btn-submit:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

        /* History items styling */
        .empty-history { text-align: center; padding: 36px; color: var(--admin-text-muted); font-size: 13.5px; }
        .loading-spinner-state { text-align: center; padding: 40px; color: var(--admin-text-muted); font-size: 13px; }
        .spinner-glow {
          width: 24px; height: 24px; border: 2px dashed var(--admin-accent-gold); border-radius: 50%;
          animation: spin 1s linear infinite; margin: 0 auto 12px;
        }

        .movements-list { display: flex; flex-direction: column; gap: 10px; }
        .movement-item-card {
          display: flex; gap: 12px; padding: 12px 16px; background: #f8fafc;
          border: 1px solid var(--admin-border); border-radius: var(--admin-radius-md);
        }
        .movement-badge-icon { font-size: 18px; margin-top: 2px; }
        .movement-details { flex: 1; }
        .movement-top-info { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        
        .qty-indicator {
          font-size: 10.5px; font-weight: 800; padding: 2px 8px; border-radius: 6px;
        }
        .qty-indicator.positive { background: #f0fdf4; color: #16a34a; }
        .qty-indicator.negative { background: #fef2f2; color: #dc2626; }
        
        .stock-flow { font-size: 11.5px; color: var(--admin-text-muted); font-weight: 700; font-family: var(--font-display); }
        .movement-reason { font-size: 13px; color: var(--admin-text-main); font-weight: 600; margin: 0 0 4px; }
        .movement-meta { font-size: 10.5px; color: var(--admin-text-muted); margin: 0; font-weight: 500; }

        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
