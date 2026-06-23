"use client";

import Link from "next/link";

interface WomenSize {
  size: string;
  bust: string;
  waist: string;
  length: string;
}

interface MenSize {
  size: string;
  chest: string;
  waist: string;
  length: string;
}

interface ShoeSize {
  size: string;
  us: string;
  eu: string;
  uk: string;
}

interface SizeGuide {
  category: string;
  sizes: (WomenSize | MenSize | ShoeSize)[];
}

const SIZE_GUIDES: SizeGuide[] = [
  {
    category: "Women's Clothing",
    sizes: [
      { size: "XS", bust: "32-34", waist: "24-26", length: "56-58" },
      { size: "S", bust: "34-36", waist: "26-28", length: "58-60" },
      { size: "M", bust: "36-38", waist: "28-30", length: "60-62" },
      { size: "L", bust: "38-40", waist: "30-32", length: "62-64" },
      { size: "XL", bust: "40-42", waist: "32-34", length: "64-66" },
      { size: "XXL", bust: "42-44", waist: "34-36", length: "66-68" },
    ] as WomenSize[],
  },
  {
    category: "Men's Clothing",
    sizes: [
      { size: "XS", chest: "34-36", waist: "28-30", length: "64-66" },
      { size: "S", chest: "36-38", waist: "30-32", length: "66-68" },
      { size: "M", chest: "38-40", waist: "32-34", length: "68-70" },
      { size: "L", chest: "40-42", waist: "34-36", length: "70-72" },
      { size: "XL", chest: "42-44", waist: "36-38", length: "72-74" },
      { size: "XXL", chest: "44-46", waist: "38-40", length: "74-76" },
    ] as MenSize[],
  },
  {
    category: "Shoes",
    sizes: [
      { size: "4", us: "4", eu: "35", uk: "2" },
      { size: "5", us: "5", eu: "36", uk: "3" },
      { size: "6", us: "6", eu: "37", uk: "4" },
      { size: "7", us: "7", eu: "38", uk: "5" },
      { size: "8", us: "8", eu: "39", uk: "6" },
      { size: "9", us: "9", eu: "40", uk: "7" },
      { size: "10", us: "10", eu: "41", uk: "8" },
      { size: "11", us: "11", eu: "42", uk: "9" },
    ] as ShoeSize[],
  },
];

export default function SizeGuidePage() {
  return (
    <main className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Size Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find your perfect fit with our comprehensive size guide.
          </p>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 sm:p-8 mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How to Measure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">👕 Chest/Bust</h3>
              <p className="text-sm text-gray-600">
                Measure around the fullest part of your chest or bust. Keep the tape measure parallel to the ground.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">👖 Waist</h3>
              <p className="text-sm text-gray-600">
                Measure around the narrowest part of your waist, keeping the tape measure snug but not tight.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📏 Length</h3>
              <p className="text-sm text-gray-600">
                Measure from the top of your shoulder down to your desired garment length.
              </p>
            </div>
          </div>
        </div>

        {/* Size Charts */}
        <div className="space-y-12">
          {SIZE_GUIDES.map((guide, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{guide.category}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Size</th>
                      {"bust" in guide.sizes[0] && (
                        <>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Bust (in)</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Waist (in)</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Length (in)</th>
                        </>
                      )}
                      {"chest" in guide.sizes[0] && (
                        <>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Chest (in)</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Waist (in)</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Length (in)</th>
                        </>
                      )}
                      {"us" in guide.sizes[0] && (
                        <>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">US</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">EU</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">UK</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {guide.sizes.map((row, ridx) => (
                      <tr
                        key={ridx}
                        className={`border-b border-gray-200 ${ridx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-4 py-3 font-semibold text-gray-900">{row.size}</td>
                        {"bust" in row && (
                          <>
                            <td className="px-4 py-3 text-gray-700">{row.bust}</td>
                            <td className="px-4 py-3 text-gray-700">{row.waist}</td>
                            <td className="px-4 py-3 text-gray-700">{row.length}</td>
                          </>
                        )}
                        {"chest" in row && (
                          <>
                            <td className="px-4 py-3 text-gray-700">{row.chest}</td>
                            <td className="px-4 py-3 text-gray-700">{row.waist}</td>
                            <td className="px-4 py-3 text-gray-700">{row.length}</td>
                          </>
                        )}
                        {"us" in row && (
                          <>
                            <td className="px-4 py-3 text-gray-700">{row.us}</td>
                            <td className="px-4 py-3 text-gray-700">{row.eu}</td>
                            <td className="px-4 py-3 text-gray-700">{row.uk}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Support */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 sm:p-12 text-center border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Need help finding your size?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our styling team is ready to help you find the perfect fit.
          </p>
          <Link
            href="/storefront/contact"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
