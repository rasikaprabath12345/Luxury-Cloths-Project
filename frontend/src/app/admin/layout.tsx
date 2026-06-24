"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { AdminOnly } from "@/components/AdminOnly";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminOnly>
      <div className="admin-layout-container">
        <AdminSidebar />
        <main className="admin-main-content">
          {children}
        </main>
      </div>

      <style jsx global>{`
        body {
          background-color: #09090b !important;
          color: #f4f4f5 !important;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
      `}</style>

      <style jsx>{`
        .admin-layout-container {
          min-h: 100vh;
          background-color: #09090b;
          display: flex;
        }

        .admin-main-content {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          padding: 40px;
          background-color: #09090b;
          position: relative;
          overflow-x: hidden;
        }

        @media (max-width: 860px) {
          .admin-main-content {
            margin-left: 0;
            padding: 80px 20px 40px;
          }
        }
      `}</style>
    </AdminOnly>
  );
}