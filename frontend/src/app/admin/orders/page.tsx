"use client";

import { useState, useEffect } from "react";
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
  items: OrderItem[];
}

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
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      alert("Order status updated successfully!");
      // Update locally
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status.");
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

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "" || order.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.items?.some((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminOnly>
      <div className="orders-container">
        <header className="page-header">
          <div>
            <h1 className="page-title">Orders Management</h1>
            <p className="page-subtitle">Track, approve, ship, and update order statuses.</p>
          </div>
        </header>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by Order ID or Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="toolbar-input"
            />
          </div>
          <div className="filter-box">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="shipped">Shipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="table-card">
          {loading ? (
            <div className="loading-state">Loading order history...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">No orders found matching your search.</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items Count</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Modify Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    return (
                      <>
                        <tr key={order.id} className={isExpanded ? "expanded-row-parent" : ""}>
                          <td className="font-bold text-blue">#{order.id}</td>
                          <td>
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleString()
                              : "N/A"}
                          </td>
                          <td>{order.items?.length || 0} items</td>
                          <td className="font-mono">${(order.totalAmount || 0).toFixed(2)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="status-select"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="text-right">
                            <div className="actions-group">
                              <button
                                onClick={() => toggleExpand(order.id)}
                                className="btn-table-action"
                              >
                                {isExpanded ? "Hide Details" : "View Items"}
                              </button>
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="btn-table-action view-btn"
                              >
                                Detail Page
                              </Link>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="expanded-row-child">
                            <td colSpan={7}>
                              <div className="items-detail-box">
                                <h4 className="detail-title">Order Items breakdown</h4>
                                <div className="detail-items-list">
                                  {order.items?.map((item) => (
                                    <div key={item.id} className="detail-item-row">
                                      <span className="item-name">{item.productName}</span>
                                      <span className="item-qty">Qty: {item.quantity}</span>
                                      <span className="item-price font-mono">
                                        ${(item.price || 0).toFixed(2)} each
                                      </span>
                                      <span className="item-total font-mono">
                                        Total: ${(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .orders-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          margin: 0 0 6px;
        }

        .page-subtitle {
          font-size: 14px;
          color: #a1a1aa;
          margin: 0;
        }

        .toolbar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 280px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #52525b;
          font-size: 14px;
        }
        .toolbar-input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 12px;
          color: #fff;
          outline: none;
          font-size: 14px;
          transition: all 0.2s;
        }
        .toolbar-input:focus {
          border-color: #3b82f6;
        }

        .filter-box {
          min-width: 160px;
        }
        .toolbar-select {
          width: 100%;
          padding: 12px 16px;
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 12px;
          color: #fff;
          outline: none;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toolbar-select:focus {
          border-color: #3b82f6;
        }

        .table-card {
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 16px;
          overflow: hidden;
        }

        .loading-state,
        .empty-state {
          padding: 60px;
          text-align: center;
          color: #71717a;
          font-size: 14px;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }
        .admin-table th {
          color: #a1a1aa;
          font-weight: 600;
          padding: 16px;
          border-bottom: 1px solid #1a1a1f;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .admin-table td {
          padding: 16px;
          border-bottom: 1px solid #1a1a1f;
          color: #e4e4e7;
        }

        .expanded-row-parent td {
          background-color: #111115;
          border-bottom: none;
        }

        .expanded-row-child td {
          background-color: #111115;
          padding: 0 24px 24px 24px;
          border-bottom: 1px solid #1a1a1f;
        }

        .font-bold {
          font-weight: 700;
        }
        .text-blue {
          color: #3b82f6;
        }
        .font-mono {
          font-family: monospace;
          font-size: 14px;
        }

        .badge {
          display: inline-flex;
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
          padding: 6px 12px;
          background-color: #18181b;
          border: 1px solid #27272a;
          border-radius: 8px;
          color: #fff;
          font-size: 12px;
          outline: none;
          cursor: pointer;
        }
        .status-select:focus {
          border-color: #3b82f6;
        }

        .actions-group {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .btn-table-action {
          padding: 6px 12px;
          border-radius: 8px;
          background-color: #18181b;
          border: 1px solid #27272a;
          color: #e4e4e7;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .btn-table-action:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .view-btn {
          background-color: transparent;
          border-color: transparent;
          color: #3b82f6;
        }
        .view-btn:hover {
          background-color: rgba(59, 130, 246, 0.1);
        }

        /* Items Detail box */
        .items-detail-box {
          background-color: #09090b;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 16px 20px;
        }

        .detail-title {
          font-size: 12px;
          font-weight: 700;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 12px;
        }

        .detail-items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .detail-item-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #e4e4e7;
          border-bottom: 1px dashed #1a1a1f;
          padding-bottom: 8px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .detail-item-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .item-name {
          font-weight: 600;
          flex: 1;
          min-width: 150px;
        }

        .item-qty {
          color: #a1a1aa;
          width: 80px;
        }

        .item-price {
          color: #71717a;
          width: 120px;
        }

        .item-total {
          color: #fff;
          font-weight: 600;
          width: 120px;
          text-align: right;
        }
      `}</style>
    </AdminOnly>
  );
}
