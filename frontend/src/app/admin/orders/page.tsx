"use client";

import { useState, useEffect } from "react";
import { ordersAPI } from "@/lib/api";
import { showToast } from "@/lib/adminUtils";
import Link from "next/link";

interface OrderItem { id: number; productName: string; quantity: number; price: number; }
interface Order {
  id: number; orderDate: string; totalAmount: number; status: string; items: OrderItem[];
  firstName?: string; lastName?: string; email?: string; phone?: string;
  country?: string; state?: string; city?: string; postalCode?: string;
  address?: string; orderNote?: string; shippingAddress?: string;
}

const STATUS_OPTIONS = ["Pending", "Approved", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      showToast("Failed to load orders", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId} → ${newStatus}`, "success");
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      showToast("Failed to update order status", "error");
    }
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved": case "completed": case "delivered": return "badge-green";
      case "shipped": return "badge-blue";
      case "pending": return "badge-yellow";
      case "cancelled": return "badge-red";
      default: return "badge-gray";
    }
  };

  const formatCurrency = (amount: number) =>
    `Rs. ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "" || order.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = order.id.toString().includes(searchTerm) ||
      order.items?.some((item) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = orders.filter((o) => o.status?.toLowerCase() === "pending").length;

  return (
    <div className="orders-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">
            {orders.length} total orders
            {pendingCount > 0 && <span className="pending-pill">{pendingCount} pending</span>}
          </p>
        </div>
      </header>

      {/* Status Tabs */}
      <div className="status-tabs">
        <button className={`tab ${statusFilter === "" ? "active" : ""}`} onClick={() => setStatusFilter("")}>
          All <span className="tab-count">{orders.length}</span>
        </button>
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status?.toLowerCase() === s.toLowerCase()).length;
          if (count === 0) return null;
          return (
            <button key={s} className={`tab ${statusFilter.toLowerCase() === s.toLowerCase() ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
              {s} <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <svg className="search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search by Order ID or product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="toolbar-input" />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-skeleton">
            {[1,2,3,4].map((i) => (
              <div key={i} className="skeleton-row">
                <div className="shimmer" style={{width:40,height:14}} />
                <div className="shimmer" style={{width:'25%',height:14}} />
                <div className="shimmer" style={{width:60,height:14}} />
                <div className="shimmer" style={{width:70,height:24,borderRadius:6}} />
                <div className="shimmer" style={{width:100,height:30,marginLeft:'auto',borderRadius:8}} />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">📭</span><p>No orders found</p></div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div key={order.id} className={`order-card ${isExpanded ? "expanded" : ""}`}>
                  <div className="order-main" onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                    <div className="order-left">
                      <span className="order-id">#{order.id}</span>
                      <div className="order-meta">
                        <span className="order-date">
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                        </span>
                        <span className="meta-dot">·</span>
                        <span className="order-items-count">{order.items?.length || 0} items</span>
                      </div>
                    </div>
                    <div className="order-center">
                      <span className="order-total">{formatCurrency(order.totalAmount || 0)}</span>
                    </div>
                    <div className="order-right">
                      <span className={`badge ${getStatusClass(order.status)}`}>{order.status}</span>
                      <select
                        value={order.status}
                        onChange={(e) => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        className="status-select"
                      >
                        {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                      <svg className={`chevron ${isExpanded ? "rotated" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="order-details">
                      <div className="order-expanded-content">
                        <div className="expanded-col-items">
                          <div className="details-header">
                            <span className="details-label">Order Items</span>
                          </div>
                          <div className="items-list">
                            {order.items?.map((item) => (
                              <div key={item.id} className="item-row">
                                <span className="item-name">{item.productName}</span>
                                <span className="item-qty">×{item.quantity}</span>
                                <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="expanded-col-shipping">
                          <div className="details-header">
                            <span className="details-label">Delivery & Contact</span>
                            <Link href={`/admin/orders/${order.id}`} className="details-link">Full Details →</Link>
                          </div>
                          <div className="shipping-info-box">
                            <div className="shipping-info-item">
                              <span className="shipping-info-label">Customer:</span>
                              <span className="shipping-info-value">{order.firstName} {order.lastName}</span>
                            </div>
                            <div className="shipping-info-item">
                              <span className="shipping-info-label">Phone:</span>
                              <span className="shipping-info-value">{order.phone || "—"}</span>
                            </div>
                            <div className="shipping-info-item">
                              <span className="shipping-info-label">Address:</span>
                              <span className="shipping-info-value">
                                {order.address || "—"}{order.city && `, ${order.city}`}{order.postalCode && ` (${order.postalCode})`}
                              </span>
                            </div>
                            {order.orderNote && (
                              <div className="shipping-info-item">
                                <span className="shipping-info-label">Note:</span>
                                <span className="shipping-info-value italic">"{order.orderNote}"</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .orders-container { max-width: 1200px; margin: 0 auto; }
        .page-header { margin-bottom: 24px; }
        .page-title { font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
        .page-subtitle { font-size: 13px; color: #64748b; margin: 0; display: flex; align-items: center; gap: 8px; }
        .pending-pill { background: rgba(234,179,8,0.15); color: #d97706; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }

        .status-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
        .tab {
          padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;
          background: transparent; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .tab:hover { border-color: #cbd5e1; color: #334155; }
        .tab.active { background: #2563eb; border-color: #2563eb; color: #fff; }
        .tab-count { font-size: 10px; opacity: 0.7; }

        .toolbar { margin-bottom: 16px; }
        .search-box { position: relative; max-width: 380px; }
        .search-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .toolbar-input { width: 100%; padding: 11px 16px 11px 40px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; color: #0f172a; outline: none; font-size: 13px; }
        .toolbar-input:focus { border-color: #3b82f6; }

        .table-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .loading-skeleton { padding: 8px 24px; }
        .skeleton-row { display: flex; align-items: center; gap: 20px; padding: 18px 0; border-bottom: 1px solid #e2e8f0; }
        .empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
        .empty-icon { font-size: 32px; display: block; margin-bottom: 10px; }

        .orders-list { display: flex; flex-direction: column; }
        .order-card { border-bottom: 1px solid #e2e8f0; transition: background 0.15s; }
        .order-card:last-child { border-bottom: none; }
        .order-card.expanded { background: rgba(15,23,42,0.01); }

        .order-main {
          display: flex; align-items: center; padding: 16px 20px; cursor: pointer;
          gap: 16px; transition: background 0.15s;
        }
        .order-main:hover { background: rgba(15,23,42,0.015); }

        .order-left { flex: 1; }
        .order-id { font-weight: 700; color: #2563eb; font-size: 14px; display: block; margin-bottom: 2px; }
        .order-meta { display: flex; align-items: center; gap: 6px; }
        .order-date { font-size: 12px; color: #64748b; }
        .meta-dot { color: #cbd5e1; font-size: 8px; }
        .order-items-count { font-size: 12px; color: #64748b; }

        .order-center { min-width: 90px; }
        .order-total { font-family: 'SF Mono', monospace; font-weight: 600; color: #0f172a; font-size: 14px; }

        .order-right { display: flex; align-items: center; gap: 10px; }
        .badge { display: inline-flex; padding: 3px 9px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-green { background: #f0fdf4; color: #16a34a; }
        .badge-blue { background: #eff6ff; color: #2563eb; }
        .badge-yellow { background: #fffbeb; color: #d97706; }
        .badge-red { background: #fef2f2; color: #dc2626; }
        .badge-gray { background: #f1f5f9; color: #475569; }

        .status-select {
          padding: 5px 10px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;
          color: #475569; font-size: 11px; outline: none; cursor: pointer;
        }
        .status-select:focus { border-color: #2563eb; }

        .chevron { color: #94a3b8; transition: transform 0.2s; flex-shrink: 0; }
        .chevron.rotated { transform: rotate(180deg); color: #475569; }

        .order-details { padding: 0 20px 16px; animation: slideDown 0.2s ease; }
        .details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0; }
        .details-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .details-link { font-size: 12px; font-weight: 600; color: #2563eb; text-decoration: none; }
        .details-link:hover { text-decoration: underline; }

        .items-list { display: flex; flex-direction: column; gap: 6px; }
        .item-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; font-size: 13px; }
        .item-name { flex: 1; color: #334155; font-weight: 500; }
        .item-qty { color: #64748b; min-width: 40px; text-align: center; }
        .item-price { font-family: 'SF Mono', monospace; color: #475569; min-width: 80px; text-align: right; }

        .order-expanded-content { display: flex; gap: 24px; padding-top: 8px; }
        .expanded-col-items { flex: 1.2; min-width: 280px; }
        .expanded-col-shipping { flex: 1; min-width: 260px; border-left: 1px dashed #e2e8f0; padding-left: 24px; }
        .shipping-info-box { display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #334155; }
        .shipping-info-item { display: flex; flex-direction: column; gap: 2px; }
        .shipping-info-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .shipping-info-value { font-weight: 500; color: #334155; line-height: 1.4; }
        .shipping-info-value.italic { font-style: italic; color: #64748b; }

        @media (max-width: 768px) {
          .order-expanded-content { flex-direction: column; gap: 18px; }
          .expanded-col-shipping { border-left: none; padding-left: 0; border-top: 1px dashed #e2e8f0; padding-top: 18px; }
        }

        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 800px; } }

        @media (max-width: 640px) {
          .order-main { flex-wrap: wrap; }
          .order-right { width: 100%; justify-content: flex-end; margin-top: 8px; }
        }
      `}</style>
    </div>
  );
}
