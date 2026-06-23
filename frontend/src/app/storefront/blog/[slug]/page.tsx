"use client";

import Link from "next/link";
import Image from "next/image";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/storefront/blog" className="hover:text-blue-600">
            Blog
          </Link>
          <span>/</span>
          <span className="text-gray-900 capitalize">{slug.replace(/-/g, " ")}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Fashion Guide
            </span>
            <span className="text-xs text-gray-600">5 min read</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            {slug
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>By Fashion Editor</span>
            <span>•</span>
            <span>June 15, 2026</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-10">
          <Image
            src="https://images.unsplash.com/photo-1595777707802-52b966efb60f?w=800"
            alt="Blog post"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
          <p>
            Welcome to our comprehensive guide on fashion and style. In this article, we'll explore the key principles
            that help create stunning looks and develop a personal style that truly reflects who you are.
          </p>

          <h2>Understanding Your Style</h2>
          <p>
            Every person has a unique style identity. The key to developing your personal style is understanding what
            makes you feel confident and comfortable. This journey of self-discovery is crucial in building a wardrobe
            that works for your lifestyle.
          </p>

          <h2>Essential Pieces for Your Wardrobe</h2>
          <p>
            A well-rounded wardrobe doesn't require hundreds of items. Instead, it's about having quality pieces that
            work together. Here are the essentials you should consider:
          </p>
          <ul>
            <li>Classic white t-shirt</li>
            <li>Well-fitting jeans</li>
            <li>Neutral blazer</li>
            <li>White button-down shirt</li>
            <li>Versatile sweater</li>
            <li>Black pants</li>
          </ul>

          <h2>Color Coordination</h2>
          <p>
            Understanding color theory can significantly improve your styling abilities. Neutral colors like black,
            white, and gray serve as excellent bases. You can then add pops of color through accessories or statement
            pieces.
          </p>

          <h2>Quality Over Quantity</h2>
          <p>
            Investing in quality pieces means they'll last longer and look better over time. A well-made garment is
            worth the investment and will serve you better than multiple fast fashion items that fall apart after a few
            wears.
          </p>

          <h2>Final Thoughts</h2>
          <p>
            Building a personal style is a journey, not a destination. Take time to experiment, explore different
            pieces, and discover what makes you feel amazing. Remember, the best outfit is one that makes you feel
            confident and true to yourself.
          </p>
        </div>

        {/* Author Bio */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Editor"
                alt="Author"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Fashion Editor</h3>
              <p className="text-sm text-gray-600">
                Expert fashion writer with over 10 years of experience in the luxury fashion industry. Passionate about
                helping others discover their unique style.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Link
                key={i}
                href="#"
                className="group rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-40 bg-gray-200">
                  <Image
                    src="https://images.unsplash.com/photo-1595777707802-52b966efb60f?w=400"
                    alt="Related post"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                    Related Article {i}
                  </h3>
                  <p className="text-xs text-gray-600 mt-2">5 min read</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to update your wardrobe?</h3>
          <p className="text-gray-600 mb-6">Browse our latest collection of luxury pieces.</p>
          <Link
            href="/storefront/product"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </article>
    </main>
  );
}
