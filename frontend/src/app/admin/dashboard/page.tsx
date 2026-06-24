"use client";

import { useState, useEffect } from "react";
import { productsAPI, categoriesAPI, ordersAPI, authAPI } from "@/lib/api";
import Link from "next/link";

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [productsRes, categoriesRes, ordersRes, usersRes] = await Promise.allSettled([
          productsAPI.getAllProducts(),
          categoriesAPI.getAllCategories(),
          ordersAPI.getAllOrders(),
          authAPI.getAllUsers(),
        ]);

        let productCount = 0;
        if (productsRes.status === "fulfilled") {
          productCount = productsRes.value.data.length;
        }

        let orderCount = 0;
        let revenue = 0;
        let ordersList: Order[] = [];
        if (ordersRes.status === "fulfilled") {
          ordersList = ordersRes.value.data;
          orderCount = ordersList.length;
          revenue = ordersList
            .filter(o => o.status?.toLowerCase() !== "cancelled")
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        }

        let userCount = 0;
        if (usersRes.status === "fulfilled") {
          userCount = usersRes.value.data.length;
        }

        setStats({
          totalRevenue: revenue,
          totalOrders: orderCount,
          totalProducts: productCount,
          totalUsers: userCount,
        });

        // Get last 5 orders
        setRecentOrders(ordersList.slice(0, 5));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Overview</h1>
          <p className="dashboard-subtitle">Here's what's happening in your shop today.</p>
        </div>
        <div className="dashboard-actions">
          <Link href="/admin/products" className="btn-primary">
            ➕ Add Product
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="dashboard-loading">Loading metrics...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Revenue</span>
                <span className="stat-card-icon">💰</span>
              </div>
              <div className="stat-card-value">${stats.totalRevenue.toFixed(2)}</div>
              <div className="stat-card-desc">From completed/approved orders</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Orders</span>
                <span className="stat-card-icon">🛒</span>
              </div>
              <div className="stat-card-value">{stats.totalOrders}</div>
              <div className="stat-card-desc">All placed orders</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Products In Store</span>
                <span className="stat-card-icon">📦</span>
              </div>
              <div className="stat-card-value">{stats.totalProducts}</div>
              <div className="stat-card-desc">Active catalog listings</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Registered Users</span>
                <span className="stat-card-icon">👥</span>
              </div>
              <div className="stat-card-value">{stats.totalUsers}</div>
              <div className="stat-card-desc">Customers & administrators</div>
            </div>
          </div>

          {/* Detailed Content Split */}
          <div className="dashboard-details">
            {/* Recent Orders Table */}
            <div className="details-card main-details">
              <div className="card-header">
                <h2 className="card-title">Recent Orders</h2>
                <Link href="/admin/orders" className="card-header-link">
                  View All Orders →
                </Link>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">
                          No orders placed yet
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="font-bold text-blue">#{order.id}</td>
                          <td>
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="font-mono">${(order.totalAmount || 0).toFixed(2)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <Link href={`/admin/orders`} className="btn-table-action">
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Settings & Navigation */}
            <div className="details-card side-details">
              <h2 className="card-title">Quick Actions</h2>
              <div className="quick-links">
                <Link href="/admin/products" className="quick-link-item">
                  <span className="quick-link-icon">📦</span>
                  <div>
                    <h4 className="quick-link-title">Products Management</h4>
                    <p className="quick-link-desc">Add, edit, or delete store products.</p>
                  </div>
                </Link>
                <Link href="/admin/categories" className="quick-link-item">
                  <span className="quick-link-icon">🏷️</span>
                  <div>
                    <h4 className="quick-link-title">Categories Manager</h4>
                    <p className="quick-link-desc">Manage shirt, pant, shoes, etc. divisions.</p>
                  </div>
                </Link>
                <Link href="/admin/users" className="quick-link-item">
                  <span className="quick-link-icon">👥</span>
                  <div>
                    <h4 className="quick-link-title">User Accounts</h4>
                    <p className="quick-link-desc">Verify customer profiles and promote administrators.</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dashboard-title {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          margin: 0 0 6px;
        }

        .dashboard-subtitle {
          font-size: 14px;
          color: #a1a1aa;
          margin: 0;
        }

        .btn-primary {
          background-color: #3b82f6;
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 20px;
          border-radius: 10px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        .btn-primary:hover {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .dashboard-loading {
          text-align: center;
          padding: 60px 0;
          color: #a1a1aa;
          font-size: 15px;
        }

        .stats-grid {
          display: grid;
          grid-template-cols: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s;
        }
        .stat-card:hover {
          border-color: #27272a;
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .stat-card-title {
          font-size: 13px;
          font-weight: 600;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card-icon {
          font-size: 20px;
        }

        .stat-card-value {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 6px;
        }

        .stat-card-desc {
          font-size: 11px;
          color: #52525b;
        }

        .dashboard-details {
          display: grid;
          grid-template-cols: 2fr 1fr;
          gap: 20px;
        }

        @media (max-width: 960px) {
          .dashboard-details {
            grid-template-cols: 1fr;
          }
        }

        .details-card {
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 16px;
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .card-header-link {
          font-size: 12px;
          font-weight: 600;
          color: #3b82f6;
          text-decoration: none;
        }
        .card-header-link:hover {
          text-decoration: underline;
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
          padding: 12px 16px;
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
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        .admin-table tr:hover td {
          background-color: #18181b/10;
        }

        .font-bold {
          font-weight: 700;
        }
        .text-blue {
          color: #3b82f6;
        }
        .text-center {
          text-align: center;
        }
        .text-muted {
          color: #52525b;
        }
        .text-right {
          text-align: right;
        }
        .font-mono {
          font-family: monospace;
          font-size: 14px;
          color: #e4e4e7;
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

        .btn-table-action {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 8px;
          background: #18181b;
          border: 1px solid #27272a;
          color: #e4e4e7;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-table-action:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .quick-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }

        .quick-link-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .quick-link-item:hover {
          border-color: #27272a;
          background-color: #18181b/20;
          transform: translateX(2px);
        }

        .quick-link-icon {
          font-size: 24px;
          padding: 8px;
          background-color: #18181b;
          border-radius: 10px;
        }

        .quick-link-title {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px;
        }

        .quick-link-desc {
          font-size: 11px;
          color: #71717a;
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
