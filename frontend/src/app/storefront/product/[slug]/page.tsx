"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { productsAPI } from "@/lib/api";
import { useCart } from "@/context/CartContext";

interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  sizes?: string[];
  colors?: string[];
  material?: string;
  care?: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsAPI.getProductBySlug(slug);
        const data = res.data;
        
        // Map backend product to ProductDetail UI interface
        const sizesArr = data.sizes ? data.sizes.split(",").map((s: string) => s.trim()) : [];
        const colorsArr = data.variants && data.variants.length > 0 
          ? Array.from(new Set(data.variants.map((v: any) => v.color).filter(Boolean))) as string[]
          : [];
        const imagesArr = data.images && data.images.length > 0
          ? data.images.map((img: any) => img.imageUrl)
          : [data.imageUrl || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?q=80&w=600"];
        const totalStock = data.variants && data.variants.length > 0
          ? data.variants.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0)
          : 10;

        setProduct({
          id: data.id.toString(),
          slug: data.slug,
          name: data.name,
          description: data.description || "Ceylon luxury fabrics and modern fit.",
          price: data.price,
          originalPrice: data.discount > 0 ? data.price / (1 - data.discount / 100) : undefined,
          images: imagesArr,
          category: data.category?.name || "Premium Collection",
          stock: totalStock,
          rating: 4.8,
          reviews: 12,
          sizes: sizesArr,
          colors: colorsArr,
          material: "Ceylon Luxury Cotton & Silk Mix",
          care: ["Gentle Machine Wash", "Dry in Shade", "Iron Medium Heat"]
        });

        if (sizesArr.length > 0) setSelectedSize(sizesArr[0]);
        if (colorsArr.length > 0) setSelectedColor(colorsArr[0]);

      } catch (error) {
        console.error("Failed to fetch product by slug:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        <Link
          href="/storefront/product"
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/storefront/product" className="hover:text-blue-600">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === idx ? "border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Product thumbnail ${idx + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Category & Name */}
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-2">{product.category}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p
                className={`text-sm font-semibold ${
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 border-2 rounded-lg font-semibold transition-colors ${
                        selectedSize === size
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-900 hover:border-blue-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border-2 rounded-full font-semibold transition-colors ${
                        selectedColor === color
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-900 hover:border-blue-600"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex gap-3">
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center border-0 focus:ring-0 focus:outline-none"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
              <button
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart({
                    id: parseInt(product.id),
                    name: product.name,
                    price: product.price,
                    imageUrl: product.images?.[0] || "",
                    description: product.description,
                  }, quantity, selectedSize, selectedColor);
                  alert(`${quantity} × ${product.name} (${selectedSize} / ${selectedColor}) added to cart! 🛒`);
                }}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6 space-y-4">
              {product.material && (
                <div>
                  <p className="text-sm text-gray-600">Material</p>
                  <p className="font-semibold text-gray-900">{product.material}</p>
                </div>
              )}

              {product.care && product.care.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Care Instructions</p>
                  <ul className="space-y-1">
                    {product.care.map((instruction, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="group cursor-pointer"
              >
                <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <Image
                    src="https://images.unsplash.com/photo-1595777707802-52b966efb60f?w=400"
                    alt="Related product"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">Related Product {i}</h3>
                <p className="text-blue-600 font-bold">$199.99</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
