"use client";

import { useState, useEffect } from "react";
import { productsAPI, categoriesAPI } from "@/lib/api";
import { AdminOnly } from "../../../components/AdminOnly";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  image?: string;
  description?: string;
  categoryId?: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Edit Mode States
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Form States
  const [newName, setNewName] = useState<string>("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openEditModal = (product: Product) => {
    setIsEditMode(true);
    setEditingProductId(product.id);
    setNewName(product.name);
    setNewPrice(product.price.toString());
    setNewImageUrl(product.imageUrl || product.image || "");
    setNewDescription(product.description || "");
    setSelectedCategoryId(product.categoryId ? product.categoryId.toString() : "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingProductId(null);
    setNewName("");
    setNewPrice("");
    setNewImageUrl("");
    setNewDescription("");
    setSelectedCategoryId("");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsAPI.deleteProduct(id);
      alert("Product deleted successfully!");
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !selectedCategoryId) {
      return alert("Please enter name, price, and category.");
    }
    setIsSubmitting(true);

    const productPayload = {
      id: isEditMode ? editingProductId : undefined,
      name: newName,
      price: parseFloat(newPrice),
      imageUrl: newImageUrl.trim() || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop",
      description: newDescription,
      categoryId: parseInt(selectedCategoryId),
    };

    try {
      if (isEditMode && editingProductId) {
        await productsAPI.updateProduct(editingProductId, productPayload);
        alert("Product updated successfully!");
      } else {
        await productsAPI.createProduct(productPayload);
        alert("Product added successfully!");
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please check API connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "" || product.categoryId?.toString() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminOnly>
      <div className="products-container">
        <header className="page-header">
          <div>
            <h1 className="page-title">Products Management</h1>
            <p className="page-subtitle">Add, edit, or delete items from the product catalog.</p>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            ➕ Add Product
          </button>
        </header>

        {/* Filter Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="toolbar-input"
            />
          </div>
          <div className="filter-box">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="toolbar-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table container */}
        <div className="table-card">
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">No products matched your search parameters.</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="col-span-2">Product Info</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td style={{ minWidth: "200px" }}>
                        <div className="product-info-cell">
                          <img
                            src={
                              product.imageUrl ||
                              product.image ||
                              "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop"
                            }
                            className="product-thumbnail"
                            alt={product.name}
                          />
                          <span className="product-name">{product.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="product-desc-text">
                          {product.description || "No description provided"}
                        </span>
                      </td>
                      <td className="font-mono">${(product.price || 0).toFixed(2)}</td>
                      <td className="text-right">
                        <div className="actions-group">
                          <button
                            onClick={() => openEditModal(product)}
                            className="btn-edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn-delete"
                          >
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

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 className="modal-title">
                  {isEditMode ? "Edit Product Details" : "Add New Product"}
                </h3>
                <button onClick={closeModal} className="btn-close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Luxury Silk Shirt"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <div className="select-wrapper">
                    <select
                      required
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="form-select"
                    >
                      <option value="" disabled hidden>
                        -- Select Category --
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="form-textarea"
                    placeholder="e.g. Premium quality pure silk shirt with a modern tailored cut."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="form-input"
                    placeholder="e.g. 250.00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={closeModal} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-submit">
                    {isSubmitting ? "Saving..." : isEditMode ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .products-container {
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
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
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
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.1);
        }

        .filter-box {
          min-width: 180px;
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

        .product-info-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-thumbnail {
          width: 44px;
          height: 44px;
          object-cover: cover;
          border-radius: 8px;
          background-color: #18181b;
        }

        .product-name {
          font-weight: 700;
          color: #fff;
        }

        .product-desc-text {
          color: #a1a1aa;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: 12px;
          max-width: 300px;
          line-height: 1.4;
        }

        .font-mono {
          font-family: monospace;
          font-size: 14px;
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
          max-width: 480px;
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

        .form-input,
        .form-select,
        .form-textarea {
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
        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #3b82f6;
        }

        .form-textarea {
          height: 100px;
          resize: none;
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