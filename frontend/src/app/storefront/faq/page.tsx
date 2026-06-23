"use client";

import { useState } from "react";

const FAQS = [
  {
    id: 1,
    category: "Shipping & Delivery",
    question: "How long does delivery take?",
    answer:
      "We offer free shipping on orders over $100, with delivery typically taking 5-7 business days. Express shipping options are available for an additional fee.",
  },
  {
    id: 2,
    category: "Shipping & Delivery",
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to over 50 countries worldwide. International shipping times vary from 10-21 business days depending on the destination.",
  },
  {
    id: 3,
    category: "Returns & Exchange",
    question: "What is your return policy?",
    answer:
      "We offer a 30-day money-back guarantee on all items. Items must be unused and in original packaging. Simply initiate a return through your account.",
  },
  {
    id: 4,
    category: "Returns & Exchange",
    question: "How do I exchange a product?",
    answer:
      "You can exchange items within 30 days of purchase. Log into your account, go to orders, and select the exchange option. We'll send you the correct size or style.",
  },
  {
    id: 5,
    category: "Payment & Billing",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, AmEx), PayPal, Apple Pay, Google Pay, and bank transfers for orders over $500.",
  },
  {
    id: 6,
    category: "Payment & Billing",
    question: "Is my payment information secure?",
    answer:
      "Yes, all transactions are encrypted using SSL 256-bit encryption. We never store full credit card details and comply with PCI DSS standards.",
  },
  {
    id: 7,
    category: "Size & Fit",
    question: "How do I find the right size?",
    answer:
      "Each product page includes a detailed size guide with measurements. We also offer a Size Fit Assistant tool to help you choose the perfect fit.",
  },
  {
    id: 8,
    category: "Size & Fit",
    question: "Can I see how a product looks before buying?",
    answer:
      "Yes, all our products have multiple high-resolution images and customer reviews with photos. You can also check virtual try-on for selected items.",
  },
  {
    id: 9,
    category: "Account",
    question: "How do I reset my password?",
    answer:
      "Click 'Forgot Password' on the login page and follow the instructions sent to your email. You can then create a new password.",
  },
  {
    id: 10,
    category: "Account",
    question: "Can I track my order?",
    answer:
      "Yes, you can track your order in real-time from your account dashboard. You'll also receive email updates with tracking information.",
  },
];

const categories = Array.from(new Set(FAQS.map((faq) => faq.category)));

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredFAQs = selectedCategory
    ? FAQS.filter((faq) => faq.category === selectedCategory)
    : FAQS;

  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about shipping, returns, payments, and more.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-10 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              selectedCategory === null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
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

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
            >
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="text-left flex-1">
                  <p className="text-xs text-blue-600 font-semibold mb-1">{faq.category}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 flex-shrink-0 ml-4 transition-transform ${
                    expandedId === faq.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {expandedId === faq.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-8 sm:p-12 text-center border border-blue-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/storefront/contact"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
