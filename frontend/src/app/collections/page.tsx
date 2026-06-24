export default function Collections() {
  return (
    <main className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <h1 className="text-4xl font-bold text-[#1D1D1F] mb-4">Collections</h1>
        <p className="text-gray-600 mb-8">
          Explore our curated collections of luxury clothing.
        </p>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Summer Collection", description: "Light and breathable fabrics for warm weather" },
            { name: "Winter Collection", description: "Warm and cozy pieces for cold seasons" },
            { name: "Casual Wear", description: "Comfortable everyday clothing" },
            { name: "Formal Wear", description: "Elegant pieces for special occasions" },
            { name: "Premium Basics", description: "High-quality essentials" },
            { name: "Limited Edition", description: "Exclusive designer collaborations" },
          ].map((collection) => (
            <div
              key={collection.name}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">
                {collection.name}
              </h3>
              <p className="text-gray-600 text-sm">{collection.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
