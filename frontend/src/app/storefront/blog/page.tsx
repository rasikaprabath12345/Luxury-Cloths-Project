"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const BLOG_POSTS = [
  {
    id: 1,
    title: "10 Timeless Fashion Pieces Every Woman Should Own",
    slug: "timeless-fashion-pieces",
    excerpt:
      "Discover the essential clothing items that will never go out of style and work perfectly in any wardrobe.",
    image: "https://images.unsplash.com/photo-1595777707802-52b966efb60f?w=600",
    date: "June 15, 2026",
    author: "Fashion Editor",
    category: "Style Guide",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "How to Care for Your Luxury Clothing",
    slug: "luxury-clothing-care",
    excerpt:
      "Pro tips on washing, storing, and maintaining your premium garments to ensure they last for years.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600",
    date: "June 12, 2026",
    author: "Care Expert",
    category: "Care Tips",
    readTime: "4 min read",
  },
  {
    id: 3,
    title: "Sustainable Fashion: Why Quality Matters",
    slug: "sustainable-fashion",
    excerpt:
      "Learn how investing in quality clothing is better for the environment and your wallet in the long run.",
    image: "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=600",
    date: "June 8, 2026",
    author: "Sustainability Coach",
    category: "Sustainability",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Summer Styling: Trends for 2026",
    slug: "summer-trends-2026",
    excerpt:
      "Explore the hottest fashion trends this summer and how to style them with confidence.",
    image: "https://images.unsplash.com/photo-1595859152207-b754c27e67d0?w=600",
    date: "June 1, 2026",
    author: "Trend Analyst",
    category: "Trends",
    readTime: "7 min read",
  },
  {
    id: 5,
    title: "Color Psychology in Fashion",
    slug: "color-psychology",
    excerpt:
      "Discover how different colors can influence your mood, confidence, and the impression you make.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    date: "May 28, 2026",
    author: "Style Consultant",
    category: "Fashion Tips",
    readTime: "5 min read",
  },
  {
    id: 6,
    title: "Building Your Capsule Wardrobe",
    slug: "capsule-wardrobe",
    excerpt:
      "Create a minimalist wardrobe with versatile pieces that mix and match effortlessly.",
    image: "https://images.unsplash.com/photo-1489087684033-876fad8acb62?w=600",
    date: "May 22, 2026",
    author: "Wardrobe Designer",
    category: "Style Guide",
    readTime: "8 min read",
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(BLOG_POSTS.map((p) => p.category)))];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts =
    selectedCategory === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((post) => post.category === selectedCategory);

  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Fashion & Style Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover styling tips, fashion trends, care guides, and inspiration from our expert contributors.
          </p>
        </div>

        {/* Featured Post */}
        {BLOG_POSTS.length > 0 && (
          <div className="mb-16 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-96">
                <Image
                  src={BLOG_POSTS[0].image}
                  alt={BLOG_POSTS[0].title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {BLOG_POSTS[0].category}
                  </span>
                  <span className="text-xs text-gray-600">{BLOG_POSTS[0].readTime}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {BLOG_POSTS[0].title}
                </h2>
                <p className="text-gray-600 mb-6">{BLOG_POSTS[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <p className="font-semibold text-gray-900">{BLOG_POSTS[0].author}</p>
                    <p>{BLOG_POSTS[0].date}</p>
                  </div>
                  <Link
                    href={`/storefront/blog/${BLOG_POSTS[0].slug}`}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-10 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/storefront/blog/${post.slug}`}
              className="group rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-600">{post.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get weekly fashion tips, exclusive styling advice, and new blog posts delivered to your inbox.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
