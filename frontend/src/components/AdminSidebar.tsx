"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/stock", label: "Stock", icon: "📋" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
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

      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`} style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "260px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid var(--admin-border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1050,
        overflowY: "auto",
      }}>
        {/* Brand */}
        <div className="admin-sidebar-brand" style={{ padding: "28px 24px 24px", borderBottom: "1px solid var(--admin-border)" }}>
          <div className="admin-sidebar-logo" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="admin-sidebar-logo-icon" style={{ fontSize: "28px", filter: "drop-shadow(0 2px 4px rgba(197, 168, 128, 0.3))" }}>💎</span>
            <div>
              <h2 className="admin-sidebar-title" style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: 900, color: "var(--admin-primary)", letterSpacing: "2.5px", margin: 0, lineHeight: 1.2 }}>LUXURY<span style={{ color: "var(--admin-accent-gold)" }}>.LK</span></h2>
              <p className="admin-sidebar-subtitle" style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, color: "var(--admin-text-muted)", letterSpacing: "1px", margin: 0, textTransform: "uppercase" }}>Control Center</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, padding: "24px 16px" }}>
          <p className="admin-sidebar-nav-label" style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 800, color: "var(--admin-text-muted)", letterSpacing: "2px", padding: "0 12px", margin: "0 0 12px" }}>MANAGEMENT</p>
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
                  gap: "14px",
                  padding: "12px 16px",
                  borderRadius: "var(--admin-radius-md)",
                  fontSize: "13.5px",
                  fontFamily: "var(--font-body)",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--admin-accent-gold-dark)" : "var(--admin-text-muted)",
                  background: isActive ? "linear-gradient(135deg, rgba(197, 168, 128, 0.06) 0%, rgba(197, 168, 128, 0.12) 100%)" : "transparent",
                  border: isActive ? "1px solid rgba(197, 168, 128, 0.15)" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  marginBottom: "4px",
                  boxShadow: isActive ? "0 4px 12px rgba(197, 168, 128, 0.05)" : "none",
                }}
                onClick={() => setMobileOpen(false)}
              >
                <span className="admin-sidebar-link-icon" style={{ fontSize: "16px", width: "24px", textAlign: "center", filter: isActive ? "grayscale(0)" : "grayscale(0.6)" }}>{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <span className="admin-sidebar-active-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--admin-accent-gold)", marginLeft: "auto" }} />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="admin-sidebar-divider" style={{ height: "1px", background: "var(--admin-border)", margin: "0 24px 12px" }} />

        {/* Storefront Link */}
        <div style={{ padding: "0 24px", marginBottom: 12 }}>
          <Link
            href="/"
            className="admin-sidebar-link storefront-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 16px",
              borderRadius: "var(--admin-radius-md)",
              fontSize: "13.5px",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              color: "var(--admin-text-muted)",
              textDecoration: "none",
              transition: "all 0.2s",
              border: "1px solid transparent",
            }}
            onClick={() => setMobileOpen(false)}
          >
            <span className="admin-sidebar-link-icon" style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>🏪</span>
            <span>Customer Store</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="admin-sidebar-user" style={{
          padding: "18px 24px",
          borderTop: "1px solid var(--admin-border)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "auto",
        }}>
          <div className="admin-sidebar-user-avatar" style={{
            width: "38px",
            height: "38px",
            borderRadius: "var(--admin-radius-md)",
            background: "linear-gradient(135deg, var(--admin-primary), var(--admin-primary-light))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
            border: "1.5px solid var(--admin-accent-gold)",
          }}>
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="admin-sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
            <p className="admin-sidebar-user-name" style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--admin-text-main)",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>{user?.fullName || "Admin"}</p>
            <p className="admin-sidebar-user-role" style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--admin-text-muted)", margin: 0, fontWeight: 500 }}>Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="admin-sidebar-logout"
            title="Logout"
            style={{
              background: "none",
              border: "1px solid var(--admin-border)",
              borderRadius: "8px",
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: "15px",
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
          border: 1px solid var(--admin-border);
          color: var(--admin-text-main);
          width: 44px;
          height: 44px;
          border-radius: var(--admin-radius-md);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(15,23,42,0.05);
        }
        .admin-sidebar-toggle:hover {
          background: #f8fafc;
          border-color: var(--admin-accent-gold);
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
          border-right: 1px solid var(--admin-border);
          display: flex;
          flex-direction: column;
          z-index: 1050;
          overflow-y: auto;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .admin-sidebar-link:hover {
          background: #f8fafc !important;
          color: var(--admin-text-main) !important;
        }
        .admin-sidebar-link:hover .admin-sidebar-link-icon {
          filter: grayscale(0) !important;
        }
        
        .admin-sidebar-link.active:hover {
          background: linear-gradient(135deg, rgba(197, 168, 128, 0.08) 0%, rgba(197, 168, 128, 0.15) 100%) !important;
          color: var(--admin-accent-gold-dark) !important;
        }

        .admin-sidebar-logout:hover {
          background: #fef2f2 !important;
          border-color: #fecaca !important;
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

