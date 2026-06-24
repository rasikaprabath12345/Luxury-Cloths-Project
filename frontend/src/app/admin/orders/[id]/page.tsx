"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import { showToast } from "@/lib/adminUtils";
import Link from "next/link";

interface OrderItem { id: number; productName: string; quantity: number; price: number; }
interface Order {
  id: number; orderDate: string; totalAmount: number; status: string;
  paymentMethod: string; paymentSlipUrl?: string; userId: number; items: OrderItem[];
}

const STATUS_OPTIONS = ["Pending", "Approved", "Shipped", "Delivered", "Cancelled"];

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
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const getStatusStep = (status: string) => {
    const steps = ["pending", "approved", "shipped", "delivered"];
    return steps.indexOf(status?.toLowerCase());
  };

  return (
    <div className="detail-container">
      <Link href="/admin/orders" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to Orders
      </Link>

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
          <div className="detail-title-row">
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
            <div className="status-timeline">
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
            <div className="card">
              <h2 className="card-heading">Order Items</h2>
              <div className="items-list">
                {order.items?.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-left">
                      <span className="item-name">{item.productName}</span>
                      <span className="item-unit">{formatCurrency(item.price)} × {item.quantity}</span>
                    </div>
                    <span className="item-total">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="total-row">
                <span>Total</span>
                <span className="total-value">{formatCurrency(order.totalAmount || 0)}</span>
              </div>
            </div>

            {/* Info Card */}
            <div className="card">
              <h2 className="card-heading">Order Information</h2>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Update Status</span>
                  <select
                    value={order.status} onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating} className="status-select"
                  >
                    {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div className="info-item">
                  <span className="info-label">Payment Method</span>
                  <span className="info-value capitalize">{order.paymentMethod || "—"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Customer ID</span>
                  <span className="info-value mono">#{order.userId}</span>
                </div>
                {order.paymentSlipUrl && (
                  <div className="info-item">
                    <span className="info-label">Payment Receipt</span>
                    <a href={order.paymentSlipUrl} target="_blank" rel="noopener noreferrer" className="receipt-btn">
                      🖼️ View Receipt
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .detail-container { max-width: 1200px; margin: 0 auto; }

        .back-link { display: inline-flex; align-items: center; gap: 6px; color: #64748b; text-decoration: none; font-size: 13px; font-weight: 500; margin-bottom: 20px; transition: color 0.2s; }
        .back-link:hover { color: #2563eb; }

        .loading-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; }
        @media (max-width: 768px) { .loading-grid { grid-template-columns: 1fr; } }

        .not-found { text-align: center; padding: 80px 20px; color: #64748b; }
        .nf-icon { font-size: 40px; display: block; margin-bottom: 16px; }
        .not-found h2 { color: #0f172a; font-size: 20px; margin: 0 0 6px; }
        .not-found p { margin: 0; font-size: 14px; }

        .detail-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .detail-title { font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
        .detail-date { font-size: 13px; color: #64748b; margin: 0; }
        .badge-lg { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-green { background: #f0fdf4; color: #16a34a; }
        .badge-blue { background: #eff6ff; color: #2563eb; }
        .badge-yellow { background: #fffbeb; color: #d97706; }
        .badge-red { background: #fef2f2; color: #dc2626; }
        .badge-gray { background: #f1f5f9; color: #475569; }

        /* Status Timeline */
        .status-timeline { display: flex; align-items: flex-start; gap: 0; margin-bottom: 28px; padding: 20px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow-x: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .timeline-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
        .step-dot {
          width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; background: #f8fafc; border: 2px solid #e2e8f0; color: #64748b; transition: all 0.3s; z-index: 1;
        }
        .timeline-step.active .step-dot { background: #2563eb; border-color: #2563eb; color: #fff; }
        .timeline-step.current .step-dot { background: #2563eb; border-color: #3b82f6; box-shadow: 0 0 16px rgba(59,130,246,0.3); }
        .step-label { font-size: 11px; color: #64748b; margin-top: 8px; font-weight: 600; }
        .timeline-step.active .step-label { color: #0f172a; }
        .step-line { position: absolute; top: 15px; left: calc(50% + 18px); width: calc(100% - 36px); height: 2px; background: #e2e8f0; }
        .step-line.filled { background: #2563eb; }

        .detail-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; }
        @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }

        .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .card-heading { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }

        .items-list { display: flex; flex-direction: column; gap: 0; }
        .item-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #e2e8f0; }
        .item-row:last-child { border-bottom: none; }
        .item-left { display: flex; flex-direction: column; gap: 2px; }
        .item-name { font-weight: 600; color: #0f172a; font-size: 14px; }
        .item-unit { font-size: 12px; color: #64748b; }
        .item-total { font-family: 'SF Mono', monospace; font-weight: 600; color: #0f172a; font-size: 14px; }

        .total-row { display: flex; justify-content: space-between; align-items: center; padding: 18px 0 0; border-top: 2px solid #e2e8f0; margin-top: 8px; font-weight: 700; }
        .total-row span { color: #475569; font-size: 14px; }
        .total-value { font-family: 'SF Mono', monospace; font-size: 20px; color: #2563eb; }

        .info-list { display: flex; flex-direction: column; gap: 18px; }
        .info-item { display: flex; flex-direction: column; gap: 6px; }
        .info-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-size: 14px; color: #0f172a; font-weight: 500; }
        .capitalize { text-transform: capitalize; }
        .mono { font-family: 'SF Mono', monospace; }

        .status-select { width: 100%; padding: 11px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; color: #0f172a; font-size: 13px; outline: none; cursor: pointer; }
        .status-select:focus { border-color: #2563eb; }

        .receipt-btn { display: inline-flex; padding: 10px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 500; transition: all 0.2s; }
        .receipt-btn:hover { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
      `}</style>
    </div>
  );
}
