"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white flex items-center justify-center px-5 font-sans">
        <div className="text-center animate-fade-in max-w-md mx-auto">
          <p className="text-4xl text-neutral-400 mb-4 font-serif">✦</p>
          <h1 className="text-xl md:text-2xl font-serif text-white mb-2">
            Something went wrong.
          </h1>
          <p className="text-sm text-neutral-400 mb-8">
            An unexpected error occurred. Please try again.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/home"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-neutral-700 text-white text-sm font-medium rounded-full hover:border-neutral-400 transition-colors"
            >
              Return home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
