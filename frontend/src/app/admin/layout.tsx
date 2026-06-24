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

        {/* Toast container for notifications */}
        <div id="admin-toast-container" />
      </div>

      <style jsx global>{`
        body {
          background-color: #f8fafc !important;
          color: #0f172a !important;
          margin: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        /* Professional Toast Notifications */
        #admin-toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .admin-toast {
          pointer-events: auto;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 32px rgba(15,23,42,0.08);
          animation: toastIn 0.35s cubic-bezier(0.4,0,0.2,1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(226,232,240,0.8);
          min-width: 280px;
          max-width: 420px;
        }
        .admin-toast.toast-success {
          background: #f0fdf4;
          color: #16a34a;
          border-color: #bbf7d0;
        }
        .admin-toast.toast-error {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }
        .admin-toast.toast-warning {
          background: #fffbeb;
          color: #d97706;
          border-color: #fef3c7;
        }
        .admin-toast.toast-info {
          background: #eff6ff;
          color: #2563eb;
          border-color: #dbeafe;
        }
        .admin-toast.removing {
          animation: toastOut 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .admin-toast-icon { font-size: 18px; flex-shrink: 0; }
        .admin-toast-close {
          margin-left: auto;
          background: none;
          border: none;
          color: inherit;
          opacity: 0.5;
          cursor: pointer;
          font-size: 14px;
          padding: 2px 6px;
          border-radius: 4px;
          transition: opacity 0.2s;
        }
        .admin-toast-close:hover { opacity: 1; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(40px) scale(0.95); }
        }

        /* Confirm Dialog */
        .admin-confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.3);
          backdrop-filter: blur(6px);
          z-index: 9990;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .admin-confirm-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 24px 48px rgba(15,23,42,0.1);
          animation: scaleIn 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .admin-confirm-title {
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
        }
        .admin-confirm-msg {
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
          margin: 0 0 24px;
        }
        .admin-confirm-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .admin-confirm-btn {
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .admin-confirm-cancel {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .admin-confirm-cancel:hover { background: #e2e8f0; color: #0f172a; }
        .admin-confirm-danger {
          background: #dc2626;
          color: #fff;
        }
        .admin-confirm-danger:hover { background: #b91c1c; }
        .admin-confirm-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
        }
        .admin-confirm-primary:hover { background: #2563eb; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Shimmer loading */
        .shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <style jsx>{`
        .admin-layout-container {
          min-height: 100vh;
          background-color: #f8fafc;
          display: flex;
        }

        .admin-main-content {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          padding: 40px;
          background-color: #f8fafc;
          position: relative;
          overflow-x: hidden;
        }

        @media (max-width: 860px) {
          .admin-main-content {
            margin-left: 0;
            padding: 80px 16px 40px;
          }
        }
      `}</style>
    </AdminOnly>
  );
}