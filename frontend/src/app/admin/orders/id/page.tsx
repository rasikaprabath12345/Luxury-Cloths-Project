"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import { AdminOnly } from "@/components/AdminOnly";
import Link from "next/link";

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
  paymentMethod: string;
  paymentSlipUrl?: string;
  userId: number;
  items: OrderItem[];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
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
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetail();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      await ordersAPI.updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "delivered":
        return "badge-green";
      case "shipped":
        return "badge-blue";
      case "pending":
        return "badge-yellow";
      case "cancelled":
        return "badge-red";
      default:
        return "badge-gray";
    }
  };

  return (
    <AdminOnly>
      <div className="order-detail-container">
        <header className="page-header">
          <div>
            <Link href="/admin/orders" className="back-link">
              ← Back to Orders list
            </Link>
            <h1 className="page-title">Order Detail #{orderId}</h1>
          </div>
        </header>

        {loading ? (
          <div className="loading-state">Loading order details...</div>
        ) : !order ? (
          <div className="error-state">Order not found.</div>
        ) : (
          <div className="detail-grid">
            {/* Main items breakdown card */}
            <div className="detail-card main-card">
              <h2 className="card-title">Order Items</h2>
              <div className="table-responsive">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="font-bold">{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td className="font-mono">${(item.price || 0).toFixed(2)}</td>
                        <td className="font-mono text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right font-bold text-muted">
                        Subtotal
                      </td>
                      <td className="font-mono text-right font-bold text-lg">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Side summary card */}
            <div className="detail-card side-card">
              <h2 className="card-title">Order Information</h2>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Current Status</span>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="info-item">
                  <label className="info-label">Update Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="info-item">
                  <span className="info-label">Order Date</span>
                  <span className="info-value">
                    {order.orderDate ? new Date(order.orderDate).toLocaleString() : "N/A"}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">Payment Method</span>
                  <span className="info-value text-capitalize">{order.paymentMethod}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">User ID (Customer)</span>
                  <span className="info-value font-mono">#{order.userId}</span>
                </div>

                {order.paymentSlipUrl && (
                  <div className="info-item slip-item">
                    <span className="info-label">Payment Receipt</span>
                    <a
                      href={order.paymentSlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="receipt-link"
                    >
                      🖼️ View Receipt Image
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .order-detail-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .back-link {
          color: #a1a1aa;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 12px;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #3b82f6;
        }

        .page-title {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          margin: 0;
        }

        .loading-state,
        .error-state {
          padding: 80px 0;
          text-align: center;
          color: #a1a1aa;
          font-size: 15px;
        }

        .detail-grid {
          display: grid;
          grid-template-cols: 2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 960px) {
          .detail-grid {
            grid-template-cols: 1fr;
          }
        }

        .detail-card {
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 16px;
          padding: 24px;
          height: fit-content;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #1a1a1f;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }
        .items-table th {
          color: #a1a1aa;
          font-weight: 600;
          padding: 12px 16px;
          border-bottom: 1px solid #1a1a1f;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .items-table td {
          padding: 16px;
          border-bottom: 1px solid #1a1a1f;
          color: #e4e4e7;
        }
        .items-table tfoot td {
          border-bottom: none;
          padding-top: 24px;
        }

        .font-bold {
          font-weight: 700;
        }
        .font-mono {
          font-family: monospace;
          font-size: 14px;
        }
        .text-right {
          text-align: right;
        }
        .text-lg {
          font-size: 18px;
          color: #3b82f6;
        }
        .text-muted {
          color: #71717a;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .info-label {
          font-size: 11px;
          font-weight: 600;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 14px;
          color: #e4e4e7;
          font-weight: 500;
        }

        .text-capitalize {
          text-transform: capitalize;
        }

        .badge {
          display: inline-flex;
          align-self: flex-start;
          align-items: center;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-green {
          background-color: rgba(34, 197, 94, 0.15);
          color: #4ade80;
        }
        .badge-blue {
          background-color: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }
        .badge-yellow {
          background-color: rgba(234, 179, 8, 0.15);
          color: #facc15;
        }
        .badge-red {
          background-color: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }
        .badge-gray {
          background-color: rgba(161, 161, 170, 0.15);
          color: #d4d4d8;
        }

        .status-select {
          width: 100%;
          padding: 12px;
          background-color: #18181b;
          border: 1px solid #27272a;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          outline: none;
          cursor: pointer;
        }
        .status-select:focus {
          border-color: #3b82f6;
        }

        .receipt-link {
          display: inline-flex;
          padding: 10px;
          background-color: #18181b;
          border: 1px solid #27272a;
          border-radius: 10px;
          color: #60a5fa;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
          align-items: center;
          justify-content: center;
        }
        .receipt-link:hover {
          border-color: #3b82f6;
          background-color: rgba(59, 130, 246, 0.05);
        }
      `}</style>
    </AdminOnly>
  );
}
