"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
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
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <span className="admin-sidebar-logo-icon">💎</span>
            <div>
              <h2 className="admin-sidebar-title">LUXURY</h2>
              <p className="admin-sidebar-subtitle">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <p className="admin-sidebar-nav-label">MAIN MENU</p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="admin-sidebar-link-icon">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <span className="admin-sidebar-active-dot" />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="admin-sidebar-divider" />

        {/* Storefront Link */}
        <div style={{ padding: "0 20px", marginBottom: 12 }}>
          <Link
            href="/storefront"
            className="admin-sidebar-link"
            style={{ color: "#a1a1aa" }}
            onClick={() => setMobileOpen(false)}
          >
            <span className="admin-sidebar-link-icon">🏪</span>
            <span>View Storefront</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-user-avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="admin-sidebar-user-info">
            <p className="admin-sidebar-user-name">{user?.fullName || "Admin"}</p>
            <p className="admin-sidebar-user-role">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="admin-sidebar-logout"
            title="Logout"
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
          background: #09090b;
          border: 1px solid #27272a;
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .admin-sidebar-toggle:hover {
          background: #18181b;
          border-color: #3b82f6;
        }

        .admin-sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: #09090b;
          border-right: 1px solid #1a1a1f;
          display: flex;
          flex-direction: column;
          z-index: 1050;
          overflow-y: auto;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-sidebar-brand {
          padding: 24px 20px 20px;
          border-bottom: 1px solid #1a1a1f;
        }
        .admin-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-sidebar-logo-icon {
          font-size: 28px;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
        }
        .admin-sidebar-title {
          font-size: 18px;
          font-weight: 900;
          color: #3b82f6;
          letter-spacing: 3px;
          margin: 0;
          line-height: 1.2;
        }
        .admin-sidebar-subtitle {
          font-size: 11px;
          color: #52525b;
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
          color: #3f3f46;
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
          color: #a1a1aa;
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
          margin-bottom: 4px;
        }
        .admin-sidebar-link:hover {
          background: #18181b;
          color: #fff;
        }
        .admin-sidebar-link.active {
          background: linear-gradient(135deg, #1e3a5f 0%, #172554 100%);
          color: #60a5fa;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
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
          background: #3b82f6;
          margin-left: auto;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
        }

        .admin-sidebar-divider {
          height: 1px;
          background: #1a1a1f;
          margin: 0 20px 12px;
        }

        .admin-sidebar-user {
          padding: 16px 20px;
          border-top: 1px solid #1a1a1f;
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
          color: #e4e4e7;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .admin-sidebar-user-role {
          font-size: 11px;
          color: #52525b;
          margin: 0;
        }
        .admin-sidebar-logout {
          background: none;
          border: 1px solid #27272a;
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
