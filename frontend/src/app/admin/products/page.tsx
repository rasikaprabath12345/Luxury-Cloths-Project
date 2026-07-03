"use client";

import { useState, useEffect } from "react";
import { productsAPI, categoriesAPI, uploadAPI } from "@/lib/api";
import { showToast, showConfirm } from "@/lib/adminUtils";

interface Category { id: number; name: string; }
interface ProductImage {
  id?: number;
  imageUrl: string;
  isMainImage: boolean;
}
interface Product {
  id: number; name: string; price: number;
  imageUrl?: string; image?: string; description?: string; categoryId?: number;
  category?: { name: string };
  sizes?: string;
  discount?: number;
  isChoice?: boolean;
  isSale?: boolean;
  rating?: number;
  soldCount?: number;
  promoText?: string;
  shopperSavingText?: string;
  images?: ProductImage[];
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
  const [newImageUrl1, setNewImageUrl1] = useState("");
  const [newImageUrl2, setNewImageUrl2] = useState("");
  const [newImageUrl3, setNewImageUrl3] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isUploading1, setIsUploading1] = useState(false);
  const [isUploading2, setIsUploading2] = useState(false);
  const [isUploading3, setIsUploading3] = useState(false);
  const [newDiscount, setNewDiscount] = useState("0");
  const [newSizes, setNewSizes] = useState("S,M,L,XL");
  const [newIsChoice, setNewIsChoice] = useState(false);
  const [newIsSale, setNewIsSale] = useState(false);
  const [newRating, setNewRating] = useState("4.5");
  const [newSoldCount, setNewSoldCount] = useState("0");
  const [newPromoText, setNewPromoText] = useState("");
  const [newShopperSavingText, setNewShopperSavingText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // UI States
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null);
  const [inlinePrice, setInlinePrice] = useState("");
  const [isInlineSaving, setIsInlineSaving] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"basics" | "promo" | "options" | "media">("basics");

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

    const mainImg = product.images?.find(img => img.isMainImage)?.imageUrl || product.imageUrl || product.image || "";
    const additionalImgs = product.images?.filter(img => !img.isMainImage) || [];

    setNewImageUrl(mainImg);
    setNewImageUrl1(additionalImgs[0]?.imageUrl || "");
    setNewImageUrl2(additionalImgs[1]?.imageUrl || "");
    setNewImageUrl3(additionalImgs[2]?.imageUrl || "");
    setNewDescription(product.description || "");
    setSelectedCategoryId(product.categoryId ? product.categoryId.toString() : "");
    setNewDiscount(product.discount !== undefined ? product.discount.toString() : "0");
    setNewSizes(product.sizes || "S,M,L,XL");
    setNewIsChoice(product.isChoice ?? false);
    setNewIsSale(product.isSale ?? false);
    setNewRating(product.rating !== undefined ? product.rating.toString() : "4.5");
    setNewSoldCount(product.soldCount !== undefined ? product.soldCount.toString() : "0");
    setNewPromoText(product.promoText || "");
    setNewShopperSavingText(product.shopperSavingText || "");
    setActiveModalTab("basics");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); setIsEditMode(false); setEditingProductId(null);
    setNewName(""); setNewPrice(""); setNewImageUrl(""); setNewImageUrl1(""); setNewImageUrl2(""); setNewImageUrl3(""); setNewDescription(""); setSelectedCategoryId("");
    setNewDiscount("0"); setNewSizes("S,M,L,XL");
    setNewIsChoice(false); setNewIsSale(false); setNewRating("4.5"); setNewSoldCount("0");
    setNewPromoText(""); setNewShopperSavingText("");
    setActiveModalTab("basics");
  };

  const handleImageUploadGeneric = async (file: File, setter: (url: string) => void, setUploading: (u: boolean) => void) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "warning");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const uploadedUrl = response.data.url;
      setter(uploadedUrl);
      showToast("Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Failed to upload image.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUploadGeneric(file, setNewImageUrl, setIsUploading);
  };

  const handleImageUpload1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUploadGeneric(file, setNewImageUrl1, setIsUploading1);
  };

  const handleImageUpload2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUploadGeneric(file, setNewImageUrl2, setIsUploading2);
  };

  const handleImageUpload3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUploadGeneric(file, setNewImageUrl3, setIsUploading3);
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

  const handleInlineSave = async (product: Product) => {
    const parsedPrice = parseFloat(inlinePrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast("Please enter a valid price", "warning");
      return;
    }
    setIsInlineSaving(true);
    try {
      const mainImg = product.images?.find(img => img.isMainImage)?.imageUrl || product.imageUrl || product.image || "";
      const additionalImgs = product.images?.filter(img => !img.isMainImage) || [];
      const imagesList = [];
      if (mainImg) imagesList.push({ imageUrl: mainImg, isMainImage: true });
      additionalImgs.forEach(img => imagesList.push({ imageUrl: img.imageUrl, isMainImage: false }));

      const productPayload = {
        ...product,
        price: parsedPrice,
        images: imagesList
      };

      await productsAPI.updateProduct(product.id, productPayload);
      showToast(`"${product.name}" price updated to Rs. ${parsedPrice}`, "success");
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, price: parsedPrice } : p));
      setInlineEditingId(null);
    } catch (err) {
      showToast("Failed to update price", "error");
    } finally {
      setIsInlineSaving(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !selectedCategoryId) {
      return showToast("Please fill in all required fields", "warning");
    }
    setIsSubmitting(true);

    const imagesList = [];
    if (newImageUrl) {
      imagesList.push({ imageUrl: newImageUrl, isMainImage: true });
    }
    if (newImageUrl1) {
      imagesList.push({ imageUrl: newImageUrl1, isMainImage: false });
    }
    if (newImageUrl2) {
      imagesList.push({ imageUrl: newImageUrl2, isMainImage: false });
    }
    if (newImageUrl3) {
      imagesList.push({ imageUrl: newImageUrl3, isMainImage: false });
    }

    const productPayload = {
      id: isEditMode ? editingProductId : undefined,
      name: newName, price: parseFloat(newPrice),
      imageUrl: newImageUrl.trim() || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop",
      description: newDescription, categoryId: parseInt(selectedCategoryId),
      sizes: newSizes.trim() || "S,M,L,XL",
      discount: parseInt(newDiscount) || 0,
      isChoice: newIsChoice,
      isSale: newIsSale,
      rating: parseFloat(newRating) || 4.5,
      soldCount: parseInt(newSoldCount) || 0,
      promoText: newPromoText.trim(),
      shopperSavingText: newShopperSavingText.trim(),
      images: imagesList
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
          <svg className="search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="toolbar-input" />
          {searchTerm && <button className="search-clear" onClick={() => setSearchTerm("")}>✕</button>}
        </div>
        
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="toolbar-select">
          <option value="">All Categories</option>
          {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
        </select>

        <div className="view-toggle">
          <button 
            type="button" 
            className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            📋 List
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            🎂 Grid
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="shimmer" style={{ width: 44, height: 44, borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <div className="shimmer" style={{ width: '60%', height: 14, marginBottom: 8 }} />
                <div className="shimmer" style={{ width: '40%', height: 12 }} />
              </div>
              <div className="shimmer" style={{ width: 60, height: 14 }} />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No products found{searchTerm && ` for "${searchTerm}"`}</p>
        </div>
      ) : viewMode === "list" ? (
        /* List View */
        <div className="table-card">
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
                    <td className="price-cell">
                      {inlineEditingId === product.id ? (
                        <div className="inline-edit-wrapper" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="number" 
                            className="inline-input"
                            value={inlinePrice}
                            onChange={(e) => setInlinePrice(e.target.value)}
                            disabled={isInlineSaving}
                          />
                          <button onClick={() => handleInlineSave(product)} disabled={isInlineSaving} className="inline-btn save">✓</button>
                          <button onClick={() => setInlineEditingId(null)} disabled={isInlineSaving} className="inline-btn cancel">✕</button>
                        </div>
                      ) : (
                        <div className="price-display-wrapper">
                          <span>Rs. {(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <button 
                            className="inline-edit-trigger" 
                            title="Quick edit price"
                            onClick={(e) => { e.stopPropagation(); setInlineEditingId(product.id); setInlinePrice(product.price.toString()); }}
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="actions-group">
                        <button onClick={() => openEditModal(product)} className="btn-icon btn-edit" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="btn-icon btn-del" title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card-img-wrap">
                <img
                  src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop"}
                  alt={product.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop"; }}
                />
                {(product.discount ?? 0) > 0 && <span className="grid-discount-badge">{product.discount}% OFF</span>}
              </div>
              <div className="product-card-info">
                <div className="grid-category">{getCategoryName(product.categoryId)}</div>
                <h3 className="grid-product-name">{product.name}</h3>
                
                <div className="grid-price-section">
                  {inlineEditingId === product.id ? (
                    <div className="inline-edit-wrapper" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="number" 
                        className="inline-input"
                        value={inlinePrice}
                        onChange={(e) => setInlinePrice(e.target.value)}
                        disabled={isInlineSaving}
                      />
                      <button onClick={() => handleInlineSave(product)} disabled={isInlineSaving} className="inline-btn save">✓</button>
                      <button onClick={() => setInlineEditingId(null)} disabled={isInlineSaving} className="inline-btn cancel">✕</button>
                    </div>
                  ) : (
                    <div className="price-display-wrapper">
                      <span className="grid-price">Rs. {(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <button 
                        className="inline-edit-trigger" 
                        title="Quick edit price"
                        onClick={(e) => { e.stopPropagation(); setInlineEditingId(product.id); setInlinePrice(product.price.toString()); }}
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid-actions">
                  <button onClick={() => openEditModal(product)} className="grid-btn edit">Edit</button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="grid-btn delete">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{isEditMode ? "Edit Product" : "New Product"}</h3>
              <button onClick={closeModal} className="modal-close">✕</button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="modal-tabs">
              <button type="button" className={`tab-item ${activeModalTab === "basics" ? "active" : ""}`} onClick={() => setActiveModalTab("basics")}>General</button>
              <button type="button" className={`tab-item ${activeModalTab === "promo" ? "active" : ""}`} onClick={() => setActiveModalTab("promo")}>Marketing</button>
              <button type="button" className={`tab-item ${activeModalTab === "options" ? "active" : ""}`} onClick={() => setActiveModalTab("options")}>Specs</button>
              <button type="button" className={`tab-item ${activeModalTab === "media" ? "active" : ""}`} onClick={() => setActiveModalTab("media")}>Images</button>
            </div>

            {/* Image preview in media tab */}
            {activeModalTab === "media" && (newImageUrl || newImageUrl1 || newImageUrl2 || newImageUrl3) && (
              <div className="image-preview" style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", margin: "16px 24px 0" }}>
                {newImageUrl && <img src={newImageUrl} alt="Main" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #cbd5e1" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                {newImageUrl1 && <img src={newImageUrl1} alt="Alt 1" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #cbd5e1" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                {newImageUrl2 && <img src={newImageUrl2} alt="Alt 2" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #cbd5e1" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                {newImageUrl3 && <img src={newImageUrl3} alt="Alt 3" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #cbd5e1" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="modal-form">
              {activeModalTab === "basics" && (
                <div className="tab-pane-content" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Product Name <span className="req">*</span></label>
                      <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="form-input" placeholder="e.g. Luxury Silk Shirt" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price (LKR) <span className="req">*</span></label>
                      <input type="number" step="0.01" min="0" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="form-input" placeholder="17805.36" />
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
                </div>
              )}

              {activeModalTab === "promo" && (
                <div className="tab-pane-content" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Discount Percentage (%)</label>
                    <input type="number" min="0" max="100" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} className="form-input" placeholder="0" />
                  </div>

                  <div className="form-row" style={{ marginTop: "4px" }}>
                    <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
                      <input type="checkbox" id="isChoiceCheckbox" checked={newIsChoice} onChange={(e) => setNewIsChoice(e.target.checked)} style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                      <label htmlFor="isChoiceCheckbox" className="form-label" style={{ cursor: "pointer", marginBottom: 0 }}>Choice Badge (Store Pick)</label>
                    </div>
                    <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
                      <input type="checkbox" id="isSaleCheckbox" checked={newIsSale} onChange={(e) => setNewIsSale(e.target.checked)} style={{ cursor: "pointer", width: "16px", height: "16px" }} />
                      <label htmlFor="isSaleCheckbox" className="form-label" style={{ cursor: "pointer", marginBottom: 0 }}>Sale Badge (On Discount)</label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Custom Promo Label</label>
                    <input type="text" value={newPromoText} onChange={(e) => setNewPromoText(e.target.value)} className="form-input" placeholder="e.g. LKR1,500 off on LKR11,000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shopper Saving Label</label>
                    <input type="text" value={newShopperSavingText} onChange={(e) => setNewShopperSavingText(e.target.value)} className="form-input" placeholder="e.g. New shoppers save LKR230" />
                  </div>
                </div>
              )}

              {activeModalTab === "options" && (
                <div className="tab-pane-content" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Available Sizes (comma separated)</label>
                    <input type="text" value={newSizes} onChange={(e) => setNewSizes(e.target.value)} className="form-input" placeholder="e.g. S,M,L,XL" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Rating Value (0.0 to 5.0)</label>
                      <input type="number" step="0.1" min="0" max="5" value={newRating} onChange={(e) => setNewRating(e.target.value)} className="form-input" placeholder="4.5" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Items Sold Count</label>
                      <input type="number" min="0" value={newSoldCount} onChange={(e) => setNewSoldCount(e.target.value)} className="form-input" placeholder="0" />
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === "media" && (
                <div className="tab-pane-content" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Main Image URL</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="form-input" placeholder="e.g. https://images.unsplash.com/main.jpg" />
                      <label className="btn-upload" style={{ width: "auto", whiteSpace: "nowrap", margin: 0, padding: "0 14px", display: "inline-flex", alignItems: "center" }}>
                        {isUploading ? <span className="spinner-dark" /> : "📷 Upload"}
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Image 1 URL</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="url" value={newImageUrl1} onChange={(e) => setNewImageUrl1(e.target.value)} className="form-input" placeholder="e.g. https://images.unsplash.com/side.jpg" />
                      <label className="btn-upload" style={{ width: "auto", whiteSpace: "nowrap", margin: 0, padding: "0 14px", display: "inline-flex", alignItems: "center" }}>
                        {isUploading1 ? <span className="spinner-dark" /> : "📷 Upload"}
                        <input type="file" accept="image/*" onChange={handleImageUpload1} disabled={isUploading1} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Image 2 URL</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="url" value={newImageUrl2} onChange={(e) => setNewImageUrl2(e.target.value)} className="form-input" placeholder="e.g. https://images.unsplash.com/back.jpg" />
                      <label className="btn-upload" style={{ width: "auto", whiteSpace: "nowrap", margin: 0, padding: "0 14px", display: "inline-flex", alignItems: "center" }}>
                        {isUploading2 ? <span className="spinner-dark" /> : "📷 Upload"}
                        <input type="file" accept="image/*" onChange={handleImageUpload2} disabled={isUploading2} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Image 3 URL</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="url" value={newImageUrl3} onChange={(e) => setNewImageUrl3(e.target.value)} className="form-input" placeholder="e.g. https://images.unsplash.com/detail.jpg" />
                      <label className="btn-upload" style={{ width: "auto", whiteSpace: "nowrap", margin: 0, padding: "0 14px", display: "inline-flex", alignItems: "center" }}>
                        {isUploading3 ? <span className="spinner-dark" /> : "📷 Upload"}
                        <input type="file" accept="image/*" onChange={handleImageUpload3} disabled={isUploading3} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                </div>
              )}

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
        .products-container { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 32px; font-weight: 900; color: var(--admin-text-main); margin: 0 0 4px; }
        .page-subtitle { font-size: 13.5px; color: var(--admin-text-muted); margin: 0; }
        
        .btn-primary {
          background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-light)); 
          color: #fff; font-weight: 600; font-size: 13px;
          padding: 10px 20px; border-radius: var(--admin-radius-md); border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(15,23,42,0.15);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,23,42,0.25); }

        .toolbar { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
        .search-box { position: relative; flex: 1; min-width: 240px; }
        .search-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); }
        
        .toolbar-input {
          width: 100%; padding: 11px 36px 11px 40px; background: #ffffff; border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md); color: var(--admin-text-main); outline: none; font-size: 13.5px; transition: all 0.2s;
          font-family: var(--font-body);
        }
        .toolbar-input:focus { border-color: var(--admin-accent-gold-dark); box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.1); }
        .search-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 12px;
        }
        .search-clear:hover { color: var(--admin-text-main); }
        
        .toolbar-select {
          padding: 11px 16px; background: #ffffff; border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md); color: var(--admin-text-main); outline: none; font-size: 13.5px; cursor: pointer; min-width: 170px;
          font-family: var(--font-body);
        }
        .toolbar-select:focus { border-color: var(--admin-accent-gold-dark); }

        /* View Mode Toggle */
        .view-toggle { display: flex; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-md); overflow: hidden; background: #fff; }
        .view-toggle .toggle-btn {
          padding: 10px 16px; border: none; background: #ffffff; color: var(--admin-text-muted);
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
          font-family: var(--font-body);
        }
        .view-toggle .toggle-btn.active {
          background: var(--admin-primary); color: #ffffff;
        }
        .view-toggle .toggle-btn:hover:not(.active) {
          background: #f8fafc; color: var(--admin-text-main);
        }

        /* Table view custom styles */
        .table-card { background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg); overflow: hidden; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02); }
        .loading-skeleton { padding: 8px 24px; }
        .skeleton-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--admin-border); }
        .skeleton-row:last-child { border-bottom: none; }
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

        .product-cell { display: flex; align-items: center; gap: 14px; }
        .product-thumb { width: 46px; height: 46px; object-fit: cover; border-radius: var(--admin-radius-md); background: #f1f5f9; flex-shrink: 0; border: 1.5px solid var(--admin-border); }
        .product-name { display: block; font-weight: 700; color: var(--admin-text-main); font-size: 14.5px; margin-bottom: 2px; }
        .product-desc {
          display: block; font-size: 12px; color: var(--admin-text-muted); max-width: 280px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .category-tag {
          background: rgba(197, 168, 128, 0.1); color: var(--admin-accent-gold-dark); padding: 4px 10px;
          border-radius: var(--admin-radius-sm); font-size: 11px; font-weight: 700; border: 0.5px solid rgba(197, 168, 128, 0.2);
        }
        .price-cell { font-family: var(--font-display); font-weight: 700; color: var(--admin-text-main); font-size: 14px; }

        /* Inline Editing styling */
        .inline-edit-wrapper { display: flex; align-items: center; gap: 6px; }
        .inline-input {
          width: 95px; padding: 6px 10px; border: 1.5px solid var(--admin-accent-gold);
          border-radius: 6px; font-size: 13px; color: var(--admin-text-main); outline: none;
          font-family: var(--font-display); font-weight: 700;
        }
        .inline-input:focus { box-shadow: 0 0 0 2px rgba(197, 168, 128, 0.15); }
        .inline-btn {
          width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
          border: none; color: #fff; font-weight: 700; font-size: 12px; cursor: pointer; transition: opacity 0.2s;
        }
        .inline-btn.save { background: #16a34a; }
        .inline-btn.cancel { background: #dc2626; }
        .inline-btn:hover { opacity: 0.85; }

        .price-display-wrapper { display: flex; align-items: center; gap: 8px; }
        .inline-edit-trigger { background: none; border: none; font-size: 11px; cursor: pointer; opacity: 0.0; transition: opacity 0.2s; padding: 4px; }
        .admin-table tr:hover .inline-edit-trigger { opacity: 0.6; }
        .price-display-wrapper:hover .inline-edit-trigger { opacity: 1; }

        .actions-group { display: flex; gap: 6px; justify-content: flex-end; }
        .btn-icon {
          width: 34px; height: 34px; border-radius: var(--admin-radius-sm); display: flex; align-items: center; justify-content: center;
          background: #ffffff; border: 1px solid var(--admin-border); cursor: pointer; transition: all 0.2s;
        }
        .btn-edit { color: var(--admin-primary); }
        .btn-edit:hover { border-color: var(--admin-accent-gold); background: rgba(197, 168, 128, 0.05); }
        .btn-del { color: #dc2626; }
        .btn-del:hover { border-color: #fca5a5; background: #fff5f5; }

        /* Grid Layout */
        .products-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;
        }
        .product-card {
          background: #ffffff; border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg); overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
          display: flex; flex-direction: column;
        }
        .product-card:hover {
          transform: translateY(-3px); border-color: var(--admin-accent-gold-dark);
          box-shadow: 0 12px 24px rgba(15,23,42,0.04);
        }
        .product-card-img-wrap {
          position: relative; width: 100%; padding-top: 105%; background: #f8fafc;
          border-bottom: 1px solid var(--admin-border);
        }
        .product-card-img-wrap img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }
        .product-card:hover .product-card-img-wrap img {
          transform: scale(1.05);
        }
        .grid-discount-badge {
          position: absolute; top: 12px; left: 12px; background: #b91c1c; color: #fff;
          font-size: 9px; font-weight: 800; padding: 4px 8px; border-radius: 6px;
          letter-spacing: 0.5px;
        }
        
        .product-card-info { padding: 16px; display: flex; flex-direction: column; flex: 1; }
        .grid-category { font-size: 10px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .grid-product-name { font-size: 15px; font-weight: 700; color: var(--admin-text-main); margin: 0 0 8px; line-height: 1.3; height: 40px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .grid-price-section { margin-bottom: 16px; height: 32px; display: flex; align-items: center; }
        .grid-price { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--admin-text-main); }
        .product-card .inline-edit-trigger { opacity: 0.3; }
        .product-card:hover .inline-edit-trigger { opacity: 0.8; }

        .grid-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: auto; }
        .grid-btn {
          padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; text-align: center; border: 1px solid var(--admin-border);
          background: #ffffff; font-family: var(--font-body);
        }
        .grid-btn.edit { color: var(--admin-text-main); }
        .grid-btn.edit:hover { background: #f8fafc; border-color: var(--admin-accent-gold); }
        .grid-btn.delete { color: #dc2626; }
        .grid-btn.delete:hover { background: #fff5f5; border-color: #fca5a5; }

        /* Modal tabs and panel styling */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 1200; padding: 16px;
          animation: fadeIn 0.25s ease;
        }
        .modal-card {
          background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--admin-radius-lg); width: 100%;
          max-width: 540px; box-shadow: 0 24px 48px rgba(15,23,42,0.12); animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 28px 16px; border-bottom: 1.5px solid var(--admin-border); }
        .modal-title { font-size: 20px; font-weight: 800; color: var(--admin-text-main); margin: 0; }
        .modal-close { background: none; border: none; color: var(--admin-text-muted); font-size: 18px; cursor: pointer; transition: color 0.2s; padding: 4px; }
        .modal-close:hover { color: var(--admin-text-main); }

        .modal-tabs { display: flex; background: #f8fafc; border-bottom: 1px solid var(--admin-border); padding: 0 28px; }
        .modal-tabs .tab-item {
          padding: 14px 16px; border: none; background: none; font-size: 12px; font-weight: 700;
          color: var(--admin-text-muted); cursor: pointer; position: relative; font-family: var(--font-body);
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .modal-tabs .tab-item.active {
          color: var(--admin-accent-gold-dark);
        }
        .modal-tabs .tab-item.active::after {
          content: ""; position: absolute; bottom: 0; left: 16px; right: 16px; height: 2px;
          background: var(--admin-accent-gold);
        }

        .modal-form { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 1; }
        .tab-pane-content { animation: paneFadeIn 0.25s ease; }
        @keyframes paneFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12.5px; font-weight: 700; color: var(--admin-text-main); }
        .req { color: #b91c1c; }
        .form-input, .form-select, .form-textarea {
          width: 100%; padding: 11px 14px; background: #ffffff; border: 1.5px solid var(--admin-border);
          border-radius: var(--admin-radius-md); color: var(--admin-text-main); font-size: 13.5px; outline: none; transition: all 0.2s;
          font-family: var(--font-body);
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--admin-accent-gold-dark); box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.1); }
        .form-textarea { height: 90px; resize: none; }

        .form-actions { display: flex; gap: 12px; margin-top: 14px; border-top: 1px solid var(--admin-border); padding-top: 20px; }
        .btn-cancel {
          flex: 1; padding: 12px; background: #f8fafc; border: 1px solid var(--admin-border); color: var(--admin-text-muted);
          border-radius: var(--admin-radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 13px;
        }
        .btn-cancel:hover { background: #f1f5f9; color: var(--admin-text-main); }
        
        .btn-submit {
          flex: 1; padding: 12px; background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-light)); border: none;
          color: #fff; border-radius: var(--admin-radius-md); font-weight: 700; cursor: pointer; transition: all 0.25s;
          font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(15,23,42,0.1);
        }
        .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,23,42,0.2); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
        }
        .btn-upload {
          cursor: pointer; padding: 11px 14px; border-radius: var(--admin-radius-md);
          border: 1.5px dashed var(--admin-border); background: #f8fafc; font-size: 13px;
          font-weight: 600; color: var(--admin-text-muted); display: inline-flex;
          align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
        }
        .btn-upload:hover { background: #f1f5f9; border-color: var(--admin-accent-gold); color: var(--admin-text-main); }
        
        .spinner-dark {
          width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.1); border-top-color: var(--admin-text-muted);
          border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}