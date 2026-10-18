"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine, Bell, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function MobileNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const profileHref = user && profile?.username ? `/profile/${profile.username}` : user ? "/profile" : "/login";

  const items = [
    {
      href: "/home",
      label: "Home",
      icon: Home,
      isActive: pathname === "/home" || pathname === "/",
    },
    {
      href: "/explore",
      label: "Explore",
      icon: Compass,
      isActive:
        pathname.startsWith("/explore") ||
        pathname.startsWith("/search") ||
        pathname.startsWith("/trending") ||
        pathname.startsWith("/writers"),
    },
    {
      href: user ? "/write" : "/login",
      label: "Write",
      icon: PenLine,
      isWrite: true,
      isActive: pathname.startsWith("/write"),
    },
    {
      href: user ? "/notifications" : "/login",
      label: "Alerts",
      icon: Bell,
      isActive: pathname.startsWith("/notifications"),
    },
    {
      href: profileHref,
      label: "Me",
      icon: User,
      isActive: pathname.startsWith("/profile"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/85 dark:bg-background/85 backdrop-blur-2xl border-t border-border-subtle/50 shadow-xl"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around h-14 px-3 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.isWrite) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary-container to-secondary text-[#050507] glowing-btn-aura shadow-lg active:scale-95 transition-transform"
                aria-label="Write a poem"
              >
                <Icon size={20} strokeWidth={2.4} />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 rounded-full transition-colors active:scale-95 ${
                item.isActive ? "text-primary" : "text-text-tertiary hover:text-text-primary"
              }`}
              aria-label={item.label}
              aria-current={item.isActive ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={item.isActive ? 2.2 : 1.7} />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">
                {item.label}
              </span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
