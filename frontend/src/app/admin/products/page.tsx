"use client";

import { useState, useEffect } from "react";
import { productsAPI, categoriesAPI, uploadAPI } from "@/lib/api";
import { showToast, showConfirm } from "@/lib/adminUtils";

interface Category { id: number; name: string; }
interface Product {
  id: number; name: string; price: number;
  imageUrl?: string; image?: string; description?: string; categoryId?: number;
  category?: { name: string };
  sizes?: string;
  discount?: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [newDiscount, setNewDiscount] = useState("0");
  const [newSizes, setNewSizes] = useState("S,M,L,XL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Failed to load products", "error");
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAllCategories();
      setCategories(response.data);
    } catch (error) { console.error("Error fetching categories:", error); }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const openEditModal = (product: Product) => {
    setIsEditMode(true);
    setEditingProductId(product.id);
    setNewName(product.name);
    setNewPrice(product.price.toString());
    setNewImageUrl(product.imageUrl || product.image || "");
    setNewDescription(product.description || "");
    setSelectedCategoryId(product.categoryId ? product.categoryId.toString() : "");
    setNewDiscount(product.discount !== undefined ? product.discount.toString() : "0");
    setNewSizes(product.sizes || "S,M,L,XL");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); setIsEditMode(false); setEditingProductId(null);
    setNewName(""); setNewPrice(""); setNewImageUrl(""); setNewDescription(""); setSelectedCategoryId("");
    setNewDiscount("0"); setNewSizes("S,M,L,XL");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const uploadedUrl = response.data.url;
      setNewImageUrl(uploadedUrl);
      showToast("Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Failed to upload image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    showConfirm(
      "Delete Product",
      `Are you sure you want to permanently remove <strong>"${name}"</strong>? This action cannot be undone.`,
      async () => {
        try {
          await productsAPI.deleteProduct(id);
          showToast(`"${name}" deleted successfully`, "success");
          setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
          showToast("Failed to delete product", "error");
        }
      }
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !selectedCategoryId) {
      return showToast("Please fill in all required fields", "warning");
    }
    setIsSubmitting(true);
    const productPayload = {
      id: isEditMode ? editingProductId : undefined,
      name: newName, price: parseFloat(newPrice),
      imageUrl: newImageUrl.trim() || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop",
      description: newDescription, categoryId: parseInt(selectedCategoryId),
      sizes: newSizes.trim() || "S,M,L,XL",
      discount: parseInt(newDiscount) || 0,
    };
    try {
      if (isEditMode && editingProductId) {
        await productsAPI.updateProduct(editingProductId, productPayload);
        showToast(`"${newName}" updated successfully`, "success");
      } else {
        await productsAPI.createProduct(productPayload);
        showToast(`"${newName}" added to catalog`, "success");
      }
      fetchProducts(); closeModal();
    } catch (error) {
      showToast("Failed to save product. Check your connection.", "error");
    } finally { setIsSubmitting(false); }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "" || product.categoryId?.toString() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (catId?: number) => {
    if (!catId) return "—";
    const cat = categories.find((c) => c.id === catId);
    return cat?.name || "—";
  };

  return (
    <div className="products-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} items in catalog</p>
        </div>
        <button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="btn-primary">
          <span>+</span> Add Product
        </button>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <svg className="search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="toolbar-input" />
          {searchTerm && <button className="search-clear" onClick={() => setSearchTerm("")}>✕</button>}
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="toolbar-select">
          <option value="">All Categories</option>
          {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
        </select>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-skeleton">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="skeleton-row">
                <div className="shimmer" style={{width:44,height:44,borderRadius:10}} />
                <div style={{flex:1}}>
                  <div className="shimmer" style={{width:'60%',height:14,marginBottom:8}} />
                  <div className="shimmer" style={{width:'40%',height:12}} />
                </div>
                <div className="shimmer" style={{width:60,height:14}} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No products found{searchTerm && ` for "${searchTerm}"`}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <img
                          src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop"}
                          className="product-thumb" alt={product.name}
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop"; }}
                        />
                        <div>
                          <span className="product-name">{product.name}</span>
                          <span className="product-desc">{product.description || "No description"}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="category-tag">{getCategoryName(product.categoryId)}</span></td>
                    <td className="price-cell">${(product.price || 0).toFixed(2)}</td>
                    <td className="text-right">
                      <div className="actions-group">
                        <button onClick={() => openEditModal(product)} className="btn-icon btn-edit" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="btn-icon btn-del" title="Delete">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{isEditMode ? "Edit Product" : "New Product"}</h3>
              <button onClick={closeModal} className="modal-close">✕</button>
            </div>

            {/* Image preview */}
            {newImageUrl && (
              <div className="image-preview">
                <img src={newImageUrl} alt="Preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name <span className="req">*</span></label>
                  <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="form-input" placeholder="e.g. Luxury Silk Shirt" />
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($) <span className="req">*</span></label>
                  <input type="number" step="0.01" min="0" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="form-input" placeholder="250.00" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category <span className="req">*</span></label>
                <select required value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="form-select">
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="form-textarea" placeholder="Premium quality fabric with a modern cut..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Available Sizes (comma separated)</label>
                  <input type="text" value={newSizes} onChange={(e) => setNewSizes(e.target.value)} className="form-input" placeholder="e.g. S,M,L,XL" />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Percentage (%)</label>
                  <input type="number" min="0" max="100" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} className="form-input" placeholder="0" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                  <label className="btn-upload">
                    {isUploading ? (
                      <><span className="spinner-dark" /> Uploading...</>
                    ) : (
                      <>📷 Select & Upload Image File</>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      style={{ display: "none" }}
                    />
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>or</span>
                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                  </div>
                  <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="form-input" placeholder="Paste image URL (e.g. https://images.unsplash.com/...)" />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-submit">
                  {isSubmitting ? (
                    <><span className="spinner" /> Saving...</>
                  ) : isEditMode ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .products-container { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 30px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
        .page-subtitle { font-size: 13px; color: #64748b; margin: 0; }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; font-weight: 600; font-size: 13px;
          padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(59,130,246,0.25);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.35); }

        .toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .search-box { position: relative; flex: 1; min-width: 220px; }
        .search-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .toolbar-input {
          width: 100%; padding: 11px 36px 11px 40px; background: #ffffff; border: 1px solid #e2e8f0;
          border-radius: 10px; color: #0f172a; outline: none; font-size: 13px; transition: border-color 0.2s;
        }
        .toolbar-input:focus { border-color: #3b82f6; }
        .search-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 12px;
        }
        .search-clear:hover { color: #475569; }
        .toolbar-select {
          padding: 11px 16px; background: #ffffff; border: 1px solid #e2e8f0;
          border-radius: 10px; color: #0f172a; outline: none; font-size: 13px; cursor: pointer; min-width: 160px;
        }
        .toolbar-select:focus { border-color: #3b82f6; }

        .table-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .loading-skeleton { padding: 8px 24px; }
        .skeleton-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #e2e8f0; }
        .skeleton-row:last-child { border-bottom: none; }
        .empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
        .empty-icon { font-size: 32px; display: block; margin-bottom: 10px; }
        .empty-state p { font-size: 13px; margin: 0; }

        .table-responsive { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th {
          color: #64748b; font-weight: 600; padding: 14px 20px; border-bottom: 1px solid #e2e8f0;
          text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; text-align: left; background: #f8fafc;
        }
        .admin-table td { padding: 14px 20px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: rgba(15,23,42,0.015); }
        .text-right { text-align: right; }

        .product-cell { display: flex; align-items: center; gap: 14px; }
        .product-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 10px; background: #f1f5f9; flex-shrink: 0; }
        .product-name { display: block; font-weight: 600; color: #0f172a; font-size: 14px; margin-bottom: 2px; }
        .product-desc {
          display: block; font-size: 12px; color: #64748b; max-width: 260px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .category-tag {
          background: rgba(139,92,246,0.08); color: #7c3aed; padding: 3px 10px;
          border-radius: 6px; font-size: 11px; font-weight: 600;
        }
        .price-cell { font-family: 'SF Mono', monospace; font-weight: 600; color: #0f172a; font-size: 14px; }

        .actions-group { display: flex; gap: 6px; justify-content: flex-end; }
        .btn-icon {
          width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          background: #ffffff; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s;
        }
        .btn-edit { color: #2563eb; }
        .btn-edit:hover { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
        .btn-del { color: #dc2626; }
        .btn-del:hover { border-color: #ef4444; background: rgba(239,68,68,0.05); }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.3); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; z-index: 1200; padding: 16px;
          animation: fadeIn 0.2s ease;
        }
        .modal-card {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; width: 100%;
          max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); animation: scaleIn 0.25s cubic-bezier(0.4,0,0.2,1);
          max-height: 90vh; overflow-y: auto;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
        .modal-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
        .modal-close { background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; transition: color 0.2s; padding: 4px; }
        .modal-close:hover { color: #0f172a; }

        .image-preview {
          padding: 16px 24px 0; display: flex; justify-content: center;
        }
        .image-preview img {
          max-height: 120px; border-radius: 12px; object-fit: cover;
          border: 1px solid #e2e8f0;
        }

        .modal-form { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-label { font-size: 12px; font-weight: 600; color: #475569; }
        .req { color: #ef4444; }
        .form-input, .form-select, .form-textarea {
          width: 100%; padding: 11px 14px; background: #ffffff; border: 1px solid #e2e8f0;
          border-radius: 10px; color: #0f172a; font-size: 14px; outline: none; transition: border-color 0.2s;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #3b82f6; }
        .form-textarea { height: 80px; resize: none; }

        .form-actions { display: flex; gap: 10px; margin-top: 8px; }
        .btn-cancel {
          flex: 1; padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; color: #475569;
          border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 13px;
        }
        .btn-cancel:hover { background: #f1f5f9; color: #0f172a; }
        .btn-submit {
          flex: 1; padding: 12px; background: linear-gradient(135deg,#3b82f6,#2563eb); border: none;
          color: #fff; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-submit:hover { box-shadow: 0 4px 16px rgba(59,130,246,0.3); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
        }
        .btn-upload {
          cursor: pointer;
          padding: 12px;
          border-radius: 10px;
          border: 1px dashed #cbd5e1;
          background: #f8fafc;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
          width: 100%;
        }
        .btn-upload:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #334155;
        }
        .spinner-dark {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top-color: #475569;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}