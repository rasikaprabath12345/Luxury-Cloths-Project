import Link from "next/link";

// ─── FOOTER COLUMNS ───────────────────────────────────────────────────────────
const FOOTER_COLS = [
  {
    title: "Shop",
    links: [
      { label: "All Products",  href: "/storefront/product" },
      { label: "Collections",   href: "/storefront/collections" },
      { label: "New Arrivals",  href: "/storefront/product?sort=new" },
      { label: "Sale",          href: "/storefront/product?filter=sale" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQs",               href: "/storefront/faq" },
      { label: "Size Guide",         href: "/storefront/size-guide" },
      { label: "Shipping Info",      href: "/storefront/shipping" },
      { label: "Returns & Exchanges", href: "/storefront/returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us",    href: "/storefront/about" },
      { label: "Blog",        href: "/storefront/blog" },
      { label: "Testimonials", href: "/storefront/testimonials" },
      { label: "Contact",     href: "/storefront/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/storefront/privacy" },
      { label: "Terms of Use",   href: "/storefront/terms" },
    ],
  },
];

// ─── SOCIAL LINKS ─────────────────────────────────────────────────────────────
const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
];

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export default function Footer() {
  return (
    <footer
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}
      className="bg-[#1D1D1F] text-[#6E6E73]"
    >
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-6 sm:pb-10 
                      grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-6 md:gap-8">

        {/* Brand col — takes full width on mobile, 2 of 5 on desktop */}
        <div className="sm:col-span-2 space-y-4">
          <a href="/" className="inline-block">
            <h3 className="text-white text-lg sm:text-xl font-black tracking-tight">
              LUXURY<span className="text-blue-500">.</span>lk
            </h3>
          </a>
          <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed max-w-xs">
            Sri Lanka's premiere fashion destination.
            Quality craftsmanship, modern style.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2 pt-2 sm:pt-1">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12]
                           text-[#6E6E73] hover:text-white
                           flex items-center justify-center transition-all duration-150"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Contact strip */}
          <div className="pt-2 sm:pt-4 space-y-1">
            <p className="text-xs text-[#6E6E73]">📍 Colombo, Sri Lanka</p>
            <p className="text-xs text-[#6E6E73]">📞 +94 11 234 5678</p>
            <p className="text-xs text-[#6E6E73]">✉ support@luxurycloth.lk</p>
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map((col) => (
          <div key={col.title} className="lg:col-span-1">
            <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-blue-500 mb-3 sm:mb-4">
              {col.title}
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-xs text-[#6E6E73] hover:text-white transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter mini strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 border-t border-white/[0.06]
                      flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <p className="text-xs sm:text-sm font-semibold text-white">Stay in the loop</p>
          <p className="text-xs text-[#6E6E73]">New drops and exclusive offers to your inbox.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 sm:flex-none sm:w-52 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm text-[#1D1D1F]
                       bg-white/90 placeholder:text-gray-400 focus:outline-none
                       focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white
                       text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl
                       transition-all duration-150 shrink-0"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5
                        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
          <p className="text-xs text-[#424245]">
            © 2026 Luxury Cloths Pvt Ltd. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Link href="/storefront/privacy" className="text-xs text-[#424245] hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/storefront/terms" className="text-xs text-[#424245] hover:text-white transition-colors">
              Terms of Use
            </Link>
            <p className="text-xs text-[#424245]">Made in Sri Lanka</p>
          </div>
        </div>
      </div>
    </footer>
  );
}