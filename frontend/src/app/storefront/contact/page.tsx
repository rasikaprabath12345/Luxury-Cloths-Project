"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend API
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1D1D1F] mb-6">
            Get In Touch
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Reach out anytime.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-black text-[#1D1D1F] mb-8">Contact Info</h2>
              <div className="space-y-8">
                {[
                  {
                    icon: "📍",
                    title: "Address",
                    content: "123 Fashion Street, Colombo 03, Sri Lanka",
                  },
                  {
                    icon: "📞",
                    title: "Phone",
                    content: "+94 11 234 5678",
                  },
                  {
                    icon: "✉️",
                    title: "Email",
                    content: "hello@luxurycloth.lk",
                  },
                  {
                    icon: "🕒",
                    title: "Hours",
                    content: "Mon - Sun: 10:00 AM - 8:00 PM",
                  },
                ].map((item, idx) => (
                  <div key={idx}>
                    <p className="text-3xl mb-3">{item.icon}</p>
                    <h3 className="font-bold text-[#1D1D1F] mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.content}</p>
                  </div>
                ))}
              </div>

              {/* Social */}
              <div className="mt-10 pt-10 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Follow Us</p>
                <div className="flex gap-4">
                  {["Instagram", "Facebook", "TikTok"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="w-10 h-10 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-lg
                                 flex items-center justify-center transition-colors text-sm font-bold"
                    >
                      {social[0]}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              {submitted && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
                  ✓ Thank you! Your message has been sent successfully.
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-[#1D1D1F] mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1D1D1F] mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1D1D1F] mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1D1D1F] mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Your message here..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg
                           transition-colors active:scale-95"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 sm:py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-[#1D1D1F] mb-8 text-center">Quick Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "FAQs", href: "/storefront/faq" },
              { label: "Shipping Info", href: "/storefront/shipping" },
              { label: "Returns", href: "/storefront/returns" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300
                           hover:shadow-lg transition-all text-center"
              >
                <p className="font-bold text-[#1D1D1F]">{link.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
