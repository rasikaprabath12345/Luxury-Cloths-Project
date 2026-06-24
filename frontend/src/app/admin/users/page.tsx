"use client";

import { useState, useEffect } from "react";
import { authAPI } from "@/lib/api";
import { AdminOnly } from "@/components/AdminOnly";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, currentRole: string) => {
    const newRole = currentRole.toLowerCase() === "admin" ? "Customer" : "Admin";
    const confirmMsg = `Are you sure you want to change this user's role to ${newRole}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await authAPI.updateUserRole(userId, newRole);
      alert("User role updated successfully!");
      // Update locally
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesRole =
      roleFilter === "" || user.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <AdminOnly>
      <div className="users-container">
        <header className="page-header">
          <div>
            <h1 className="page-title">Users Accounts</h1>
            <p className="page-subtitle">Verify user details, view registered accounts, and promote administrators.</p>
          </div>
        </header>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="toolbar-input"
            />
          </div>
          <div className="filter-box">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-card">
          {loading ? (
            <div className="loading-state">Loading user directories...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">No users found matching your search.</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isAdmin = user.role?.toLowerCase() === "admin";
                    return (
                      <tr key={user.id}>
                        <td className="font-mono text-zinc">#{user.id}</td>
                        <td>
                          <div className="user-profile-cell">
                            <div className="user-avatar">
                              {user.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-name">{user.fullName}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone || "Not provided"}</td>
                        <td>
                          <span className={`badge ${isAdmin ? "badge-admin" : "badge-customer"}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleRoleChange(user.id, user.role)}
                            className={`btn-action ${isAdmin ? "btn-demote" : "btn-promote"}`}
                          >
                            {isAdmin ? "Demote to Customer" : "Promote to Admin"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .users-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 900;
          color: #fff;
          margin: 0 0 6px;
        }

        .page-subtitle {
          font-size: 14px;
          color: #a1a1aa;
          margin: 0;
        }

        .toolbar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 280px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #52525b;
          font-size: 14px;
        }
        .toolbar-input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 12px;
          color: #fff;
          outline: none;
          font-size: 14px;
          transition: all 0.2s;
        }
        .toolbar-input:focus {
          border-color: #3b82f6;
        }

        .filter-box {
          min-width: 150px;
        }
        .toolbar-select {
          width: 100%;
          padding: 12px 16px;
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 12px;
          color: #fff;
          outline: none;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toolbar-select:focus {
          border-color: #3b82f6;
        }

        .table-card {
          background-color: #09090b;
          border: 1px solid #1a1a1f;
          border-radius: 16px;
          overflow: hidden;
        }

        .loading-state,
        .empty-state {
          padding: 60px;
          text-align: center;
          color: #71717a;
          font-size: 14px;
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
          padding: 16px;
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

        .user-profile-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .user-name {
          font-weight: 700;
          color: #fff;
        }

        .font-mono {
          font-family: monospace;
          font-size: 13px;
        }
        .text-zinc {
          color: #71717a;
        }
        .text-right {
          text-align: right;
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
        .badge-admin {
          background-color: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }
        .badge-customer {
          background-color: rgba(161, 161, 170, 0.15);
          color: #d4d4d8;
        }

        .btn-action {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: #18181b;
          border: 1px solid #27272a;
        }
        .btn-promote {
          color: #3b82f6;
        }
        .btn-promote:hover {
          border-color: #3b82f6;
          background-color: rgba(59, 130, 246, 0.05);
        }
        .btn-demote {
          color: #f87171;
        }
        .btn-demote:hover {
          border-color: #ef4444;
          background-color: rgba(239, 68, 68, 0.05);
        }
      `}</style>
    </AdminOnly>
  );
}
