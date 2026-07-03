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
        .categories-container { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 32px; font-weight: 900; color: var(--admin-text-main); margin: 0 0 4px; }
        .page-subtitle { font-size: 13.5px; color: var(--admin-text-muted); margin: 0; }
        
        .btn-primary { 
          background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-light)); 
          color: #fff; font-weight: 600; font-size: 13px; padding: 10px 20px; 
          border-radius: var(--admin-radius-md); border: none; cursor: pointer; 
          display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; 
          box-shadow: 0 4px 16px rgba(15,23,42,0.15); 
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,23,42,0.25); }

        .toolbar { margin-bottom: 24px; }
        .search-box { position: relative; max-width: 380px; }
        .search-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); }
        .toolbar-input { 
          width: 100%; padding: 11px 16px 11px 40px; background: #ffffff; border: 1px solid var(--admin-border); 
          border-radius: var(--admin-radius-md); color: var(--admin-text-main); outline: none; font-size: 13.5px; 
          font-family: var(--font-body); transition: border-color 0.2s;
        }
        .toolbar-input:focus { border-color: var(--admin-accent-gold-dark); box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.1); }

        .table-card { background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg); overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.02); }
        .loading-skeleton { padding: 8px 24px; }
        .skeleton-row { display: flex; align-items: center; gap: 24px; padding: 18px 0; border-bottom: 1px solid var(--admin-border); }
        .empty-state { text-align: center; padding: 60px 20px; color: var(--admin-text-muted); }
        .empty-icon { font-size: 32px; display: block; margin-bottom: 10px; }
        .empty-state p { font-size: 13.5px; margin: 0; }

        .table-responsive { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .admin-table th { 
          color: var(--admin-text-muted); font-weight: 700; padding: 16px 20px; border-bottom: 1px solid var(--admin-border); 
          text-transform: uppercase; font-size: 11px; letter-spacing: 0.8px; text-align: left; background: #f8fafc; 
        }
        .admin-table td { padding: 16px 20px; border-bottom: 1px solid var(--admin-border); color: var(--admin-text-main); vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: rgba(15,23,42,0.01); }
        .text-right { text-align: right; }

        .cat-name { font-weight: 700; color: var(--admin-text-main); font-size: 14.5px; }
        .cat-slug { font-family: var(--font-display); font-size: 12px; color: var(--admin-text-muted); background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-weight: 600; }

        .actions-group { display: flex; gap: 6px; justify-content: flex-end; }
        .btn-icon { 
          width: 34px; height: 34px; border-radius: var(--admin-radius-sm); display: flex; align-items: center; justify-content: center; 
          background: #ffffff; border: 1px solid var(--admin-border); cursor: pointer; transition: all 0.2s; 
        }
        .btn-edit { color: var(--admin-primary); }
        .btn-edit:hover { border-color: var(--admin-accent-gold); background: rgba(197,168,128,0.05); }
        .btn-del { color: #dc2626; }
        .btn-del:hover { border-color: #fca5a5; background: #fff5f5; }

        .modal-overlay { 
          position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(8px); 
          display: flex; align-items: center; justify-content: center; z-index: 1200; padding: 16px; 
          animation: fadeIn 0.25s ease; 
        }
        .modal-card { 
          background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg); 
          width: 100%; max-width: 440px; box-shadow: 0 24px 48px rgba(15,23,42,0.12); 
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 28px 16px; border-bottom: 1.5px solid var(--admin-border); }
        .modal-title { font-size: 20px; font-weight: 800; color: var(--admin-text-main); margin: 0; }
        .modal-close { background: none; border: none; color: var(--admin-text-muted); font-size: 18px; cursor: pointer; padding: 4px; }
        .modal-close:hover { color: var(--admin-text-main); }

        .modal-form { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12.5px; font-weight: 700; color: var(--admin-text-main); }
        .req { color: #b91c1c; }
        .form-input { 
          width: 100%; padding: 11px 14px; background: #ffffff; border: 1.5px solid var(--admin-border); 
          border-radius: var(--admin-radius-md); color: var(--admin-text-main); font-size: 13.5px; outline: none; 
          font-family: var(--font-body); transition: border-color 0.2s;
        }
        .form-input:focus { border-color: var(--admin-accent-gold-dark); box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.1); }
        .form-hint { font-size: 11px; color: var(--admin-text-muted); font-weight: 500; }

        .form-actions { display: flex; gap: 12px; margin-top: 14px; border-top: 1px solid var(--admin-border); padding-top: 20px; }
        .btn-cancel { 
          flex: 1; padding: 12px; background: #f8fafc; border: 1px solid var(--admin-border); color: var(--admin-text-muted); 
          border-radius: var(--admin-radius-md); font-weight: 600; cursor: pointer; font-size: 13px; transition: all 0.2s;
        }
        .btn-cancel:hover { background: #f1f5f9; color: var(--admin-text-main); }
        
        .btn-submit { 
          flex: 1; padding: 12px; background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-light)); border: none; 
          color: #fff; border-radius: var(--admin-radius-md); font-weight: 700; cursor: pointer; font-size: 13px; 
          display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.25s;
          box-shadow: 0 4px 16px rgba(15,23,42,0.1);
        }
        .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,23,42,0.2); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
