"use client";

import Image from "next/image";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Fashion Enthusiast",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "Luxury Cloths has completely transformed my wardrobe. The quality is exceptional, and the customer service is outstanding. I'm a loyal customer for life!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Professional",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "I've purchased several items for work and social events. Every piece is beautifully crafted and true to size. Highly recommended!",
    rating: 5,
  },
  {
    id: 3,
    name: "Emma Williams",
    role: "Style Influencer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    content:
      "The attention to detail in every garment is incredible. Luxury Cloths truly understands quality luxury fashion. Shipping was fast and packaging was gorgeous.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Rodriguez",
    role: "Business Owner",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "I gift my clients with Luxury Cloths pieces. It's the perfect way to show appreciation. The return policy gives total peace of mind.",
    rating: 5,
  },
  {
    id: 5,
    name: "Jessica Lee",
    role: "Student",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    content:
      "Even though the prices are premium, the quality justifies every penny. I've had these pieces for over a year and they still look brand new!",
    rating: 5,
  },
  {
    id: 6,
    name: "Robert Thompson",
    role: "Teacher",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    content:
      "Amazing customer support! I had a question about sizing, and they responded within an hour. The dress fits perfectly!",
    rating: 5,
  },
];

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            What Our Customers Say
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thousands of satisfied customers trust Luxury Cloths for their premium fashion needs.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-16">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-blue-600">4.9★</p>
            <p className="text-sm text-gray-600 mt-1">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-blue-600">12.5K+</p>
            <p className="text-sm text-gray-600 mt-1">Happy Customers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-blue-600">98%</p>
            <p className="text-sm text-gray-600 mt-1">Would Recommend</p>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Testimonial Section */}
        <div className="mb-16 bg-blue-50 border border-blue-200 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Customer Stories</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Watch real customers share their Luxury Cloths experiences
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="relative h-48 bg-gray-300 rounded-lg overflow-hidden cursor-pointer group"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-blue-600 ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Join Thousands of Satisfied Customers
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience luxury fashion with exceptional quality and service. Shop now and get 10% off your first order with code WELCOME10.
          </p>
          <a
            href="/storefront/product"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Shop Now
          </a>
        </div>
      </div>
    </main>
  );
}
