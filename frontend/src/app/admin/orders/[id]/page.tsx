"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import { showToast } from "@/lib/adminUtils";
import Link from "next/link";

interface OrderItem { id: number; productName: string; quantity: number; price: number; productImageUrl?: string; }
interface Order {
  id: number; orderDate: string; totalAmount: number; status: string;
  paymentMethod: string; paymentSlipUrl?: string; userId: number; items: OrderItem[];
  firstName?: string; lastName?: string; email?: string; phone?: string;
  country?: string; state?: string; city?: string; postalCode?: string;
  address?: string; orderNote?: string; shippingAddress?: string;
}

const STATUS_OPTIONS = ["Pending", "Approved", "Shipped", "Delivered", "Cancelled"];

const getAllowedStatusOptions = (currentStatus: string) => {
  const status = currentStatus?.toLowerCase();
  switch (status) {
    case "pending":
      return ["Pending", "Approved", "Cancelled"];
    case "approved":
      return ["Approved", "Shipped", "Cancelled"];
    case "shipped":
      return ["Shipped", "Delivered", "Cancelled"];
    case "delivered":
      return ["Delivered"];
    case "cancelled":
      return ["Cancelled"];
    default:
      return STATUS_OPTIONS;
  }
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    async function fetchOrderDetail() {
      try {
        const response = await ordersAPI.getOrderById(parseInt(orderId));
        setOrder(response.data);
      } catch (error) {
        showToast("Failed to load order details", "error");
      } finally { setLoading(false); }
    }
    fetchOrderDetail();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      await ordersAPI.updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      showToast(`Order #${order.id} → ${newStatus}`, "success");
    } catch (error) {
      showToast("Failed to update order status", "error");
    } finally { setUpdating(false); }
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

  const getStatusStep = (status: string) => {
    const steps = ["pending", "approved", "shipped", "delivered"];
    return steps.indexOf(status?.toLowerCase());
  };  return (
    <div className="detail-container">
      <div className="detail-navigation no-print">
        <Link href="/admin/orders" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Orders
        </Link>
        
        <button onClick={() => window.print()} className="btn-print no-print">
          🖨️ Print Invoice
        </button>
      </div>

      {loading ? (
        <div className="loading-grid">
          <div className="shimmer" style={{width:'100%',height:300,borderRadius:16}} />
          <div className="shimmer" style={{width:'100%',height:250,borderRadius:16}} />
        </div>
      ) : !order ? (
        <div className="not-found">
          <span className="nf-icon">🔍</span>
          <h2>Order Not Found</h2>
          <p>This order may have been removed or doesn&apos;t exist.</p>
        </div>
      ) : (
        <>
          {/* Printable Invoice Header */}
          <div className="print-only-header">
            <div className="print-brand">
              <h1>LUXURY.LK</h1>
              <p>Premium Boutique</p>
            </div>
            <div className="print-invoice-meta">
              <h2>INVOICE</h2>
              <p>Order ID: <strong>#ORD-{order.id}</strong></p>
              <p>Date: <strong>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}</strong></p>
            </div>
          </div>

          <div className="detail-title-row no-print">
            <div>
              <h1 className="detail-title">Order #{order.id}</h1>
              <p className="detail-date">
                Placed {order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "N/A"}
              </p>
            </div>
            <span className={`badge-lg ${getStatusClass(order.status)}`}>{order.status}</span>
          </div>

          {/* Status Timeline */}
          {order.status?.toLowerCase() !== "cancelled" && (
            <div className="status-timeline no-print">
              {["Pending", "Approved", "Shipped", "Delivered"].map((step, i) => {
                const current = getStatusStep(order.status);
                const isActive = i <= current;
                const isCurrent = i === current;
                return (
                  <div key={step} className={`timeline-step ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}>
                    <div className="step-dot">{isActive ? "✓" : (i + 1)}</div>
                    <span className="step-label">{step}</span>
                    {i < 3 && <div className={`step-line ${i < current ? "filled" : ""}`} />}
                  </div>
                );
              })}
            </div>
          )}

          <div className="detail-grid">
            {/* Items Card */}
            <div className="card items-card">
              <h2 className="card-heading">Order Items</h2>
              <div className="items-list">
                {order.items?.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-thumb-wrap">
                      {item.productImageUrl ? (
                        <img src={item.productImageUrl} alt={item.productName} className="item-thumb" />
                      ) : (
                        <div className="item-thumb-placeholder">🖼</div>
                      )}
                    </div>
                    <div className="item-left">
                      <span className="item-name">{item.productName}</span>
                      <span className="item-unit">{formatCurrency(item.price)} × {item.quantity}</span>
                    </div>
                    <span className="item-total">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="total-row">
                <span>Grand Total</span>
                <span className="total-value">{formatCurrency(order.totalAmount || 0)}</span>
              </div>
            </div>

            {/* Right Column: Info Card & Shipping Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Info Card */}
              <div className="card info-card">
                <h2 className="card-heading no-print">Order Status</h2>
                <div className="info-list">
                  <div className="info-item no-print">
                    <span className="info-label">Update Status</span>
                    <select
                      value={order.status} 
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updating || order.status?.toLowerCase() === "delivered" || order.status?.toLowerCase() === "cancelled"} 
                      className="status-select"
                    >
                      {getAllowedStatusOptions(order.status).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Payment Method</span>
                    <span className="info-value capitalize">{order.paymentMethod || "—"}</span>
                  </div>
                  <div className="info-item print-only">
                    <span className="info-label">Fulfillment Status</span>
                    <span className="info-value">{order.status}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Customer ID</span>
                    <span className="info-value mono">#{order.userId}</span>
                  </div>
                  {order.paymentSlipUrl && (
                    <div className="info-item no-print">
                      <span className="info-label">Bank Receipt</span>
                      <a href={order.paymentSlipUrl} target="_blank" rel="noopener noreferrer" className="receipt-btn">
                        🖼️ View Bank Slip Image
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping & Contact Card */}
              <div className="card shipping-card">
                <h2 className="card-heading">Delivery Address</h2>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Customer Name</span>
                    <span className="info-value">{order.firstName} {order.lastName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{order.email || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{order.phone || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Delivery Address</span>
                    <span className="info-value" style={{ lineHeight: "1.6" }}>
                      {order.address}<br />
                      {order.city && `${order.city}, `}{order.state && `${order.state}, `}{order.country || ""}<br />
                      {order.postalCode && `Postal Code: ${order.postalCode}`}
                    </span>
                  </div>
                  {order.shippingAddress && order.shippingAddress !== order.address && (
                    <div className="info-item">
                      <span className="info-label">Alternative Shipping Address</span>
                      <span className="info-value">{order.shippingAddress}</span>
                    </div>
                  )}
                  {order.orderNote && (
                    <div className="info-item">
                      <span className="info-label">Special instructions</span>
                      <span className="info-value" style={{ fontStyle: "italic", color: "var(--admin-text-muted)" }}>
                        "{order.orderNote}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .detail-container { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .detail-navigation { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        
        .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--admin-text-muted); text-decoration: none; font-size: 13.5px; font-weight: 700; transition: color 0.2s; }
        .back-link:hover { color: var(--admin-accent-gold-dark); }

        .btn-print {
          background: linear-gradient(135deg, var(--admin-accent-gold-dark), var(--admin-accent-gold));
          color: #ffffff; border: none; font-size: 13px; font-weight: 700; padding: 10px 18px;
          border-radius: var(--admin-radius-md); cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(197, 168, 128, 0.25);
        }
        .btn-print:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(197, 168, 128, 0.35); }

        .loading-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; }
        @media (max-width: 768px) { .loading-grid { grid-template-columns: 1fr; } }

        .not-found { text-align: center; padding: 80px 20px; color: var(--admin-text-muted); }
        .nf-icon { font-size: 40px; display: block; margin-bottom: 16px; }
        .not-found h2 { color: var(--admin-text-main); font-size: 20px; margin: 0 0 6px; }
        .not-found p { margin: 0; font-size: 14px; }

        .detail-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .detail-title { font-size: 32px; font-weight: 900; color: var(--admin-text-main); margin: 0 0 4px; }
        .detail-date { font-size: 13.5px; color: var(--admin-text-muted); margin: 0; }
        
        .badge-lg { padding: 6px 14px; border-radius: var(--admin-radius-md); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-green { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .badge-blue { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
        .badge-yellow { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
        .badge-red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .badge-gray { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

        /* Status Timeline */
        .status-timeline { 
          display: flex; align-items: flex-start; gap: 0; margin-bottom: 28px; padding: 24px; 
          background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg); 
          overflow-x: auto; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02); 
        }
        .timeline-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
        .step-dot {
          width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; background: #ffffff; border: 2.5px solid #e2e8f0; color: var(--admin-text-muted); transition: all 0.3s; z-index: 1;
        }
        .timeline-step.active .step-dot { background: #16a34a; border-color: #16a34a; color: #fff; }
        .timeline-step.current .step-dot { background: #ffffff; border-color: var(--admin-accent-gold-dark); color: var(--admin-accent-gold-dark); box-shadow: 0 0 12px rgba(197,168,128,0.25); }
        .step-label { font-size: 11.5px; color: var(--admin-text-muted); margin-top: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .timeline-step.active .step-label { color: var(--admin-text-main); }
        .timeline-step.current .step-label { color: var(--admin-accent-gold-dark); }
        .step-line { position: absolute; top: 15px; left: calc(50% + 18px); width: calc(100% - 36px); height: 3px; background: #e2e8f0; }
        .step-line.filled { background: #16a34a; }

        .detail-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; }
        @media (max-width: 860px) { .detail-grid { grid-template-columns: 1fr; } }

        .card { background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg); padding: 28px; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02); }
        .card-heading { font-size: 17px; font-weight: 800; color: var(--admin-text-main); margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1.5px solid var(--admin-border); }

        .items-list { display: flex; flex-direction: column; gap: 0; }
        .item-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--admin-border); gap: 14px; }
        .item-row:last-child { border-bottom: none; }
        .item-thumb-wrap { flex-shrink: 0; width: 90px; height: 90px; border-radius: 10px; overflow: hidden; border: 1px solid var(--admin-border); background: #f8fafc; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
        .item-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
        .item-thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 30px; color: #cbd5e1; }
        .item-left { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .item-name { font-weight: 700; color: var(--admin-text-main); font-size: 14.5px; }
        .item-unit { font-size: 12.5px; color: var(--admin-text-muted); font-weight: 500; }
        .item-total { font-family: var(--font-display); font-weight: 700; color: var(--admin-text-main); font-size: 14.5px; }

        .total-row { display: flex; justify-content: space-between; align-items: center; padding: 20px 0 0; border-top: 2px solid var(--admin-border); margin-top: 10px; font-weight: 800; }
        .total-row span { color: var(--admin-text-muted); font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .total-value { font-family: var(--font-display); font-size: 22px; color: var(--admin-accent-gold-dark); }

        .info-list { display: flex; flex-direction: column; gap: 18px; }
        .info-item { display: flex; flex-direction: column; gap: 6px; }
        .info-label { font-size: 10px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
        .info-value { font-size: 14px; color: var(--admin-text-main); font-weight: 600; }
        .capitalize { text-transform: capitalize; }
        .mono { font-family: var(--font-display); }

        .status-select { 
          width: 100%; padding: 11px 14px; background: #ffffff; border: 1.5px solid var(--admin-border); 
          border-radius: var(--admin-radius-md); color: var(--admin-text-main); font-size: 13.5px; 
          font-weight: 600; outline: none; cursor: pointer; font-family: var(--font-body);
        }
        .status-select:focus { border-color: var(--admin-accent-gold-dark); }

        .receipt-btn { 
          display: inline-flex; justify-content: center; padding: 11px 16px; background: #ffffff; 
          border: 1.5px solid var(--admin-border); border-radius: var(--admin-radius-md); 
          color: var(--admin-accent-gold-dark); text-decoration: none; font-size: 13px; font-weight: 700; 
          transition: all 0.2s; 
        }
        .receipt-btn:hover { border-color: var(--admin-accent-gold-dark); background: rgba(197, 168, 128, 0.05); }

        .print-only-header { display: none; }
        .print-only { display: none; }

        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 12px;
          }
          .no-print { display: none !important; }
          .print-only-header { 
            display: flex; justify-content: space-between; align-items: flex-end; 
            border-bottom: 3px double #000000; padding-bottom: 20px; margin-bottom: 30px; 
          }
          .print-brand h1 { font-family: var(--font-display); font-size: 28px; font-weight: 900; margin: 0; }
          .print-brand p { font-size: 11px; text-transform: uppercase; margin: 0; color: #555; }
          .print-invoice-meta h2 { font-size: 22px; font-weight: 800; margin: 0 0 6px; text-align: right; }
          .print-invoice-meta p { font-size: 11px; margin: 2px 0; text-align: right; }
          
          .print-only { display: flex !important; }
          
          .detail-grid { display: grid; grid-template-columns: 1fr; gap: 30px; }
          .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          .card-heading { border-bottom: 2px solid #000000 !important; padding-bottom: 8px; font-size: 14px; }
          .total-row { border-top: 2px solid #000000 !important; }
          .total-value { color: #000000 !important; font-size: 18px; }
          .info-list { gap: 12px; }
          .info-item { gap: 2px; }
          .info-label { font-size: 9px; color: #555; }
          .info-value { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
