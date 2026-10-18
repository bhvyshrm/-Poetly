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
    <div className="min-h-screen bg-[#050505] text-text-primary flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 glass-surface rounded-3xl p-7 sm:p-9 border border-border-subtle/50 specular-top-border shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              <span className="text-white text-base font-serif font-bold">P</span>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-light text-text-primary tracking-tight">Curator Access</h1>
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
              className="w-full bg-surface-secondary/70 border border-border-subtle/50 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/60 outline-none focus:border-primary transition-colors font-sans"
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
                className="w-full bg-surface-secondary/70 border border-border-subtle/50 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-tertiary/60 outline-none focus:border-primary transition-colors font-sans"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-2.5 gradient-brand text-white text-xs font-semibold rounded-full shadow-md shadow-primary/25 hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
