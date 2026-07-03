"use client";

import { useState, useEffect } from "react";
import { productsAPI, categoriesAPI, ordersAPI, authAPI, stockAPI } from "@/lib/api";
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

  // States for report generation
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allStock, setAllStock] = useState<any[]>([]);
  const [reportType, setReportType] = useState("sales");
  const [reportRange, setReportRange] = useState("all");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [productsRes, categoriesRes, ordersRes, usersRes, stockRes] = await Promise.allSettled([
          productsAPI.getAllProducts(),
          categoriesAPI.getAllCategories(),
          ordersAPI.getAllOrders(),
          authAPI.getAllUsers(),
          stockAPI.getAllStock(),
        ]);

        let productCount = 0;
        if (productsRes.status === "fulfilled") {
          productCount = productsRes.value.data.length;
          setAllProducts(productsRes.value.data || []);
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
          setAllOrders(ordersList || []);
        }

        let userCount = 0;
        if (usersRes.status === "fulfilled") {
          userCount = usersRes.value.data.length;
          setAllUsers(usersRes.value.data || []);
        }

        if (stockRes.status === "fulfilled") {
          setAllStock(stockRes.value.data || []);
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

  const handleGenerateReport = (type: string, dateRange: string) => {
    let data: any[] = [];
    let headers: string[] = [];
    const filename = `luxury_report_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

    const filterByDate = (dateStr: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const now = new Date();
      if (dateRange === "7days") {
        return (now.getTime() - date.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      }
      if (dateRange === "30days") {
        return (now.getTime() - date.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      }
      return true; // "all"
    };

    if (type === "sales") {
      const filteredOrders = allOrders.filter(o => filterByDate(o.orderDate));
      headers = ["Order ID", "Total Amount (Rs.)", "Payment Method", "Status", "Date"];
      data = filteredOrders.map(o => [
        o.id,
        o.totalAmount,
        o.paymentMethod || "N/A",
        o.status || "Pending",
        o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "N/A"
      ]);
    } else if (type === "products") {
      headers = ["Product ID", "Name", "Price (Rs.)", "Description"];
      data = allProducts.map(p => [
        p.id,
        `"${p.name?.replace(/"/g, '""') || ""}"`,
        p.price,
        `"${p.description?.replace(/"/g, '""') || ""}"`
      ]);
    } else if (type === "users") {
      const filteredUsers = allUsers.filter(u => filterByDate(u.createdAt));
      headers = ["User ID", "Full Name", "Email", "Phone", "Role", "Joined Date"];
      data = filteredUsers.map(u => [
        u.id,
        `"${u.fullName?.replace(/"/g, '""') || ""}"`,
        u.email,
        u.phone || "N/A",
        u.role || "Customer",
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"
      ]);
    } else if (type === "stocks") {
      headers = ["Product Name", "Size", "Color", "Stock Quantity", "Low Threshold", "Status"];
      const stockRows: any[] = [];
      allStock.forEach(p => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach((v: any) => {
            stockRows.push([
              `"${p.productName?.replace(/"/g, '""') || ""}"`,
              v.size || "N/A",
              v.color || "N/A",
              v.stockQuantity,
              v.lowStockThreshold || 5,
              v.stockQuantity === 0 ? "Out of Stock" : v.stockQuantity <= (v.lowStockThreshold || 5) ? "Low Stock" : "In Stock"
            ]);
          });
        } else {
          stockRows.push([`"${p.productName?.replace(/"/g, '""') || ""}"`, "N/A", "N/A", 0, 0, "No Variants"]);
        }
      });
      data = stockRows;
    }

    if (data.length === 0) {
      alert("No data found for the selected criteria.");
      return;
    }

    // Build CSV Content
    const csvContent = [
      headers.join(","),
      ...data.map(row => row.join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePDFReport = (type: string, dateRange: string) => {
    let data: any[] = [];
    let headers: string[] = [];
    let title = "";
    let summaryHtml = "";

    const filterByDate = (dateStr: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const now = new Date();
      if (dateRange === "7days") {
        return (now.getTime() - date.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      }
      if (dateRange === "30days") {
        return (now.getTime() - date.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      }
      return true; // "all"
    };

    if (type === "sales") {
      title = "Sales & Revenue Report";
      const filteredOrders = allOrders.filter(o => filterByDate(o.orderDate));
      headers = ["Order ID", "Amount (Rs.)", "Payment Method", "Status", "Date"];
      data = filteredOrders.map(o => [
        `#ORD-${o.id}`,
        (o.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        o.paymentMethod || "N/A",
        o.status || "Pending",
        o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "N/A"
      ]);

      const totalRevenue = filteredOrders
        .filter(o => o.status?.toLowerCase() !== "cancelled")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      summaryHtml = `
        <div class="summary-box">
          <div class="summary-item">
            <span class="label">Total Orders</span>
            <span class="value">${filteredOrders.length}</span>
          </div>
          <div class="summary-item">
            <span class="label">Total Revenue</span>
            <span class="value" style="color: #aa841c;">Rs. ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="summary-item">
            <span class="label">Cancelled Orders</span>
            <span class="value">${filteredOrders.filter(o => o.status?.toLowerCase() === "cancelled").length}</span>
          </div>
        </div>
      `;
    } else if (type === "products") {
      title = "Product Catalog Report";
      headers = ["Product ID", "Product Name", "Price (Rs.)", "Description"];
      data = allProducts.map(p => [
        p.id,
        p.name || "N/A",
        (p.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        p.description || "N/A"
      ]);

      summaryHtml = `
        <div class="summary-box">
          <div class="summary-item">
            <span class="label">Total Products</span>
            <span class="value">${allProducts.length}</span>
          </div>
        </div>
      `;
    } else if (type === "users") {
      title = "User Accounts Report";
      const filteredUsers = allUsers.filter(u => filterByDate(u.createdAt));
      headers = ["User ID", "Full Name", "Email", "Phone", "Role", "Joined Date"];
      data = filteredUsers.map(u => [
        u.id,
        u.fullName || "N/A",
        u.email || "N/A",
        u.phone || "N/A",
        u.role || "Customer",
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"
      ]);

      summaryHtml = `
        <div class="summary-box">
          <div class="summary-item">
            <span class="label">Total Users</span>
            <span class="value">${filteredUsers.length}</span>
          </div>
          <div class="summary-item">
            <span class="label">Administrators</span>
            <span class="value">${filteredUsers.filter(u => u.role?.toLowerCase() === "admin").length}</span>
          </div>
          <div class="summary-item">
            <span class="label">Customers</span>
            <span class="value">${filteredUsers.filter(u => u.role?.toLowerCase() !== "admin").length}</span>
          </div>
        </div>
      `;
    } else if (type === "stocks") {
      title = "Stocks & Inventory Report";
      headers = ["Product Name", "Size", "Color", "Stock Quantity", "Low Threshold", "Status"];
      
      const stockRows: any[] = [];
      let totalStockQuantity = 0;
      let lowStockAlerts = 0;
      let outOfStockAlerts = 0;

      allStock.forEach(p => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach((v: any) => {
            totalStockQuantity += v.stockQuantity || 0;
            if (v.stockQuantity === 0) outOfStockAlerts++;
            else if (v.stockQuantity <= (v.lowStockThreshold || 5)) lowStockAlerts++;

            stockRows.push([
              p.productName,
              v.size || "N/A",
              v.color || "N/A",
              v.stockQuantity,
              v.lowStockThreshold || 5,
              v.stockQuantity === 0 ? `<span style="color: #dc2626; font-weight: bold;">Out of Stock</span>` : v.stockQuantity <= (v.lowStockThreshold || 5) ? `<span style="color: #d97706; font-weight: bold;">Low Stock</span>` : "In Stock"
            ]);
          });
        } else {
          stockRows.push([p.productName, "N/A", "N/A", 0, 0, `<span style="color: #64748b;">No Variants</span>`]);
        }
      });

      data = stockRows;

      summaryHtml = `
        <div class="summary-box">
          <div class="summary-item">
            <span class="label">Total Products</span>
            <span class="value">${allStock.length}</span>
          </div>
          <div class="summary-item">
            <span class="label">Total Items in Stock</span>
            <span class="value">${totalStockQuantity}</span>
          </div>
          <div class="summary-item">
            <span class="label">Low Stock Alerts</span>
            <span class="value" style="color: #d97706;">${lowStockAlerts}</span>
          </div>
          <div class="summary-item">
            <span class="label">Out of Stock</span>
            <span class="value" style="color: #dc2626;">${outOfStockAlerts}</span>
          </div>
        </div>
      `;
    }

    if (data.length === 0) {
      alert("No data found for the selected criteria.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate PDF reports.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');
          
          body {
            font-family: 'Montserrat', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 20px;
            font-size: 11px;
            line-height: 1.5;
          }
          
          .header {
            border-bottom: 2px solid #aa841c;
            padding-bottom: 15px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .logo-area {
            display: flex;
            flex-direction: column;
          }
          
          .logo-text {
            font-family: 'Playfair Display', serif;
            font-size: 26px;
            font-weight: 700;
            color: #1c1c1e;
            letter-spacing: 1px;
            margin: 0;
          }
          
          .logo-text span {
            color: #aa841c;
          }
          
          .logo-subtitle {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #64748b;
            margin-top: 2px;
          }
          
          .report-info {
            text-align: right;
          }
          
          .report-title {
            font-family: 'Playfair Display', serif;
            font-size: 18px;
            font-weight: 700;
            color: #aa841c;
            margin: 0 0 5px;
          }
          
          .metadata {
            color: #64748b;
            font-size: 9px;
            margin: 2px 0;
          }
          
          .summary-box {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
          }
          
          .summary-item {
            flex: 1;
            background: #fafaf9;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
          }
          
          .summary-item .label {
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            display: block;
            margin-bottom: 4px;
          }
          
          .summary-item .value {
            font-size: 16px;
            font-weight: 700;
            color: #1c1c1e;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          th {
            background-color: #1c1c1e;
            color: #ffffff;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            text-align: left;
            border: 1px solid #1c1c1e;
          }
          
          td {
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
            color: #334155;
          }
          
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #94a3b8;
            font-size: 8px;
          }
          
          .signature-area {
            margin-top: 40px;
            display: flex;
            justify-content: flex-end;
            gap: 50px;
          }
          
          .sig-line {
            width: 150px;
            border-top: 1px solid #cbd5e1;
            text-align: center;
            padding-top: 5px;
            font-size: 8px;
            color: #64748b;
          }

          @media print {
            body { padding: 0; }
            .no-print { display: none; }
            @page {
              size: A4;
              margin: 15mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <h1 class="logo-text">LUXURY<span>.LK</span></h1>
            <span class="logo-subtitle">Premium Boutique</span>
          </div>
          <div class="report-info">
            <h2 class="report-title">${title}</h2>
            <div class="metadata">Date Range: <strong>${dateRange === "all" ? "All Time" : dateRange === "7days" ? "Last 7 Days" : "Last 30 Days"}</strong></div>
            <div class="metadata">Generated: <strong>${new Date().toLocaleString()}</strong></div>
            <div class="metadata">Generated By: <strong>Luxury Administrator</strong></div>
          </div>
        </div>

        ${summaryHtml}

        <table>
          <thead>
            <tr>
              ${headers.map((h: string) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data.map((row: any) => `
              <tr>
                ${row.map((cell: any) => `<td>${cell}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="signature-area">
          <div class="sig-line">Prepared By</div>
          <div class="sig-line">Authorized Signature</div>
        </div>

        <div class="footer">
          <span>CONFIDENTIAL - LUXURY.LK BUSINESS INTELLIGENCE SYSTEM</span>
          <span>Page 1 of 1</span>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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

            {/* Right Column Stack */}
            <div className="dashboard-right-stack" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

              {/* Report Center */}
              <div className="card report-generator-card">
                <h2 className="card-heading" style={{ marginBottom: "16px" }}>Report Center</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#0f172a", background: "#fff", outline: "none", cursor: "pointer" }}
                    >
                      <option value="sales">Sales & Revenue Report</option>
                      <option value="products">Product Catalog Report</option>
                      <option value="stocks">Stocks & Inventory Report</option>
                      <option value="users">User Accounts Report</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Date Range</label>
                    <select
                      value={reportRange}
                      onChange={(e) => setReportRange(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#0f172a", background: "#fff", outline: "none", cursor: "pointer" }}
                      disabled={reportType === "products" || reportType === "stocks"}
                    >
                      <option value="all">All Time</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleGeneratePDFReport(reportType, reportRange)}
                    className="btn-primary"
                    style={{ justifyContent: "center", marginTop: "4px", background: "linear-gradient(135deg, #aa841c, #d4af37)", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(170, 132, 28, 0.2)", color: "#fff", fontWeight: "bold" }}
                  >
                    📄 Generate PDF Report
                  </button>

                  <button
                    onClick={() => handleGenerateReport(reportType, reportRange)}
                    className="btn-primary"
                    style={{ justifyContent: "center", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "none" }}
                  >
                    📥 Download CSV Report
                  </button>
                </div>
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
