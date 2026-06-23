"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 pt-20">
      <div className="text-center max-w-md">
        <h1 className="text-6xl sm:text-8xl font-black text-gray-900 mb-4">500</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Something Went Wrong
        </h2>
        <p className="text-gray-600 mb-8">
          An error occurred while processing your request. Please try again or contact support if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
