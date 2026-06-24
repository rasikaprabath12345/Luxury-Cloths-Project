export default function About() {
  return (
    <main className="pt-20 min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-5 py-16">
        <h1 className="text-5xl font-bold text-[#1D1D1F] mb-6">About LUXURY.lk</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          We are dedicated to bringing you the finest luxury clothing and accessories from around the world.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-3xl font-bold text-[#1D1D1F] mb-6">Our Mission</h2>
          <p className="text-gray-700 max-w-3xl leading-relaxed">
            At LUXURY.lk, our mission is to make premium fashion accessible to discerning customers who appreciate quality, craftsmanship, and style. We carefully curate every piece to ensure it meets our high standards of quality and design.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-3xl font-bold text-[#1D1D1F] mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Quality",
              description: "We only offer products that meet the highest standards of craftsmanship.",
            },
            {
              title: "Authenticity",
              description: "Every item is guaranteed to be authentic and comes with proper documentation.",
            },
            {
              title: "Customer Care",
              description: "Your satisfaction is our priority. We provide exceptional support and service.",
            },
          ].map((value) => (
            <div key={value.title} className="text-center">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-bold text-[#1D1D1F] mb-4">Get In Touch</h2>
          <p className="text-gray-600 mb-8">
            Have any questions? We'd love to hear from you.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div>
              <p className="font-semibold text-[#1D1D1F]">Email</p>
              <p className="text-gray-600">info@luxurycloth.lk</p>
            </div>
            <div>
              <p className="font-semibold text-[#1D1D1F]">Phone</p>
              <p className="text-gray-600">+94 (0) 11 234 5678</p>
            </div>
            <div>
              <p className="font-semibold text-[#1D1D1F]">Location</p>
              <p className="text-gray-600">Colombo, Sri Lanka</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
