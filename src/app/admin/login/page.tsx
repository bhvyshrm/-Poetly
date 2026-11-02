"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-text-primary flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-sm relative z-10 bg-[#0A0A0A] rounded-[var(--radius-lg)] p-7 sm:p-9 border border-[#262626] shadow-xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group min-h-[44px]">
            <div className="w-10 h-10 rounded-md bg-primary text-background flex items-center justify-center">
              <span className="text-base font-serif font-bold">P</span>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-normal text-text-primary tracking-tight">Curator Access</h1>
          <p className="text-xs text-text-secondary mt-1 font-light">Enter the Poetly administrative sanctuary.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              className="w-full bg-[#111111] border border-[#262626] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-text-primary transition-colors font-sans"
              placeholder="Enter curator username"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block mb-1.5">
              Security Key
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-[#111111] border border-[#262626] rounded-[var(--radius-md)] px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-text-primary transition-colors font-sans"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-[#171717] border border-[#262626] rounded-[var(--radius-md)] px-3.5 py-2">
              <p className="text-xs text-text-primary font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-3 min-h-[44px] bg-primary text-background text-xs font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              "Sign In to Console"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/home" className="text-xs text-text-tertiary hover:text-text-primary transition-colors">
            Return to Literary Salon
          </Link>
        </div>
      </div>
    </div>
  );
}
