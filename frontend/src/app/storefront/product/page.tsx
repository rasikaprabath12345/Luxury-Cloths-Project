"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// 📦 Product එකේ හැඩය (දැන් TypeScript එරර් එක සම්පූර්ණයෙන්ම නිවැරදි කර ඇත)
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;   // camelCase සඳහා
  image?: string;      // සාමාන්‍ය image ලෙස එවුවහොත්
  ImageUrl?: string;   // PascalCase (C# විදිහට) එවුවහොත්
  description?: string;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(true); 

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 🔄 1. බැකෙන්ඩ් එකෙන් නිෂ්පාදන ලබා ගැනීම
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5226/api/Products");
      console.log("📦 බැකෙන්ඩ් එකෙන් ආපු ඇත්තම Products දත්ත:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ➕ 2. අලුත් නිෂ්පාදනයක් ඇතුළත් කිරීම
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) {
      alert("⚠️ කරුණාකර නම සහ මිල ඇතුළත් කරන්න.");
      return;
    }

    setIsSubmitting(true);

    try {
      const productPayload = {
        name: newName,
        price: parseFloat(newPrice),
        imageUrl: newImageUrl.trim() || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop",
        description: newDescription
      };

      const response = await axios.post("http://localhost:5226/api/Products", productPayload);

      if (response.status === 200 || response.status === 201) {
        alert("🎉 අලුත් නිෂ්පාදනය සාර්ථකව එකතු කළා!");
        fetchProducts(); 
        setIsModalOpen(false);
        setNewName("");
        setNewPrice("");
        setNewImageUrl("");
        setNewDescription("");
      }
    } catch (error: any) {
      console.error("Error adding product:", error);
      alert("⚠️ නිෂ්පාදනය ඇතුළත් කිරීම අසාර්ථකයි.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      
      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between border-b border-zinc-900">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Luxury Clothing Collection</h1>
          <p className="text-zinc-500 text-sm mt-1">අපගේ වාරික සහ නවතම ඇඟලුම් එකතුව මෙතනින් බලන්න.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm flex items-center gap-2"
          >
            ➕ අලුත් නිෂ්පාදනයක් එක් කරන්න
          </button>
        )}
      </div>

      {/* PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-zinc-500 text-sm">නිෂ්පාදන ලෝඩ් වෙමින් පවතී...🔄</div>
        ) : products.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm">දැනට කිසිදු නිෂ්පාදනයක් නොමැත.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              // 💡 බැකෙන්ඩ් එකෙන් එන ඕනෑම Image Variable එකක් ආරක්ෂිතව තෝරාගැනීම
              const validImageUrl = product.imageUrl || product.image || product.ImageUrl || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";

              return (
                <div key={product.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden group hover:border-zinc-800 transition flex flex-col justify-between">
                  <div>
                    <div className="h-72 w-full bg-zinc-900 overflow-hidden relative">
                      <img
                        src={validImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <div className="p-5 space-y-1">
                      <h3 className="font-bold text-zinc-200 text-base group-hover:text-blue-500 transition line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-zinc-500 font-light line-clamp-2">
                        {product.description || "විස්තරයක් ඇතුළත් කර නොමැත."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-5 pt-0 space-y-3">
                    <div className="text-lg font-black text-white">
                      ${product.price.toFixed(2)}
                    </div>
                    <button className="w-full bg-zinc-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition text-xs tracking-wider uppercase">
                      Add to Cart 🛒
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">✕</button>
            <h2 className="text-xl font-black text-blue-500 mb-2">📦 නව නිෂ්පාදනයක් ඇතුළත් කරන්න</h2>
            <p className="text-zinc-400 text-xs mb-6">ඇඳුමේ විස්තර නිවැරදිව පුරවන්න.</p>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">ඇඳුමේ නම (Product Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Royal Velvet Evening Gown"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">මිල (Price in USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g., 350.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">පින්තූරයේ ලින්ක් එක (Image URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">විස්තරය (Description)</label>
                <textarea
                  rows={3}
                  placeholder="ඇඳුම පිළිබඳ කෙටි විස්තරයක්..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-600 transition resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 bg-zinc-900 text-white font-bold py-3.5 rounded-xl">අවලංගු කරන්න</button>
                <button type="submit" disabled={isSubmitting} className="w-1/2 bg-blue-600 text-white font-bold py-3.5 rounded-xl">
                  {isSubmitting ? "සුරකිමින් පවතී..." : "තහවුරු කරන්න ✅"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}