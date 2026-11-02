"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 skeleton rounded-full" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/home";
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(error || "");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <div className="w-12 h-12 mx-auto rounded-[var(--radius-lg)] bg-primary flex items-center justify-center">
              <span className="text-background text-xl font-semibold font-display">P</span>
            </div>
          </Link>
          <h1 className="font-poem-title text-3xl md:text-4xl text-text-primary mb-3 tracking-tight">
            Poetly
          </h1>
          <p className="text-sm text-text-secondary font-poem italic">
            Where words find their people.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-surface-secondary border border-border-default rounded-[var(--radius-md)]">
            <p className="text-xs text-text-primary font-medium">{errorMsg}</p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 min-h-[44px] bg-surface border border-border-default rounded-[var(--radius-md)] text-sm font-medium text-text-primary hover:bg-surface-hover hover:border-text-primary transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-text-tertiary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-center text-xs text-text-tertiary mt-8">
          By continuing, you agree to Poetly&apos;s community guidelines.
        </p>

        <div className="text-center mt-6">
          <Link href="/home" className="text-xs text-text-tertiary hover:text-text-primary transition-colors">
            Explore without signing in →
          </Link>
        </div>
      </div>
    </div>
  );
}
