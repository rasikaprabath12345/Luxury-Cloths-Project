"use client";

import { useState, useEffect } from "react";
import { productsAPI, categoriesAPI, ordersAPI, authAPI } from "@/lib/api";
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalCategories: 0,
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

        let categoryCount = 0;
        if (categoriesRes.status === "fulfilled") {
          categoryCount = categoriesRes.value.data.length;
        }

        let orderCount = 0;
        let pendingCount = 0;
        let revenue = 0;
        let ordersList: Order[] = [];
        if (ordersRes.status === "fulfilled") {
          ordersList = ordersRes.value.data;
          orderCount = ordersList.length;
          pendingCount = ordersList.filter((o) => o.status?.toLowerCase() === "pending").length;
          revenue = ordersList
            .filter((o) => {
              const s = o.status?.toLowerCase();
              return s !== "cancelled";
            })
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        }

        let userCount = 0;
        if (usersRes.status === "fulfilled") {
          userCount = usersRes.value.data.length;
        }

        setStats({
          totalRevenue: revenue,
          totalOrders: orderCount,
          pendingOrders: pendingCount,
          totalProducts: productCount,
          totalUsers: userCount,
          totalCategories: categoryCount,
        });

        setRecentOrders(ordersList.slice(0, 6));
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

  const formatCurrency = (amount: number) =>
    "Rs. " + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here&apos;s an overview of your store.</p>
        </div>
        <div className="header-actions">
          <Link href="/admin/products" className="btn-primary">
            <span>+</span> New Product
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="shimmer" style={{ width: 80, height: 14, marginBottom: 12 }} />
              <div className="shimmer" style={{ width: 120, height: 32, marginBottom: 8 }} />
              <div className="shimmer" style={{ width: 140, height: 12 }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card stat-revenue">
              <div className="stat-header">
                <span className="stat-label">Total Revenue</span>
                <div className="stat-icon-wrap revenue-icon">Rs.</div>
              </div>
              <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
              <div className="stat-footer">From all non-cancelled orders</div>
            </div>

            <div className="stat-card stat-orders">
              <div className="stat-header">
                <span className="stat-label">Total Orders</span>
                <div className="stat-icon-wrap orders-icon">📋</div>
              </div>
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-footer">
                {stats.pendingOrders > 0 && (
                  <span className="pending-badge">{stats.pendingOrders} pending</span>
                )}
                {stats.pendingOrders === 0 && "All orders processed"}
              </div>
            </div>

            <div className="stat-card stat-products">
              <div className="stat-header">
                <span className="stat-label">Products</span>
                <div className="stat-icon-wrap products-icon">📦</div>
              </div>
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="stat-footer">Across {stats.totalCategories} categories</div>
            </div>

            <div className="stat-card stat-users">
              <div className="stat-header">
                <span className="stat-label">Users</span>
                <div className="stat-icon-wrap users-icon">👥</div>
              </div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-footer">Registered accounts</div>
            </div>
          </div>

          {/* Content Section */}
          <div className="dashboard-grid">
            {/* Recent Orders */}
            <div className="card recent-orders-card">
              <div className="card-top">
                <h2 className="card-heading">Recent Orders</h2>
                <Link href="/admin/orders" className="card-link">View All →</Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="empty-box">
                  <span className="empty-icon">📭</span>
                  <p>No orders placed yet</p>
                </div>
              ) : (
                <div className="orders-list">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="order-row">
                      <div className="order-left">
                        <span className="order-id">#{order.id}</span>
                        <div className="order-meta">
                          <span className="order-items-count">{order.items?.length || 0} items</span>
                          <span className="order-dot">·</span>
                          <span className="order-date">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="order-right">
                        <span className="order-amount">{formatCurrency(order.totalAmount || 0)}</span>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card quick-actions-card">
              <h2 className="card-heading">Quick Actions</h2>
              <div className="quick-actions">
                <Link href="/admin/products" className="action-item">
                  <div className="action-icon-box purple">📦</div>
                  <div>
                    <h4 className="action-title">Products</h4>
                    <p className="action-desc">Add, edit, or remove store items</p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>
                <Link href="/admin/categories" className="action-item">
                  <div className="action-icon-box teal">🏷️</div>
                  <div>
                    <h4 className="action-title">Categories</h4>
                    <p className="action-desc">Organize product collections</p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>
                <Link href="/admin/orders" className="action-item">
                  <div className="action-icon-box amber">🛒</div>
                  <div>
                    <h4 className="action-title">Orders</h4>
                    <p className="action-desc">Review and process orders</p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>
                <Link href="/admin/users" className="action-item">
                  <div className="action-icon-box blue">👥</div>
                  <div>
                    <h4 className="action-title">Users</h4>
                    <p className="action-desc">Manage accounts & roles</p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .dashboard-container { max-width: 1200px; margin: 0 auto; }

        .dashboard-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
        }
        .dashboard-title { font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
        .dashboard-subtitle { font-size: 14px; color: #64748b; margin: 0; }

        .header-actions { display: flex; gap: 10px; }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff; font-weight: 600; font-size: 13px; padding: 10px 20px;
          border-radius: 10px; text-decoration: none; display: inline-flex;
          align-items: center; gap: 6px; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(59,130,246,0.25);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.35); }

        /* Stats Grid */
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px; margin-bottom: 28px;
        }
        .stat-card {
          background: #ffffff; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 22px 24px; transition: all 0.25s;
        }
        .stat-card:hover { border-color: #cbd5e1; transform: translateY(-2px); }
        .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .stat-label { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-icon-wrap {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800;
        }
        .revenue-icon { background: rgba(34,197,94,0.1); color: #16a34a; }
        .orders-icon { background: rgba(234,179,8,0.1); color: #d97706; }
        .products-icon { background: rgba(139,92,246,0.1); color: #7c3aed; }
        .users-icon { background: rgba(59,130,246,0.1); color: #2563eb; }
        .stat-value { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.5px; }
        .stat-footer { font-size: 12px; color: #64748b; }
        .pending-badge {
          background: rgba(234,179,8,0.1); color: #d97706; padding: 2px 8px;
          border-radius: 6px; font-size: 11px; font-weight: 600;
        }

        /* Dashboard Grid */
        .dashboard-grid { display: grid; grid-template-columns: 5fr 3fr; gap: 16px; }
        @media (max-width: 960px) { .dashboard-grid { grid-template-columns: 1fr; } }

        .card {
          background: #ffffff; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 24px;
        }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-heading { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
        .card-link { font-size: 12px; font-weight: 600; color: #2563eb; text-decoration: none; }
        .card-link:hover { text-decoration: underline; }

        /* Empty box */
        .empty-box { text-align: center; padding: 40px 20px; color: #64748b; }
        .empty-icon { font-size: 32px; display: block; margin-bottom: 10px; }
        .empty-box p { font-size: 13px; margin: 0; }

        /* Orders List */
        .orders-list { display: flex; flex-direction: column; }
        .order-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0; border-bottom: 1px solid #e2e8f0; gap: 12px;
        }
        .order-row:last-child { border-bottom: none; }
        .order-left { display: flex; align-items: center; gap: 14px; }
        .order-id { font-weight: 700; color: #2563eb; font-size: 14px; min-width: 36px; }
        .order-meta { display: flex; align-items: center; gap: 6px; }
        .order-items-count { font-size: 12px; color: #64748b; }
        .order-dot { color: #cbd5e1; font-size: 10px; }
        .order-date { font-size: 12px; color: #64748b; }
        .order-right { display: flex; align-items: center; gap: 12px; }
        .order-amount { font-family: 'SF Mono', monospace; font-size: 14px; font-weight: 600; color: #0f172a; }

        .badge {
          display: inline-flex; align-items: center; padding: 3px 9px;
          border-radius: 6px; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .badge-green { background: #f0fdf4; color: #16a34a; }
        .badge-blue { background: #eff6ff; color: #2563eb; }
        .badge-yellow { background: #fffbeb; color: #d97706; }
        .badge-red { background: #fef2f2; color: #dc2626; }
        .badge-gray { background: #f1f5f9; color: #475569; }

        /* Quick Actions */
        .quick-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
        .action-item {
          display: flex; align-items: center; gap: 14px; padding: 14px 16px;
          border: 1px solid #e2e8f0; border-radius: 12px;
          text-decoration: none; transition: all 0.2s; cursor: pointer;
        }
        .action-item:hover { border-color: #cbd5e1; background: rgba(15,23,42,0.02); transform: translateX(3px); }
        .action-icon-box {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .action-icon-box.purple { background: rgba(139,92,246,0.1); color: #7c3aed; }
        .action-icon-box.teal { background: rgba(20,184,166,0.1); color: #0d9488; }
        .action-icon-box.amber { background: rgba(245,158,11,0.1); color: #d97706; }
        .action-icon-box.blue { background: rgba(59,130,246,0.1); color: #2563eb; }
        .action-title { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0 0 2px; }
        .action-desc { font-size: 11px; color: #64748b; margin: 0; }
        .action-arrow { margin-left: auto; color: #94a3b8; font-size: 16px; transition: color 0.2s; }
        .action-item:hover .action-arrow { color: #2563eb; }
      `}</style>
    </div>
  );
}
