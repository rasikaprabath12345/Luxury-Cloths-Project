"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/users", label: "Users", icon: "👥" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="admin-sidebar-toggle"
        aria-label="Toggle sidebar"
      >
        <span style={{ fontSize: 22 }}>{mobileOpen ? "✕" : "☰"}</span>
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`} style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "260px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        zIndex: 1050,
        overflowY: "auto",
      }}>
        {/* Brand */}
        <div className="admin-sidebar-brand" style={{ padding: "24px 20px 20px", borderBottom: "1px solid #e2e8f0" }}>
          <div className="admin-sidebar-logo" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="admin-sidebar-logo-icon" style={{ fontSize: "28px" }}>💎</span>
            <div>
              <h2 className="admin-sidebar-title" style={{ fontSize: "18px", fontWeight: 900, color: "#2563eb", letterSpacing: "3px", margin: 0, lineHeight: 1.2 }}>LUXURY</h2>
              <p className="admin-sidebar-subtitle" style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", margin: 0, textTransform: "uppercase" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, padding: "20px 12px" }}>
          <p className="admin-sidebar-nav-label" style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "2px", padding: "0 12px", margin: "0 0 12px" }}>MAIN MENU</p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link ${isActive ? "active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#1d4ed8" : "#475569",
                  background: isActive ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  position: "relative",
                  marginBottom: "4px",
                  boxShadow: isActive ? "0 4px 12px rgba(59, 130, 246, 0.08)" : "none",
                }}
                onClick={() => setMobileOpen(false)}
              >
                <span className="admin-sidebar-link-icon" style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <span className="admin-sidebar-active-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb", marginLeft: "auto" }} />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="admin-sidebar-divider" style={{ height: "1px", background: "#e2e8f0", margin: "0 20px 12px" }} />

        {/* Storefront Link */}
        <div style={{ padding: "0 20px", marginBottom: 12 }}>
          <Link
            href="/"
            className="admin-sidebar-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#475569",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onClick={() => setMobileOpen(false)}
          >
            <span className="admin-sidebar-link-icon" style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>🏪</span>
            <span>Home</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="admin-sidebar-user" style={{
          padding: "16px 20px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "auto",
        }}>
          <div className="admin-sidebar-user-avatar" style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}>
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="admin-sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
            <p className="admin-sidebar-user-name" style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0f172a",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>{user?.fullName || "Admin"}</p>
            <p className="admin-sidebar-user-role" style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="admin-sidebar-logout"
            title="Logout"
            style={{
              background: "none",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            🚪
          </button>
        </div>
      </aside>

      <style jsx>{`
        .admin-sidebar-toggle {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 1100;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .admin-sidebar-toggle:hover {
          background: #f1f5f9;
          border-color: #2563eb;
        }

        .admin-sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          z-index: 1050;
          overflow-y: auto;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-sidebar-brand {
          padding: 24px 20px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-sidebar-logo-icon {
          font-size: 28px;
        }
        .admin-sidebar-title {
          font-size: 18px;
          font-weight: 900;
          color: #2563eb;
          letter-spacing: 3px;
          margin: 0;
          line-height: 1.2;
        }
        .admin-sidebar-subtitle {
          font-size: 11px;
          color: #64748b;
          letter-spacing: 1px;
          margin: 0;
          text-transform: uppercase;
        }

        .admin-sidebar-nav {
          flex: 1;
          padding: 20px 12px;
        }
        .admin-sidebar-nav-label {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 2px;
          padding: 0 12px;
          margin: 0 0 12px;
        }

        .admin-sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
          margin-bottom: 4px;
        }
        .admin-sidebar-link:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .admin-sidebar-link.active {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #1d4ed8;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
        }
        .admin-sidebar-link-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }
        .admin-sidebar-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2563eb;
          margin-left: auto;
        }

        .admin-sidebar-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 0 20px 12px;
        }

        .admin-sidebar-user {
          padding: 16px 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: auto;
        }
        .admin-sidebar-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }
        .admin-sidebar-user-info {
          flex: 1;
          min-width: 0;
        }
        .admin-sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .admin-sidebar-user-role {
          font-size: 11px;
          color: #64748b;
          margin: 0;
        }
        .admin-sidebar-logout {
          background: none;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 6px 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .admin-sidebar-logout:hover {
          background: #dc2626;
          border-color: #dc2626;
        }

        @media (max-width: 860px) {
          .admin-sidebar-toggle {
            display: flex;
          }
          .admin-sidebar-overlay {
            display: block;
          }
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
