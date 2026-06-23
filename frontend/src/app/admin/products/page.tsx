"use client";

import { useState, useEffect } from "react";
import axios from "axios"; 

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
}

// 💡 මෙන්න මෙතන "public" වෙනුවට "export" ලෙස නිවැරදි කරා 🎯
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Form States
  const [newName, setNewName] = useState<string>("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(""); 
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Fetch Products
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5226/api/Products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5226/api/Categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // DELETE PRODUCT LOGIC
  const handleDelete = async (id: number) => {
    if (!window.confirm("⚠️ ඔබට විශ්වාසද මෙම නිෂ්පාදනය පද්ධතියෙන් ඉවත් කිරීමට අවශ්‍ය බව?")) return;
    try {
      const response = await axios.delete(`http://localhost:5226/api/Products/${id}`);
      if (response.status === 200 || response.status === 204) {
        alert("🗑️ නිෂ්පාදනය සාර්ථකව ඉවත් කළා!");
        setProducts((prev) => prev.filter((product) => product.id !== id));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("❌ නිෂ්පාදනය ඉවත් කිරීම අසාර්ථකයි.");
    }
  };

  // ADD PRODUCT LOGIC
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !selectedCategoryId) {
      return alert("⚠️ කරුණාකර නම, මිල සහ කැටගරි එක ඇතුළත් කරන්න.");
    }
    setIsSubmitting(true);

    try {
      const productPayload = {
        name: newName,
        price: parseFloat(newPrice),
        imageUrl: newImageUrl.trim() || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop",
        description: newDescription,
        categoryId: parseInt(selectedCategoryId) 
      };

      const response = await axios.post("http://localhost:5226/api/Products", productPayload);
      if (response.status === 200 || response.status === 201) {
        alert("🎉 නව නිෂ්පාදනය සාර්ථකව පද්ධතියට එක් කළා!");
        fetchProducts();
        setIsModalOpen(false);
        setNewName(""); setNewPrice(""); setNewImageUrl(""); setNewDescription(""); setSelectedCategoryId("");
      }
    } catch (error) {
      alert("⚠️ නිෂ්පාදනය ඇතුළත් කිරීම අසාර්ථකයි. බැකෙන්ඩ් එක පරීක්ෂා කරන්න.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-black border-r border-zinc-900 p-6 hidden md:block shrink-0">
        <h2 className="text-xl font-black text-blue-500 tracking-wider">LUXURY ADMIN</h2>
        <nav className="mt-10 space-y-2">
          <div className="bg-zinc-900 text-blue-500 font-bold px-4 py-3 rounded-xl text-sm">📦 Products Management</div>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-900 gap-4">
          <div>
            <h1 className="text-2xl font-black">සියලුම නිෂ්පාදන පාලක පැනලය</h1>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition text-xs uppercase tracking-wider">
            ➕ අලුත් නිෂ්පාදනයක් එක් කරන්න
          </button>
        </div>

        {/* TABLE */}
        <div className="mt-8 bg-black border border-zinc-900 rounded-2xl overflow-hidden">
          <div className="p-4 bg-zinc-900/50 font-bold text-xs text-zinc-500 grid grid-cols-4 gap-4 border-b border-zinc-900">
            <div>Product</div>
            <div>Description</div>
            <div>Price</div>
            <div className="text-right">Action</div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-600 text-sm">දත්ත ලෝඩ් වෙමින් පවතී...</div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {products.map((product) => (
                <div key={product.id} className="p-4 grid grid-cols-4 gap-4 items-center text-sm hover:bg-zinc-900/20 transition">
                  <div className="flex items-center gap-3">
                    <img src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop"} className="w-10 h-10 object-cover rounded-lg bg-zinc-900" alt="" />
                    <span className="font-bold truncate">{product.name}</span>
                  </div>
                  <div className="text-zinc-500 text-xs truncate">{product.description || "No description"}</div>
                  <div className="font-mono text-zinc-300">${product.price.toFixed(2)}</div>
                  <div className="text-right">
                    <button onClick={() => handleDelete(product.id)} className="text-xs text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 px-3 py-1.5 rounded-lg transition">
                      මකන්න 🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="text-lg font-bold text-blue-500">අලුත් නිෂ්පාදනයක් ඇතුළත් කරන්න</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white text-lg">✕</button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4 text-sm">
              <div>
                <label className="block text-zinc-400 mb-1">Product Name *</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-blue-500" placeholder="eg: Luxury Silk Shirt" />
              </div>

              {/* CATEGORY DROPDOWN */}
              <div>
                <label className="block text-zinc-400 mb-1">Category *</label>
                <select 
                  required
                  value={selectedCategoryId} 
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="" disabled hidden>-- ප්‍රභේදය තෝරන්න (Select Category) --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-zinc-950 text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-blue-500 h-16 resize-none" placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Price ($) *</label>
                <input type="number" step="0.01" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-blue-500" placeholder="eg: 250.00" />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Image URL</label>
                <input type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-blue-500" placeholder="https://images.unsplash.com/..." />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 py-3 rounded-xl text-white transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="w-1/2 bg-blue-600 hover:bg-blue-700 font-bold py-3 rounded-xl text-white transition disabled:opacity-50">
                  {isSubmitting ? "සුරකිමින් පවතී... ⏳" : "Save Product 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}