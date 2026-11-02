"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Flag,
  Star,
  MessageSquare,
  Activity,
  Settings,
  Menu,
  X,
  ChevronLeft,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/poems", label: "Poems", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/featured", label: "Featured", icon: Star },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Login page doesn't use the admin dashboard shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-text-primary selection:bg-surface-secondary relative">
      <div className="flex relative z-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-[#0A0A0A] border-r border-[#262626] shrink-0">
          <div className="px-5 py-6 border-b border-[#262626] space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors group min-h-[32px]"
            >
              <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Poetly</span>
            </Link>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-6 h-6 rounded-md bg-primary text-background flex items-center justify-center text-xs font-serif font-bold">
                P
              </div>
              <h1 className="font-display text-lg font-normal text-text-primary tracking-tight">
                Curator Console
              </h1>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-background font-semibold"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  <item.icon size={15} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-background" : "text-text-tertiary"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-[#262626] space-y-2">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-2.5 px-3.5 py-2 min-h-[44px] text-xs w-full rounded-lg text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
            <p className="px-3.5 text-[10px] font-mono text-text-tertiary">Poetly Console v2.0</p>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-[#262626]">
          <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="text-text-secondary hover:text-text-primary transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open navigation menu"
              >
                <Menu size={20} strokeWidth={1.5} />
              </button>
              <h1 className="font-display text-base text-text-primary font-medium">Curator Console</h1>
            </div>
            <Link href="/" className="text-xs text-text-tertiary hover:text-text-primary transition-colors min-h-[44px] flex items-center">
              Return to Salon
            </Link>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 bg-[#0A0A0A] border-r border-[#262626] shadow-2xl animate-fade-in flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626]">
                  <h2 className="font-display text-base text-text-primary font-medium">Curator Navigation</h2>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="text-text-tertiary hover:text-text-primary transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Close navigation menu"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
                <nav className="px-3 py-3 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] text-xs font-medium rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-background font-semibold"
                            : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                        }`}
                      >
                        <item.icon size={15} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-background" : "text-text-tertiary"} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="px-3 py-4 border-t border-[#262626]">
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2.5 px-3.5 py-2 min-h-[44px] text-xs w-full rounded-lg text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <LogOut size={14} />
                  <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:max-h-screen lg:overflow-y-auto">
          <div className="px-5 md:px-8 py-6 md:py-8 lg:pt-8 pt-16">{children}</div>
        </main>
      </div>
    </div>
  );
}
