import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 pt-20">
      <div className="text-center max-w-md">
        <h1 className="text-6xl sm:text-8xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/storefront/product"
            className="px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
