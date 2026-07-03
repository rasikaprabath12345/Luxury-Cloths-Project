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

  const getSalesChartData = () => {
    // Get last 7 days sales data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    return last7Days.map(dateStr => {
      const dayOrders = allOrders.filter(o => {
        if (!o.orderDate) return false;
        return o.orderDate.startsWith(dateStr) && o.status?.toLowerCase() !== "cancelled";
      });
      const total = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        date: new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" }),
        amount: total,
        dateStr
      };
    });
  };

  const formatCurrency = (amount: number) =>
    "Rs. " + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const lowStockCount = allStock.reduce((count, p) => {
    if (p.variants && p.variants.length > 0) {
      return count + p.variants.filter((v: any) => v.stockQuantity <= (v.lowStockThreshold || 5)).length;
    }
    return count;
  }, 0);

  const chartData = getSalesChartData();
  const maxAmount = Math.max(...chartData.map(d => d.amount), 10000);
  const chartPoints = chartData.map((d, i) => {
    const x = 50 + (i * 72); // spacing
    const y = 150 - (d.amount / maxAmount) * 110; // scale between 40 and 150
    return { x, y, ...d };
  });

  // SVG paths
  const pathD = chartPoints.length > 0 
    ? `M ${chartPoints[0].x} ${chartPoints[0].y} ` + chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";
  const areaD = chartPoints.length > 0
    ? `${pathD} L ${chartPoints[chartPoints.length - 1].x} 160 L ${chartPoints[0].x} 160 Z`
    : "";

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Overview</h1>
          <p className="dashboard-subtitle">Here&apos;s a look at what&apos;s happening with your store today.</p>
        </div>
        <div className="header-actions">
          <Link href="/admin/products" className="btn-primary">
            <span>+</span> Add Product
          </Link>
        </div>
      </header>

      {/* Warning Banners */}
      {!loading && (
        <div className="alerts-section">
          {stats.pendingOrders > 0 && (
            <div className="alert-banner alert-warning">
              <span className="alert-icon">⚠️</span>
              <div className="alert-text">
                <strong>Pending Orders</strong>: You have {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} awaiting approval.
              </div>
              <Link href="/admin/orders" className="alert-action">Process Orders →</Link>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="alert-banner alert-danger">
              <span className="alert-icon">📋</span>
              <div className="alert-text">
                <strong>Inventory Alert</strong>: There are {lowStockCount} product variants running low on stock.
              </div>
              <Link href="/admin/stock" className="alert-action">Adjust Stock →</Link>
            </div>
          )}
        </div>
      )}

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
              <div className="stat-footer">Excludes cancelled orders</div>
            </div>

            <div className="stat-card stat-orders">
              <div className="stat-header">
                <span className="stat-label">Orders</span>
                <div className="stat-icon-wrap orders-icon">🛒</div>
              </div>
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-footer">
                {stats.pendingOrders > 0 ? (
                  <span className="pending-badge">{stats.pendingOrders} pending</span>
                ) : (
                  "All orders processed"
                )}
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

          {/* Main Dashboard Grid */}
          <div className="dashboard-grid">
            <div className="dashboard-left-stack">
              {/* Sales Chart Card */}
              <div className="card chart-card">
                <div className="card-top">
                  <h2 className="card-heading">Weekly Sales Trend</h2>
                  <span className="chart-legend">Rs. Sales / Day</span>
                </div>
                <div className="chart-svg-container">
                  <svg viewBox="0 0 500 180" className="chart-svg">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--admin-accent-gold)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--admin-accent-gold)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="40" y1="40" x2="480" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="95" x2="480" y2="95" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="150" x2="480" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />
                    
                    {/* Y Axis helper labels */}
                    <text x="32" y="44" className="chart-axis-label" textAnchor="end">{formatCurrency(maxAmount).split(".")[0]}</text>
                    <text x="32" y="99" className="chart-axis-label" textAnchor="end">{formatCurrency(maxAmount / 2).split(".")[0]}</text>
                    <text x="32" y="154" className="chart-axis-label" textAnchor="end">Rs.0</text>

                    {/* Gradient Area */}
                    {areaD && <path d={areaD} fill="url(#chartGrad)" />}

                    {/* Path line */}
                    {pathD && (
                      <path 
                        d={pathD} 
                        fill="none" 
                        stroke="var(--admin-accent-gold)" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: "drop-shadow(0 4px 6px rgba(197, 168, 128, 0.2))" }}
                      />
                    )}

                    {/* Interactive dots */}
                    {chartPoints.map((pt, i) => (
                      <g key={i} className="chart-dot-group">
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r="5" 
                          fill="#ffffff" 
                          stroke="var(--admin-accent-gold-dark)" 
                          strokeWidth="2.5" 
                        />
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r="10" 
                          fill="transparent" 
                          className="chart-hover-trigger"
                        >
                          <title>{pt.date}: {formatCurrency(pt.amount)}</title>
                        </circle>
                        <text x={pt.x} y="172" className="chart-axis-label" textAnchor="middle">{pt.date}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="card recent-orders-card">
                <div className="card-top">
                  <h2 className="card-heading">Recent Transactions</h2>
                  <Link href="/admin/orders" className="card-link">See All Orders →</Link>
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
                            <span className="order-items-count">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
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
            </div>

            {/* Right Column Stack */}
            <div className="dashboard-right-stack" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Quick Actions */}
              <div className="card quick-actions-card">
                <h2 className="card-heading">Operations</h2>
                <div className="quick-actions">
                  <Link href="/admin/products" className="action-item">
                    <div className="action-icon-box purple">📦</div>
                    <div>
                      <h4 className="action-title">Products</h4>
                      <p className="action-desc">Add, edit, or remove catalog items</p>
                    </div>
                    <span className="action-arrow">→</span>
                  </Link>
                  <Link href="/admin/categories" className="action-item">
                    <div className="action-icon-box teal">🏷️</div>
                    <div>
                      <h4 className="action-title">Categories</h4>
                      <p className="action-desc">Organize product classification</p>
                    </div>
                    <span className="action-arrow">→</span>
                  </Link>
                  <Link href="/admin/orders" className="action-item">
                    <div className="action-icon-box amber">🛒</div>
                    <div>
                      <h4 className="action-title">Orders</h4>
                      <p className="action-desc">Process invoices and shipments</p>
                    </div>
                    <span className="action-arrow">→</span>
                  </Link>
                  <Link href="/admin/stock" className="action-item">
                    <div className="action-icon-box gold">📋</div>
                    <div>
                      <h4 className="action-title">Stock Manager</h4>
                      <p className="action-desc">Adjust variant size & color quantities</p>
                    </div>
                    <span className="action-arrow">→</span>
                  </Link>
                </div>
              </div>

              {/* Report Center */}
              <div className="card report-generator-card">
                <h2 className="card-heading" style={{ marginBottom: "16px" }}>Document Center</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "var(--admin-text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>Report Scope</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-md)", fontSize: "13px", color: "var(--admin-text-main)", background: "#fff", outline: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}
                    >
                      <option value="sales">Sales & Revenue Report</option>
                      <option value="products">Product Catalog Report</option>
                      <option value="stocks">Stocks & Inventory Report</option>
                      <option value="users">User Accounts Report</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "var(--admin-text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>Time Horizon</label>
                    <select
                      value={reportRange}
                      onChange={(e) => setReportRange(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-md)", fontSize: "13px", color: "var(--admin-text-main)", background: "#fff", outline: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}
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
                    style={{ justifyContent: "center", marginTop: "4px", background: "linear-gradient(135deg, var(--admin-accent-gold-dark), var(--admin-accent-gold))", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(197, 168, 128, 0.2)", color: "#fff", fontWeight: "bold", fontFamily: "var(--font-body)" }}
                  >
                    📄 Generate PDF Invoice
                  </button>

                  <button
                    onClick={() => handleGenerateReport(reportType, reportRange)}
                    className="btn-primary"
                    style={{ justifyContent: "center", background: "#f8fafc", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)", cursor: "pointer", boxShadow: "none", fontFamily: "var(--font-body)" }}
                  >
                    📥 Download CSV Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .dashboard-container { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dashboard-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
        }
        .dashboard-title { font-size: 32px; font-weight: 900; color: var(--admin-text-main); margin: 0 0 4px; }
        .dashboard-subtitle { font-size: 14px; color: var(--admin-text-muted); margin: 0; }

        .header-actions { display: flex; gap: 10px; }
        .btn-primary {
          background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-light));
          color: #fff; font-weight: 600; font-size: 13px; padding: 11px 22px;
          border-radius: var(--admin-radius-md); text-decoration: none; display: inline-flex;
          align-items: center; gap: 6px; transition: all 0.25s;
          box-shadow: 0 4px 16px rgba(15,23,42,0.15);
          border: none;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,23,42,0.25); }

        /* Alert Banners */
        .alerts-section { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
        .alert-banner {
          display: flex; align-items: center; gap: 12px; padding: 12px 18px;
          border-radius: var(--admin-radius-md); font-size: 13.5px;
          border: 1px solid transparent; animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .alert-warning { background: #fffbeb; border-color: #fef3c7; color: #b45309; }
        .alert-danger { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
        .alert-icon { font-size: 16px; }
        .alert-text { flex: 1; }
        .alert-action { font-weight: 700; text-decoration: none; color: inherit; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .alert-action:hover { text-decoration: underline; }

        /* Stats Grid */
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px; margin-bottom: 28px;
        }
        .stat-card {
          background: var(--admin-bg-card); border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg); padding: 24px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01);
        }
        .stat-card:hover { border-color: var(--admin-accent-gold-dark); transform: translateY(-2px); box-shadow: 0 12px 20px rgba(15,23,42,0.03); }
        .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .stat-label { font-size: 12px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 1px; }
        .stat-icon-wrap {
          width: 38px; height: 38px; border-radius: var(--admin-radius-md);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800;
        }
        .revenue-icon { background: rgba(197,168,128,0.1); color: var(--admin-accent-gold-dark); border: 1px solid rgba(197,168,128,0.2); }
        .orders-icon { background: rgba(234,179,8,0.08); color: #d97706; border: 1px solid rgba(234,179,8,0.15); }
        .products-icon { background: rgba(139,92,246,0.08); color: #7c3aed; border: 1px solid rgba(139,92,246,0.15); }
        .users-icon { background: rgba(59,130,246,0.08); color: #2563eb; border: 1px solid rgba(59,130,246,0.15); }
        .stat-value { font-size: 30px; font-weight: 800; color: var(--admin-text-main); margin-bottom: 6px; letter-spacing: -0.5px; }
        .stat-footer { font-size: 12px; color: var(--admin-text-muted); }
        .pending-badge {
          background: rgba(245,158,11,0.1); color: #d97706; padding: 2px 8px;
          border-radius: 6px; font-size: 11px; font-weight: 600;
        }

        /* Dashboard Grid */
        .dashboard-grid { display: grid; grid-template-columns: 5fr 3fr; gap: 20px; }
        @media (max-width: 960px) { .dashboard-grid { grid-template-columns: 1fr; } }

        .dashboard-left-stack { display: flex; flex-direction: column; gap: 20px; }

        .card {
          background: var(--admin-bg-card); border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg); padding: 28px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
        }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .card-heading { font-size: 17px; font-weight: 800; color: var(--admin-text-main); margin: 0; }
        .card-link { font-size: 12.5px; font-weight: 700; color: var(--admin-accent-gold-dark); text-decoration: none; transition: color 0.2s; }
        .card-link:hover { color: var(--admin-primary); text-decoration: underline; }

        /* Chart SVG */
        .chart-card { overflow: hidden; }
        .chart-legend { font-size: 12px; color: var(--admin-text-muted); font-weight: 500; }
        .chart-svg-container { width: 100%; position: relative; margin-top: 10px; }
        .chart-svg { width: 100%; height: auto; display: block; overflow: visible; }
        .chart-axis-label { font-size: 8px; fill: var(--admin-text-muted); font-family: var(--font-body); font-weight: 500; }
        .chart-hover-trigger { cursor: pointer; }
        .chart-dot-group circle { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), r 0.2s; }
        .chart-dot-group:hover circle:first-child { r: 7.5; transform: scale(1.2); }

        /* Empty box */
        .empty-box { text-align: center; padding: 40px 20px; color: var(--admin-text-muted); }
        .empty-icon { font-size: 32px; display: block; margin-bottom: 10px; }
        .empty-box p { font-size: 13px; margin: 0; }

        /* Orders List */
        .orders-list { display: flex; flex-direction: column; }
        .order-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-bottom: 1px solid var(--admin-border); gap: 12px;
          transition: background-color 0.2s;
        }
        .order-row:last-child { border-bottom: none; }
        .order-left { display: flex; align-items: center; gap: 14px; }
        .order-id { font-weight: 800; color: var(--admin-text-main); font-size: 14px; min-width: 44px; }
        .order-meta { display: flex; align-items: center; gap: 6px; }
        .order-items-count { font-size: 12.5px; color: var(--admin-text-muted); }
        .order-dot { color: #cbd5e1; font-size: 10px; }
        .order-date { font-size: 12.5px; color: var(--admin-text-muted); }
        .order-right { display: flex; align-items: center; gap: 16px; }
        .order-amount { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--admin-text-main); }

        .badge {
          display: inline-flex; align-items: center; padding: 4px 10px;
          border-radius: 8px; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .badge-green { background: #f0fdf4; color: #16a34a; }
        .badge-blue { background: #eff6ff; color: #2563eb; }
        .badge-yellow { background: #fffbeb; color: #d97706; }
        .badge-red { background: #fef2f2; color: #dc2626; }
        .badge-gray { background: #f1f5f9; color: #475569; }

        /* Quick Actions */
        .quick-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .action-item {
          display: flex; align-items: center; gap: 14px; padding: 14px 18px;
          border: 1px solid var(--admin-border); border-radius: var(--admin-radius-md);
          text-decoration: none; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
          background: #ffffff;
        }
        .action-item:hover { border-color: var(--admin-accent-gold); background: rgba(197, 168, 128, 0.03); transform: translateX(3px); }
        .action-icon-box {
          width: 42px; height: 42px; border-radius: var(--admin-radius-md);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .action-icon-box.purple { background: rgba(139,92,246,0.08); color: #7c3aed; }
        .action-icon-box.teal { background: rgba(20,184,166,0.08); color: #0d9488; }
        .action-icon-box.amber { background: rgba(245,158,11,0.08); color: #d97706; }
        .action-icon-box.gold { background: rgba(197, 168, 128, 0.1); color: var(--admin-accent-gold-dark); border: 0.5px solid rgba(197,168,128,0.2); }
        .action-title { font-size: 14px; font-weight: 700; color: var(--admin-text-main); margin: 0 0 2px; }
        .action-desc { font-size: 11px; color: var(--admin-text-muted); margin: 0; }
        .action-arrow { margin-left: auto; color: #cbd5e1; font-size: 16px; transition: all 0.2s; }
        .action-item:hover .action-arrow { color: var(--admin-accent-gold-dark); }
      `}</style>
    </div>
  );
}
