import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1D1D1F] mb-6">
            About LUXURY<span className="text-blue-500">.</span>lk
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Curating premium fashion that celebrates elegance, craftsmanship, and timeless style for the modern Sri Lankan.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1D1D1F] mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2023, LUXURY.lk emerged from a simple vision: to make premium fashion accessible to Sri Lankans who refuse to compromise on quality and style.
                </p>
                <p>
                  We partner with renowned designers and artisans who share our commitment to excellence. Every piece in our collection is handpicked for its craftsmanship, durability, and design innovation.
                </p>
                <p>
                  Today, we serve thousands of customers across Sri Lanka and beyond, delivering not just clothing, but confidence and self-expression.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center text-gray-400">
              <span className="text-6xl">✨</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-[#1D1D1F] mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Quality First", desc: "Every item meets rigorous standards for materials, construction, and durability." },
              { title: "Ethical Fashion", desc: "We work with suppliers who ensure fair practices and sustainable production methods." },
              { title: "Customer Centric", desc: "Your satisfaction is our priority. Easy returns, responsive support, fast delivery." },
            ].map((val) => (
              <div key={val.title} className="bg-white rounded-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-[#1D1D1F] mb-3">{val.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* By The Numbers */}
      <section className="py-16 sm:py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-[#1D1D1F] mb-12 text-center">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "12.5K+", label: "Happy Customers" },
              { num: "500+", label: "Products" },
              { num: "98%", label: "Satisfaction" },
              { num: "50+", label: "Brands" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-blue-500 mb-2">{stat.num}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-[#1D1D1F] border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Ready to Elevate Your Style?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Explore our collections and discover pieces that celebrate your unique sense of style.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/storefront/product"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/storefront/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg transition-colors border border-white/20"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
