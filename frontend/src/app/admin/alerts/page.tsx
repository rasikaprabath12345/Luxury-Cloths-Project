"use client";

import { useState, useEffect } from "react";
import { productsAPI, categoriesAPI, ordersAPI, authAPI, stockAPI } from "@/lib/api";
import Link from "next/link";
import { showToast } from "@/lib/adminUtils";

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
}

export default function AdminAlertsPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allStock, setAllStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertFilter, setAlertFilter] = useState<"all" | "critical" | "warning" | "notice">("all");

  const fetchDiagnostics = async () => {
    try {
      const [ordersRes, stockRes] = await Promise.allSettled([
        ordersAPI.getAllOrders(),
        stockAPI.getAllStock(),
      ]);

      if (ordersRes.status === "fulfilled") {
        setAllOrders(ordersRes.value.data || []);
      }
      if (stockRes.status === "fulfilled") {
        setAllStock(stockRes.value.data || []);
      }
    } catch (error) {
      console.error("Error loading alerts data:", error);
      showToast("Failed to reload alerts information", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    const intervalId = setInterval(() => {
      fetchDiagnostics();
    }, 10000); // 10 seconds auto-refresh loop
    return () => clearInterval(intervalId);
  }, []);

  const formatCurrency = (amount: number) =>
    "Rs. " + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getActiveAlerts = () => {
    const list: Array<{
      id: string;
      type: "critical" | "warning" | "notice";
      title: string;
      description: string;
      actionUrl: string;
      actionText: string;
    }> = [];

    // 1. Stock Alerts
    allStock.forEach((p: any) => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v: any) => {
          if (v.stockQuantity === 0) {
            list.push({
              id: `stock-critical-${p.productId}-${v.variantId}`,
              type: "critical",
              title: "Critical Out of Stock",
              description: `"${p.productName}" (Size: ${v.size}${v.color && v.color !== 'Default' ? `, Color: ${v.color}` : ''}) is out of stock.`,
              actionUrl: "/admin/stock",
              actionText: "Refill Stock",
            });
          } else if (v.stockQuantity <= 5) {
            list.push({
              id: `stock-warning-${p.productId}-${v.variantId}`,
              type: "warning",
              title: "Low Stock Warning",
              description: `"${p.productName}" (Size: ${v.size}) has only ${v.stockQuantity} items left in inventory.`,
              actionUrl: "/admin/stock",
              actionText: "Manage Stock",
            });
          }
        });
      }
    });

    // 2. Pending & Delayed Order Alerts
    allOrders.forEach((o: any) => {
      const orderStatus = o.status?.toLowerCase();
      if (orderStatus === "pending") {
        const orderTime = new Date(o.orderDate).getTime();
        const hrsOld = (Date.now() - orderTime) / (1000 * 60 * 60);

        if (hrsOld > 24) {
          list.push({
            id: `order-delayed-${o.id}`,
            type: "critical",
            title: "Delayed Order Alert",
            description: `Order #${o.id} remains unprocessed after ${Math.floor(hrsOld)} hours.`,
            actionUrl: `/admin/orders/${o.id}`,
            actionText: "Fulfill Now",
          });
        } else if (o.totalAmount > 30000) {
          list.push({
            id: `order-highval-${o.id}`,
            type: "notice",
            title: "Premium Order Received",
            description: `High-value order #${o.id} totaling ${formatCurrency(o.totalAmount)} is awaiting approval.`,
            actionUrl: `/admin/orders/${o.id}`,
            actionText: "Verify Order",
          });
        } else {
          list.push({
            id: `order-pending-${o.id}`,
            type: "warning",
            title: "Pending Approval",
            description: `New order #${o.id} placed by customer is awaiting approval.`,
            actionUrl: `/admin/orders/${o.id}`,
            actionText: "Review Order",
          });
        }
      }
    });

    return list;
  };

  const activeAlerts = getActiveAlerts();
  const filteredAlerts = activeAlerts.filter(a => alertFilter === "all" ? true : a.type === alertFilter);

  if (loading) {
    return (
      <div className="loading-container">
        <span className="main-spinner" />
        <p>Analyzing system diagnostics...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            color: var(--admin-text-muted);
          }
          .main-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(197, 168, 128, 0.1);
            border-top-color: var(--admin-accent-gold-dark);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="alerts-page-container">
      <header className="page-header">
        <div className="header-title-group">
          <span className="bell-glow-icon">🔔</span>
          <div>
            <h1 className="page-title">Diagnostics & Alerts</h1>
            <p className="page-subtitle">Inspect critical inventory thresholds, product outages, and processing delays.</p>
          </div>
        </div>
        <div className="header-actions-group" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div className="live-status-badge">
            <span className="live-dot" />
            <span>Live Monitoring Active (10s)</span>
          </div>
          <button onClick={fetchDiagnostics} className="btn-refresh">🔄 Refresh Diagnostics</button>
        </div>
      </header>

      <div className="alert-center-card">
        <div className="alert-center-header">
          <div className="alert-filter-tabs">
            {(["all", "critical", "warning", "notice"] as const).map(tab => {
              const count = activeAlerts.filter(a => tab === "all" ? true : a.type === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setAlertFilter(tab)}
                  className={`alert-tab-btn type-${tab} ${alertFilter === tab ? "active" : ""}`}
                >
                  {tab === "all" ? "All Alerts" : tab === "critical" ? "🔴 Critical" : tab === "warning" ? "🟡 Warnings" : "🔵 Notices"}
                  <span className="tab-count-badge">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="empty-alerts">
            <span className="success-shield-icon">🛡️</span>
            <p className="empty-title">All Systems Operating Normally</p>
            <p className="empty-desc">There are no warnings or active inventory alerts at this time.</p>
          </div>
        ) : (
          <div className="alerts-list-wrapper">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className={`alert-list-item severity-${alert.type}`}>
                <div className="alert-badge-wrap">
                  <span className="alert-badge">{alert.title}</span>
                </div>
                <p className="alert-desc">{alert.description}</p>
                <Link href={alert.actionUrl} className="alert-item-btn">
                  {alert.actionText} →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .alerts-page-container { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .header-title-group { display: flex; align-items: center; gap: 16px; }
        
        .page-title { font-size: 32px; font-weight: 900; color: var(--admin-text-main); margin: 0 0 4px; }
        .page-subtitle { font-size: 13.5px; color: var(--admin-text-muted); margin: 0; }

        .btn-refresh {
          padding: 10px 18px; border: 1.5px solid var(--admin-border); border-radius: var(--admin-radius-md);
          font-size: 12.5px; font-weight: 700; background: #ffffff; color: var(--admin-text-muted);
          cursor: pointer; transition: all 0.2s; font-family: var(--font-body);
        }
        .btn-refresh:hover { border-color: var(--admin-accent-gold-dark); color: var(--admin-text-main); }

        .bell-glow-icon {
          width: 48px; height: 48px; border-radius: 14px; background: rgba(197, 168, 128, 0.12);
          display: flex; align-items: center; justify-content: center; font-size: 22px;
          animation: bellGlowPulse 2s infinite ease-in-out;
        }
        @keyframes bellGlowPulse {
          0% { box-shadow: 0 0 0 0 rgba(197, 168, 128, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(197, 168, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(197, 168, 128, 0); }
        }

        .alert-center-card {
          background: #ffffff; border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg); padding: 28px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.015);
        }
        .alert-center-header {
          border-bottom: 1.5px solid var(--admin-border); padding-bottom: 20px;
          margin-bottom: 24px;
        }
        
        .alert-filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .alert-tab-btn {
          padding: 8px 14px; border-radius: 8px; border: 1.5px solid var(--admin-border);
          font-size: 11.5px; font-weight: 700; background: #f8fafc; color: var(--admin-text-muted);
          cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
          font-family: var(--font-body);
        }
        .alert-tab-btn:hover { border-color: var(--admin-accent-gold-dark); color: var(--admin-text-main); }
        .alert-tab-btn.active {
          background: var(--admin-primary); border-color: var(--admin-primary); color: #ffffff;
        }
        .tab-count-badge {
          font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px;
          background: rgba(15,23,42,0.06); color: var(--admin-text-main);
        }
        .alert-tab-btn.active .tab-count-badge {
          background: rgba(255,255,255,0.25); color: #ffffff;
        }

        .empty-alerts { text-align: center; padding: 60px 24px; }
        .success-shield-icon {
          width: 56px; height: 56px; border-radius: 50%; background: #f0fdf4;
          display: flex; align-items: center; justify-content: center; font-size: 28px;
          margin: 0 auto 18px; color: #16a34a; border: 1px solid #bbf7d0;
        }
        .empty-title { font-size: 16px; font-weight: 800; color: var(--admin-text-main); margin: 0 0 6px; }
        .empty-desc { font-size: 13.5px; color: var(--admin-text-muted); margin: 0; font-weight: 500; }

        .alerts-list-wrapper { display: flex; flex-direction: column; gap: 12px; }
        .alert-list-item {
          display: flex; align-items: center; gap: 16px; padding: 16px 20px;
          background: #f8fafc; border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md); transition: all 0.2s;
        }
        .alert-list-item:hover { background: #fafbfc; box-shadow: 0 4px 12px rgba(15,23,42,0.01); }
        
        .alert-list-item.severity-critical { border-left: 4px solid #ef4444; }
        .alert-list-item.severity-warning { border-left: 4px solid #f59e0b; }
        .alert-list-item.severity-notice { border-left: 4px solid #3b82f6; }

        .alert-badge-wrap { min-width: 150px; }
        .alert-badge {
          display: inline-block; font-size: 10.5px; font-weight: 800; padding: 4px 10px;
          border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .severity-critical .alert-badge { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .severity-warning .alert-badge { background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; }
        .severity-notice .alert-badge { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }

        .alert-desc { flex: 1; font-size: 13.5px; color: var(--admin-text-main); font-weight: 600; margin: 0; }
        .alert-item-btn {
          font-size: 12px; font-weight: 700; color: var(--admin-accent-gold-dark);
          text-decoration: none; padding: 8px 14px; border-radius: 6px;
          border: 1px solid var(--admin-border); background: #ffffff; transition: all 0.2s;
          font-family: var(--font-body);
        }
        .alert-item-btn:hover {
          border-color: var(--admin-accent-gold); background: rgba(197, 168, 128, 0.05); color: var(--admin-text-main);
        }
        @media (max-width: 768px) {
          .alert-list-item { flex-direction: column; align-items: flex-start; gap: 10px; padding: 16px; }
          .alert-badge-wrap { min-width: auto; }
          .alert-item-btn { width: 100%; text-align: center; }
        }

        .live-status-badge {
          display: flex; align-items: center; gap: 8px; font-size: 11px;
          color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0;
          padding: 6px 12px; border-radius: 6px; font-weight: 700;
        }
        .live-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #16a34a;
          display: inline-block; animation: pulseGreen 2s infinite ease-in-out;
        }
        @keyframes pulseGreen {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(22, 163, 74, 0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
      `}</style>
    </div>
  );
}
