import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center animate-fade-in">
        <p className="font-poem-title text-6xl md:text-7xl text-text-tertiary mb-4">404</p>
        <h1 className="font-poem text-xl md:text-2xl text-text-primary mb-2">
          Looks like this page wandered away.
        </h1>
        <p className="text-sm text-text-tertiary mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center justify-center px-6 py-2.5 min-h-[44px] bg-primary text-background text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
        >
          Return to Poetly
        </Link>
      </div>
    </div>
  );
}
