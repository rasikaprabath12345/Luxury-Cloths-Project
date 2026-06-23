"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  image?: string;
  description?: string;
}

// ✨ SKELETON LOADER COMPONENT (ලෝඩ් වෙද්දී පෙන්වන Premium ඇනිමේෂන් එක)
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 p-4 space-y-4 animate-pulse flex flex-col justify-between h-[420px]">
      <div className="space-y-4">
        {/* Image Placehoder */}
        <div className="h-72 bg-gray-200 rounded-xl w-full" />
        {/* Title & Description Placeholder */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md w-3/4" />
          <div className="h-3 bg-gray-100 rounded-md w-full" />
        </div>
      </div>
      {/* Price & Button Placeholder */}
      <div className="pt-2 flex items-center justify-between border-t border-gray-50">
        <div className="h-5 bg-gray-200 rounded-md w-1/3" />
        <div className="h-9 bg-gray-200 rounded-xl w-1/3" />
      </div>
    </div>
  );
}

const categories = [
  { name: "පිරිමි (Menswear)", count: "120+ Items", image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=500&auto=format&fit=crop" },
  { name: "කාන්තා (Womenswear)", count: "85+ Items", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop" },
  { name: "መለዋවර්ග (Accessories)", count: "40+ Items", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop" },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 📡 ඩේටාබේස් එකෙන් සැබෑ නිෂ්පාදන ලබා ගැනීම
  useEffect(() => {
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

    fetchProducts();
  }, []);

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      
      {/* 🌟 1. HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center bg-zinc-900 text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop')` }}
        />
        <div className="relative z-10 text-center max-w-3xl px-4 space-y-6">
          <span className="text-xs font-bold tracking-widest text-blue-500 uppercase bg-blue-500/10 px-3 py-1.5 rounded-full">
            New Summer Collection 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
            DEFINE YOUR <span className="text-blue-500">LUXURY</span> STYLE.
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed">
            සුවපහසුව සහ නවීන විලාසිතා එකම තැනකින්. ශ්‍රී ලංකාවේ අංක 1 වාරික ඇඟලුම් එකතුව දැන්ම අත්විඳින්න.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link 
              href="/storefront/product" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full transition shadow-lg shadow-blue-600/30 text-center"
            >
              දැන්ම මිලදී ගන්න 🛒
            </Link>
            <Link 
              href="/admin/products" 
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold px-8 py-4 rounded-full transition text-center"
            >
              ⚙️ Admin Panel එකට යන්න
            </Link>
          </div>
        </div>
      </section>

      {/* 🚚 2. TRUST BADGES SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-b border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: "🚚", title: "දිවයින පුරා බෙදාහැරීම", desc: "දින 2-4ක් ඇතුළත නිවසටම" },
            { icon: "🛡️", title: "සුරක්ෂිත ගෙවීම්", desc: "100% ආරක්ෂිත පද්ධතියක්" },
            { icon: "🔄", title: "දින 7ක හුවමාරු කාලය", desc: "පහසුවෙන්ම මාරු කරගත හැක" },
            { icon: "⭐", title: "වාරික තත්ත්වය (Premium)", desc: "ඉහළම ප්‍රමිතියේ ਰෙදිපිළි" },
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center space-x-4 bg-gray-50 p-5 rounded-2xl">
              <span className="text-3xl bg-white p-3 rounded-xl shadow-sm">{badge.icon}</span>
              <div>
                <h4 className="font-bold text-sm text-gray-900">{badge.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 📁 3. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-blue-600 text-sm font-bold uppercase tracking-wider">Categories</span>
            <h2 className="text-3xl font-black tracking-tight mt-1">ඔබට ගැළපෙන කාණ්ඩය තෝරන්න</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="group relative h-80 rounded-3xl overflow-hidden shadow-md cursor-pointer">
              <img 
                src={cat.image} 
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-bold">{cat.name}</h3>
                <p className="text-xs text-gray-300 mt-1 font-light">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🛍️ 4. TRENDING PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-8 bg-zinc-50 rounded-3xl my-8">
        <div className="p-6 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-blue-600 text-sm font-bold uppercase tracking-wider">Top Picks</span>
              <h2 className="text-3xl font-black tracking-tight mt-1">දැනට වැඩියෙන්ම අලෙවි වන ඇඳුම්</h2>
            </div>
            <Link href="/storefront/product" className="text-blue-600 hover:underline font-semibold text-sm mt-2 sm:mt-0 inline-flex items-center">
              සියලුම නිෂ්පාදන බලන්න →
            </Link>
          </div>

          {loading ? (
            /* ✨ මෙන්න මෙතනට අලුත් Skeleton Cards 4ක් දාලා අප්ඩේට් කරා */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <ProductSkeleton key={n} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500 py-12 font-medium">
              ⚠️ තවමත් ඩේටාබේස් එකට කිසිදු නිෂ්පාදනයක් ඇතුළත් කර නැත.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 group relative flex flex-col justify-between h-[420px]">
                  <span className="absolute top-3 left-3 z-10 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    New
                  </span>

                  <div className="h-72 bg-gray-100 overflow-hidden relative">
                    <img 
                      src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600&auto=format&fit=crop"} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 group-hover:text-blue-600 transition">
                        {product.name}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">
                        {product.description || "Premium quality luxury clothing item."}
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-gray-900">රු {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <button className="w-full bg-zinc-900 hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl transition mt-2">
                        Add to Cart 🛒
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✉️ 5. NEWSLETTER SECTION */}
      <section className="bg-blue-600 text-white max-w-7xl mx-auto my-12 rounded-3xl p-8 md:p-16 text-center space-y-4 shadow-xl">
        <h2 className="text-3xl md:text-4xl font-black">10% ක සුවිශේෂී වට්ටමක් ලබාගන්න</h2>
        <p className="text-blue-100 text-sm max-w-md mx-auto">
          අපගේ නවතම ඇඳුම් එකතුන් සහ විශේෂ දීමනා පිළිබඳ විස්තර මුලින්ම ඔබගේ ඊමේල් ලිපිනයටම ලබාගන්න.
        </p>
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
          <input 
            type="email" 
            placeholder="ඔබේ ඊමේල් ලිපිනය" 
            className="w-full px-5 py-3.5 rounded-xl text-black focus:outline-none text-sm"
          />
          <button className="bg-black hover:bg-zinc-900 text-white font-bold px-6 py-3.5 rounded-xl transition text-sm shrink-0">
            එකතු වන්න📩
          </button>
        </div>
      </section>

      {/* 📜 6. PREMIUM FOOTER */}
      <footer className="bg-zinc-950 text-gray-400 text-sm py-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-white text-xl font-black tracking-tighter">LUXURY<span className="text-blue-500">.</span></h3>
            <p className="text-xs leading-relaxed text-gray-500">
              | ශ්‍රී ලංකාවේ වාරිකතම සහ උසස්ම තත්ත්වයේ විලාසිතා අත්දැකීමක් ලබා දෙන එකම තැන.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-widest text-blue-500">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition">මුල් පිටුව</Link></li>
              <li><Link href="/storefront/product" className="hover:text-white transition">නිෂ්පාදන</Link></li>
              <li><Link href="/about" className="hover:text-white transition">අප ගැන</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-widest text-blue-500">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white cursor-pointer transition">Contact Us</li>
              <li className="hover:text-white cursor-pointer transition">FAQs & Help</li>
              <li className="hover:text-white cursor-pointer transition">Shipping & Returns</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-widest text-blue-500">Contact</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              📍 Luxury Cloths HQ, Colombo, Sri Lanka.<br />
              📞 +94 11 234 5678<br />
              ✉ support@luxurycloths.com
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-zinc-900 text-center text-xs text-gray-600">
          © 2026 LUXURY CLOTHS. All Rights Reserved. Built with Next.js & Tailwind CSS.
        </div>
      </footer>

    </div>
  );
}