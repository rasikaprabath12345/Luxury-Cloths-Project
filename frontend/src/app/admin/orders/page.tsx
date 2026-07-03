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

  const getStatusStep = (status: string) => {
    const steps = ["pending", "approved", "shipped", "delivered"];
    return steps.indexOf(status?.toLowerCase());
  };

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

      <div className="orders-card-wrapper">
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
              const currentStep = getStatusStep(order.status);
              
              return (
                <div key={order.id} className={`order-card-row ${isExpanded ? "expanded" : ""}`}>
                  <div className="order-main" onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                    <div className="order-left">
                      <span className="order-id">#{order.id}</span>
                      <div className="order-meta">
                        <span className="order-date">
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                        </span>
                        <span className="meta-dot">·</span>
                        <span className="order-items-count">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
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
                      {/* Flow Timeline Progress Tracker */}
                      {order.status?.toLowerCase() !== "cancelled" && (
                        <div className="timeline-container">
                          {["Pending", "Approved", "Shipped", "Delivered"].map((step, idx) => {
                            const isDone = idx <= currentStep;
                            const isCurr = idx === currentStep;
                            return (
                              <div key={step} className={`timeline-node ${isDone ? "done" : ""} ${isCurr ? "current" : ""}`}>
                                <div className="node-circle">{isDone ? "✓" : idx + 1}</div>
                                <span className="node-text">{step}</span>
                                {idx < 3 && <div className="node-connector" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

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
                            <span className="details-label">Fulfillment Details</span>
                            <Link href={`/admin/orders/${order.id}`} className="details-link">Manage Order →</Link>
                          </div>
                          <div className="shipping-info-box">
                            <div className="shipping-info-item">
                              <span className="shipping-info-label">Recipient:</span>
                              <span className="shipping-info-value">{order.firstName} {order.lastName}</span>
                            </div>
                            <div className="shipping-info-item">
                              <span className="shipping-info-label">Contact Phone:</span>
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
                                <span className="shipping-info-label">Special instructions:</span>
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
        .orders-container { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        
        .page-header { margin-bottom: 28px; }
        .page-title { font-size: 32px; font-weight: 900; color: var(--admin-text-main); margin: 0 0 4px; }
        .page-subtitle { font-size: 13.5px; color: var(--admin-text-muted); margin: 0; display: flex; align-items: center; gap: 8px; }
        
        .pending-pill { 
          background: rgba(197, 168, 128, 0.15); color: var(--admin-accent-gold-dark); border: 0.5px solid rgba(197, 168, 128, 0.3);
          padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; 
        }

        .status-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab {
          padding: 10px 16px; border-radius: var(--admin-radius-md); font-size: 12.5px; font-weight: 600; cursor: pointer;
          background: #ffffff; border: 1px solid var(--admin-border); color: var(--admin-text-muted); transition: all 0.25s;
          display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body);
        }
        .tab:hover { border-color: var(--admin-accent-gold-dark); color: var(--admin-text-main); }
        .tab.active { background: var(--admin-primary); border-color: var(--admin-primary); color: #fff; box-shadow: 0 4px 12px rgba(15,23,42,0.1); }
        .tab-count { font-size: 10px; background: rgba(15,23,42,0.06); padding: 2px 6px; border-radius: 6px; }
        .tab.active .tab-count { background: rgba(255,255,255,0.2); }

        .toolbar { margin-bottom: 20px; }
        .search-box { position: relative; max-width: 380px; }
        .search-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); }
        .toolbar-input { 
          width: 100%; padding: 11px 16px 11px 40px; background: #ffffff; border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md); color: var(--admin-text-main); outline: none; font-size: 13.5px;
          font-family: var(--font-body); transition: all 0.2s;
        }
        .toolbar-input:focus { border-color: var(--admin-accent-gold-dark); box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.1); }

        .orders-card-wrapper { background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg); overflow: hidden; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02); }
        .loading-skeleton { padding: 8px 24px; }
        .skeleton-row { display: flex; align-items: center; gap: 20px; padding: 18px 0; border-bottom: 1px solid var(--admin-border); }
        .empty-state { text-align: center; padding: 60px 20px; color: var(--admin-text-muted); }
        .empty-icon { font-size: 32px; display: block; margin-bottom: 10px; }

        .orders-list { display: flex; flex-direction: column; }
        .order-card-row { border-bottom: 1px solid var(--admin-border); transition: background-color 0.2s; }
        .order-card-row:last-child { border-bottom: none; }
        .order-card-row.expanded { background: #fafbfc; }

        .order-main {
          display: flex; align-items: center; padding: 18px 24px; cursor: pointer;
          gap: 16px; transition: background-color 0.2s;
        }
        .order-main:hover { background: rgba(15,23,42,0.01); }

        .order-left { flex: 1; }
        .order-id { font-weight: 800; color: var(--admin-text-main); font-size: 14.5px; display: block; margin-bottom: 2px; }
        .order-meta { display: flex; align-items: center; gap: 6px; }
        .order-date { font-size: 12.5px; color: var(--admin-text-muted); }
        .meta-dot { color: #cbd5e1; font-size: 8px; }
        .order-items-count { font-size: 12.5px; color: var(--admin-text-muted); }

        .order-center { min-width: 100px; }
        .order-total { font-family: var(--font-display); font-weight: 700; color: var(--admin-text-main); font-size: 14.5px; }

        .order-right { display: flex; align-items: center; gap: 12px; }
        
        .badge { 
          display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 8px; font-size: 10px; 
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; 
        }
        .badge-green { background: #f0fdf4; color: #16a34a; }
        .badge-blue { background: #eff6ff; color: #2563eb; }
        .badge-yellow { background: #fffbeb; color: #d97706; }
        .badge-red { background: #fef2f2; color: #dc2626; }
        .badge-gray { background: #f1f5f9; color: #475569; }

        .status-select {
          padding: 6px 12px; background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-sm);
          color: var(--admin-text-muted); font-size: 11.5px; font-weight: 600; outline: none; cursor: pointer;
          font-family: var(--font-body); transition: border-color 0.2s;
        }
        .status-select:focus { border-color: var(--admin-accent-gold); }

        .chevron { color: #cbd5e1; transition: transform 0.2s; flex-shrink: 0; }
        .chevron.rotated { transform: rotate(180deg); color: var(--admin-text-main); }

        .order-details { padding: 10px 24px 24px; border-top: 1px solid var(--admin-border); animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        /* Timeline Tracker Styles */
        .timeline-container {
          display: flex; justify-content: space-between; align-items: center; 
          background: #f8fafc; padding: 18px 24px; border-radius: var(--admin-radius-md); 
          border: 1px solid var(--admin-border); margin-bottom: 20px;
        }
        .timeline-node {
          position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1;
        }
        .node-circle {
          width: 26px; height: 26px; border-radius: 50%; background: #ffffff; border: 2.5px solid #cbd5e1;
          color: #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px;
          font-weight: 800; z-index: 2; transition: all 0.3s;
        }
        .node-text { font-size: 11.5px; font-weight: 700; color: var(--admin-text-muted); transition: color 0.3s; }
        .node-connector {
          position: absolute; top: 12px; left: calc(50% + 13px); width: calc(100% - 26px); height: 3px;
          background: #cbd5e1; z-index: 1; transition: background-color 0.3s;
        }
        .timeline-node.done .node-circle {
          background: #16a34a; border-color: #16a34a; color: #ffffff;
        }
        .timeline-node.done .node-text { color: var(--admin-text-main); }
        .timeline-node.done .node-connector { background: #16a34a; }
        
        .timeline-node.current .node-circle {
          background: #ffffff; border-color: var(--admin-accent-gold-dark); color: var(--admin-accent-gold-dark);
          box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.15);
        }
        .timeline-node.current .node-text { color: var(--admin-accent-gold-dark); }

        .details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1.5px dashed var(--admin-border); }
        .details-label { font-size: 11.5px; font-weight: 800; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
        .details-link { font-size: 12px; font-weight: 700; color: var(--admin-accent-gold-dark); text-decoration: none; }
        .details-link:hover { text-decoration: underline; }

        .items-list { display: flex; flex-direction: column; gap: 8px; }
        .item-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #ffffff; border: 1px solid var(--admin-border); border-radius: 8px; font-size: 13.5px; }
        .item-name { flex: 1; color: var(--admin-text-main); font-weight: 600; }
        .item-qty { color: var(--admin-text-muted); min-width: 40px; text-align: center; font-weight: 500; }
        .item-price { font-family: var(--font-display); color: var(--admin-text-main); min-width: 80px; text-align: right; font-weight: 700; }

        .order-expanded-content { display: flex; gap: 24px; padding-top: 8px; }
        .expanded-col-items { flex: 1.2; min-width: 280px; }
        .expanded-col-shipping { flex: 1; min-width: 260px; border-left: 1px dashed var(--admin-border); padding-left: 24px; }
        .shipping-info-box { display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; color: var(--admin-text-main); }
        .shipping-info-item { display: flex; flex-direction: column; gap: 2px; }
        .shipping-info-label { font-size: 10px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .shipping-info-value { font-weight: 500; color: var(--admin-text-main); line-height: 1.4; }
        .shipping-info-value.italic { font-style: italic; color: var(--admin-text-muted); }

        @media (max-width: 768px) {
          .order-expanded-content { flex-direction: column; gap: 18px; }
          .expanded-col-shipping { border-left: none; padding-left: 0; border-top: 1px dashed var(--admin-border); padding-top: 18px; }
        }

        @media (max-width: 640px) {
          .order-main { flex-wrap: wrap; }
          .order-right { width: 100%; justify-content: flex-end; margin-top: 8px; }
        }
      `}</style>
    </div>
  );
}
