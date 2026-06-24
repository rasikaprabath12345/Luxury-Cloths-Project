"use client";

import { useState, useEffect } from "react";
import { categoriesAPI } from "@/lib/api";
import { AdminOnly } from "@/components/AdminOnly";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingCategoryId(null);
    setName("");
    setSlug("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setIsEditMode(true);
    setEditingCategoryId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setSlug("");
    setEditingCategoryId(null);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug from name if not in edit mode
    if (!isEditMode) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
          .replace(/\s+/g, "-") // replace spaces with -
          .replace(/-+/g, "-") // collapse dashes
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoriesAPI.deleteCategory(id);
      alert("Category deleted successfully!");
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error: any) {
      console.error("Error deleting category:", error);
      const errMsg = error.response?.data || "Failed to delete category.";
      alert(typeof errMsg === "string" ? errMsg : "Failed to delete category. Make sure it has no products associated with it.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return alert("Please fill in all fields.");
    setIsSubmitting(true);

    const payload = {
      id: isEditMode ? editingCategoryId : undefined,
      name,
      slug,
    };

    try {
      if (isEditMode && editingCategoryId) {
        await categoriesAPI.updateCategory(editingCategoryId, payload);
        alert("Category updated successfully!");
      } else {
        await categoriesAPI.createCategory(payload);
        alert("Category created successfully!");
      }
      fetchCategories();
      closeModal();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminOnly>
      <div className="categories-container">
        <header className="page-header">
          <div>
            <h1 className="page-title">Categories Manager</h1>
            <p className="page-subtitle">Manage storefront divisions like Shirts, Pants, Shoes, etc.</p>
          </div>
          <button onClick={openAddModal} className="btn-primary">
            ➕ Add Category
          </button>
        </header>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="toolbar-input"
            />
          </div>
        </div>

        {/* Table representation */}
        <div className="table-card">
          {loading ? (
            <div className="loading-state">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="empty-state">No categories found matching your query.</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Slug (SEO Path)</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="font-bold">{cat.name}</td>
                      <td className="font-mono text-zinc">{cat.slug}</td>
                      <td className="text-right">
                        <div className="actions-group">
                          <button onClick={() => openEditModal(cat)} className="btn-edit">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="btn-delete">
                            🗑️ Delete
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

        {/* Modal form */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 className="modal-title">
                  {isEditMode ? "Modify Category" : "New Category"}
                </h3>
                <button onClick={closeModal} className="btn-close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Silk Jackets"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="form-input"
                    placeholder="e.g. silk-jackets"
                  />
                  <small className="form-help">Unique path token used in storefront URLs.</small>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={closeModal} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-submit">
                    {isSubmitting ? "Saving..." : isEditMode ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .categories-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
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

        .btn-primary {
          background-color: #3b82f6;
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        .btn-primary:hover {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .toolbar {
          margin-bottom: 24px;
        }

        .search-box {
          position: relative;
          max-width: 380px;
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

        .font-bold {
          font-weight: 700;
          color: #fff;
        }
        .font-mono {
          font-family: monospace;
          font-size: 13px;
        }
        .text-zinc {
          color: #a1a1aa;
        }
        .text-right {
          text-align: right;
        }

        .actions-group {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .btn-edit,
        .btn-delete {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: #18181b;
          border: 1px solid #27272a;
        }
        .btn-edit {
          color: #60a5fa;
        }
        .btn-edit:hover {
          border-color: #3b82f6;
          background-color: rgba(59, 130, 246, 0.1);
        }
        .btn-delete {
          color: #f87171;
        }
        .btn-delete:hover {
          border-color: #ef4444;
          background-color: rgba(239, 68, 68, 0.1);
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1200;
          padding: 16px;
        }

        .modal-card {
          background-color: #09090b;
          border: 1px solid #27272a;
          border-radius: 20px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #1a1a1f;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #3b82f6;
          margin: 0;
        }

        .btn-close {
          background: none;
          border: none;
          color: #a1a1aa;
          font-size: 18px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .btn-close:hover {
          color: #fff;
        }

        .modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          background-color: #18181b;
          border: 1px solid #27272a;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: #3b82f6;
        }

        .form-help {
          font-size: 11px;
          color: #52525b;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px;
          background-color: #18181b;
          border: 1px solid #27272a;
          color: #fff;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cancel:hover {
          background-color: #27272a;
        }

        .btn-submit {
          flex: 1;
          padding: 12px;
          background-color: #3b82f6;
          border: none;
          color: #fff;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-submit:hover {
          background-color: #2563eb;
        }
      `}</style>
    </AdminOnly>
  );
}
