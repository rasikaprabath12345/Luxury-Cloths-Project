"use client";

import { useState, useEffect } from "react";
import { authAPI } from "@/lib/api";
import { showToast, showConfirm } from "@/lib/adminUtils";
import { md5 } from "@/utils/md5";

interface User {
  id: number; fullName: string; email: string; phone: string;
  avatar?: string; role: string; createdAt: string;
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
      showToast("Failed to load users", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDeleteUser = (userId: number, userName: string) => {
    showConfirm(
      "Delete User Account",
      `Are you sure you want to permanently delete user <strong>"${userName}"</strong>? This action cannot be undone.`,
      async () => {
        try {
          await authAPI.deleteUser(userId);
          showToast(`"${userName}" has been deleted`, "success");
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (error) {
          showToast("Failed to delete user account", "error");
        }
      },
      "Delete",
      "danger"
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesRole = roleFilter === "" || user.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role?.toLowerCase() === "admin").length;
  const customerCount = users.filter((u) => u.role?.toLowerCase() === "customer").length;

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="users-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered accounts</p>
        </div>
        <div className="role-pills">
          <span className="pill admin-pill">🛡️ {adminCount} Admins</span>
          <span className="pill customer-pill">👤 {customerCount} Customers</span>
        </div>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <svg className="search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search by name, email, or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="toolbar-input" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="toolbar-select">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-skeleton">
            {[1,2,3,4].map((i) => (
              <div key={i} className="skeleton-row">
                <div className="shimmer" style={{width:40,height:40,borderRadius:'50%'}} />
                <div style={{flex:1}}>
                  <div className="shimmer" style={{width:'50%',height:14,marginBottom:8}} />
                  <div className="shimmer" style={{width:'30%',height:12}} />
                </div>
                <div className="shimmer" style={{width:70,height:24,borderRadius:6}} />
                <div className="shimmer" style={{width:80,height:30,borderRadius:8}} />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">👥</span><p>No users found</p></div>
        ) : (
          <div className="users-list">
            {filteredUsers.map((user) => (
              <div key={user.id} className="user-row">
                <div className="user-avatar">
                  <img
                    src={user.avatar || `https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}?d=identicon`}
                    alt={user.fullName}
                    className="avatar-img"
                  />
                </div>
                <div className="user-info">
                  <span className="user-name">{user.fullName || "Unnamed User"}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <div className="user-phone">{user.phone || "—"}</div>
                <div className="user-date">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </div>
                <div className="user-role">
                  <span className={`role-badge ${user.role?.toLowerCase() === "admin" ? "role-admin" : "role-customer"}`}>
                    {user.role?.toLowerCase() === "admin" ? "🛡️" : "👤"} {user.role}
                  </span>
                </div>
                {user.role?.toLowerCase() !== "admin" ? (
                  <button
                    className="role-btn demote-btn"
                    onClick={() => handleDeleteUser(user.id, user.fullName)}
                  >
                    Delete
                  </button>
                ) : (
                  <div style={{ width: 72 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .users-container { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
        .page-subtitle { font-size: 13px; color: #64748b; margin: 0; }
        .role-pills { display: flex; gap: 8px; }
        .pill { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; }
        .admin-pill { background: rgba(139,92,246,0.08); color: #7c3aed; }
        .customer-pill { background: rgba(59,130,246,0.08); color: #2563eb; }

        .toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .search-box { position: relative; flex: 1; min-width: 240px; }
        .search-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .toolbar-input { width: 100%; padding: 11px 16px 11px 40px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; color: #0f172a; outline: none; font-size: 13px; }
        .toolbar-input:focus { border-color: #3b82f6; }
        .toolbar-select { padding: 11px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; color: #0f172a; outline: none; font-size: 13px; cursor: pointer; min-width: 140px; }
        .toolbar-select:focus { border-color: #3b82f6; }

        .table-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .loading-skeleton { padding: 8px 24px; }
        .skeleton-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #e2e8f0; }
        .empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
        .empty-icon { font-size: 32px; display: block; margin-bottom: 10px; }
        .empty-state p { font-size: 13px; margin: 0; }

        .users-list { display: flex; flex-direction: column; }
        .user-row {
          display: flex; align-items: center; gap: 16px; padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0; transition: background 0.15s;
        }
        .user-row:last-child { border-bottom: none; }
        .user-row:hover { background: rgba(15,23,42,0.015); }

        .user-avatar { flex-shrink: 0; }
        .avatar-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .avatar-placeholder {
          width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff;
        }

        .user-info { flex: 1; min-width: 0; }
        .user-name { display: block; font-weight: 600; color: #0f172a; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-email { display: block; font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .user-phone { font-size: 12px; color: #475569; min-width: 100px; }
        .user-date { font-size: 12px; color: #64748b; min-width: 90px; }

        .role-badge { padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
        .role-admin { background: rgba(139,92,246,0.08); color: #7c3aed; }
        .role-customer { background: rgba(59,130,246,0.08); color: #2563eb; }

        .role-btn {
          padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;
          border: 1px solid; transition: all 0.2s; white-space: nowrap;
        }
        .promote-btn { background: rgba(22,163,74,0.08); border-color: rgba(22,163,74,0.2); color: #16a34a; }
        .promote-btn:hover { background: rgba(22,163,74,0.15); border-color: rgba(22,163,74,0.4); }
        .demote-btn { background: rgba(220,38,38,0.08); border-color: rgba(220,38,38,0.2); color: #dc2626; }
        .demote-btn:hover { background: rgba(220,38,38,0.15); border-color: rgba(220,38,38,0.4); }

        @media (max-width: 768px) {
          .user-phone, .user-date { display: none; }
          .user-row { gap: 12px; }
        }
        @media (max-width: 480px) {
          .role-badge { display: none; }
        }
      `}</style>
    </div>
  );
}
