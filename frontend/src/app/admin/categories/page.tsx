"use client";

import { useState, useEffect } from "react";
import { categoriesAPI } from "@/lib/api";
import { showToast, showConfirm } from "@/lib/adminUtils";

interface Category { id: number; name: string; slug: string; }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      showToast("Failed to load categories", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAddModal = () => { setIsEditMode(false); setEditingCategoryId(null); setName(""); setSlug(""); setIsModalOpen(true); };
  const openEditModal = (cat: Category) => { setIsEditMode(true); setEditingCategoryId(cat.id); setName(cat.name); setSlug(cat.slug); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setName(""); setSlug(""); setEditingCategoryId(null); };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode) { setSlug(val.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")); }
  };

  const handleDelete = (id: number, catName: string) => {
    showConfirm(
      "Delete Category",
      `Are you sure you want to delete <strong>"${catName}"</strong>? Categories with products cannot be deleted.`,
      async () => {
        try {
          await categoriesAPI.deleteCategory(id);
          showToast(`"${catName}" removed`, "success");
          setCategories((prev) => prev.filter((c) => c.id !== id));
        } catch (error: any) {
          const msg = error.response?.data;
          showToast(typeof msg === "string" ? msg : "Cannot delete category with linked products", "error");
        }
      }
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return showToast("Please fill in all fields", "warning");
    setIsSubmitting(true);
    const payload = { id: isEditMode ? editingCategoryId : undefined, name, slug };
    try {
      if (isEditMode && editingCategoryId) {
        await categoriesAPI.updateCategory(editingCategoryId, payload);
        showToast(`Category "${name}" updated`, "success");
      } else {
        await categoriesAPI.createCategory(payload);
        showToast(`Category "${name}" created`, "success");
      }
      fetchCategories(); closeModal();
    } catch (error) {
      showToast("Failed to save category", "error");
    } finally { setIsSubmitting(false); }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="categories-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} divisions configured</p>
        </div>
        <button onClick={openAddModal} className="btn-primary"><span>+</span> New Category</button>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <svg className="search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="toolbar-input" />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-skeleton">
            {[1,2,3].map((i) => (
              <div key={i} className="skeleton-row">
                <div className="shimmer" style={{width:'30%',height:14}} />
                <div className="shimmer" style={{width:'20%',height:14}} />
                <div className="shimmer" style={{width:80,height:30,marginLeft:'auto'}} />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">🏷️</span><p>No categories found</p></div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Slug</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td><span className="cat-name">{cat.name}</span></td>
                    <td><code className="cat-slug">/{cat.slug}</code></td>
                    <td className="text-right">
                      <div className="actions-group">
                        <button onClick={() => openEditModal(cat)} className="btn-icon btn-edit" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="btn-icon btn-del" title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{isEditMode ? "Edit Category" : "New Category"}</h3>
              <button onClick={closeModal} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Category Name <span className="req">*</span></label>
                <input type="text" required value={name} onChange={(e) => handleNameChange(e.target.value)} className="form-input" placeholder="e.g. Silk Jackets" />
              </div>
              <div className="form-group">
                <label className="form-label">Slug <span className="req">*</span></label>
                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="form-input" placeholder="silk-jackets" />
                <span className="form-hint">URL path: /storefront/{slug || "..."}</span>
              </div>
              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-submit">
                  {isSubmitting ? (<><span className="spinner" /> Saving...</>) : isEditMode ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .categories-container { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
        .page-subtitle { font-size: 13px; color: #64748b; margin: 0; }
        .btn-primary { background: linear-gradient(135deg,#3b82f6,#2563eb); color: #fff; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; box-shadow: 0 4px 16px rgba(59,130,246,0.25); }
        .btn-primary:hover { transform: translateY(-1px); }

        .toolbar { margin-bottom: 20px; }
        .search-box { position: relative; max-width: 360px; }
        .search-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .toolbar-input { width: 100%; padding: 11px 16px 11px 40px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; color: #0f172a; outline: none; font-size: 13px; }
        .toolbar-input:focus { border-color: #3b82f6; }

        .table-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .loading-skeleton { padding: 8px 24px; }
        .skeleton-row { display: flex; align-items: center; gap: 24px; padding: 18px 0; border-bottom: 1px solid #e2e8f0; }
        .empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
        .empty-icon { font-size: 32px; display: block; margin-bottom: 10px; }
        .empty-state p { font-size: 13px; margin: 0; }

        .table-responsive { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th { color: #64748b; font-weight: 600; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; text-align: left; background: #f8fafc; }
        .admin-table td { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: rgba(15,23,42,0.015); }
        .text-right { text-align: right; }

        .cat-name { font-weight: 600; color: #0f172a; font-size: 14px; }
        .cat-slug { font-family: 'SF Mono', monospace; font-size: 12px; color: #475569; background: #f1f5f9; padding: 3px 8px; border-radius: 5px; }

        .actions-group { display: flex; gap: 6px; justify-content: flex-end; }
        .btn-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; }
        .btn-edit { color: #2563eb; }
        .btn-edit:hover { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
        .btn-del { color: #dc2626; }
        .btn-del:hover { border-color: #ef4444; background: rgba(239,68,68,0.05); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.3); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1200; padding: 16px; animation: fadeIn 0.2s ease; }
        .modal-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; width: 100%; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); animation: scaleIn 0.25s cubic-bezier(0.4,0,0.2,1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
        .modal-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
        .modal-close { background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; }
        .modal-close:hover { color: #0f172a; }

        .modal-form { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-label { font-size: 12px; font-weight: 600; color: #475569; }
        .req { color: #ef4444; }
        .form-input { width: 100%; padding: 11px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; color: #0f172a; font-size: 14px; outline: none; }
        .form-input:focus { border-color: #3b82f6; }
        .form-hint { font-size: 11px; color: #64748b; }

        .form-actions { display: flex; gap: 10px; margin-top: 8px; }
        .btn-cancel { flex: 1; padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; color: #475569; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 13px; }
        .btn-cancel:hover { background: #f1f5f9; color: #0f172a; }
        .btn-submit { flex: 1; padding: 12px; background: linear-gradient(135deg,#3b82f6,#2563eb); border: none; color: #fff; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
