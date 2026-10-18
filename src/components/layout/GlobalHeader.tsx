"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Moon,
  Sun,
  Bell,
  PenLine,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import Avatar from "@/components/ui/Avatar";

export interface GlobalHeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export default function GlobalHeader({
  onMenuToggle,
  isMenuOpen = false,
}: GlobalHeaderProps) {
  const router = useRouter();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full h-[var(--nav-height,60px)] bg-background/80 dark:bg-background/80 backdrop-blur-2xl border-b border-border-subtle/50 shadow-xs transition-colors duration-200"
    >
      <div className="w-full max-w-[1360px] mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Menu Toggle & Brand Wordmark */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 active:scale-95 transition-all"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Stitch Brand Logo */}
          <Link
            href="/home"
            className="font-display italic text-xl sm:text-2xl text-primary tracking-tight flex items-center gap-1.5 transition-all duration-200 active:scale-95 group select-none"
            aria-label="Poetly home"
          >
            <span className="font-semibold">Poetly</span>
            <Sparkles
              size={18}
              className="text-primary group-hover:rotate-12 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Global Search */}
          <div className="relative w-72 lg:w-80 hidden md:block ml-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full" role="search">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="global-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search poems, poets, stanzas... ⌘K"
                aria-label="Search poems, writers, and tags"
                className="w-full h-9 pl-10 pr-9 rounded-full bg-surface-secondary/70 border border-outline-variant/30 text-xs sm:text-sm text-text-primary placeholder:text-outline focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </form>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2" aria-label="Quick Navigation">
          <Link
            href="/explore"
            className="text-text-secondary hover:text-primary px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/collections"
            className="text-text-secondary hover:text-primary px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors"
          >
            Collections
          </Link>
          <Link
            href="/explore?tab=prompts"
            className="text-text-secondary hover:text-primary px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors"
          >
            Anthologies
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 active:scale-95 transition-all"
            aria-label="Toggle mobile search"
          >
            <Search size={18} strokeWidth={1.8} />
          </button>

          {/* Primary Action: Glowing Stitch Write Pill */}
          <Link
            href={user ? "/write" : "/login"}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-container to-secondary text-[#050507] font-semibold text-xs sm:text-sm glowing-btn-aura hover:opacity-95 active:scale-95 transition-all select-none shadow-sm min-h-[34px]"
            aria-label="Write a poem"
          >
            <PenLine size={15} strokeWidth={2.4} />
            <span>Write</span>
          </Link>

          {/* Notifications */}
          {user && (
            <Link
              href="/notifications"
              className="flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 active:scale-95 transition-all"
              aria-label="View notifications"
            >
              <Bell size={18} strokeWidth={1.8} />
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-hover/60 active:scale-95 transition-all"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun size={18} strokeWidth={1.8} />
            ) : (
              <Moon size={18} strokeWidth={1.8} />
            )}
          </button>

          {/* Profile / Account Dropdown */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
                aria-label="User account menu"
                aria-expanded={profileDropdownOpen}
              >
                <Avatar
                  src={profile?.profile_image}
                  name={profile?.display_name}
                  size="sm"
                />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 mt-2 w-52 bg-surface border border-border-subtle rounded-[var(--radius-md)] shadow-xl z-40 py-1.5 animate-scale-in text-sm"
                    role="menu"
                  >
                    <div className="px-3.5 py-2 border-b border-border-subtle">
                      <p className="font-medium text-text-primary truncate">
                        {profile?.display_name || "Writer"}
                      </p>
                      <p className="text-xs text-text-tertiary truncate">
                        @{profile?.username || "writer"}
                      </p>
                    </div>

                    <Link
                      href={profile?.username ? `/profile/${profile.username}` : "/profile"}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                      role="menuitem"
                    >
                      <UserIcon size={16} />
                      <span>Your Profile</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                        role="menuitem"
                      >
                        <ShieldAlert size={16} />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await signOut();
                        router.push("/home");
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-error hover:bg-surface-hover transition-colors text-left"
                      role="menuitem"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-brand hover:text-brand-hover hover:bg-brand-subtle px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-3 py-2 bg-surface border-b border-border-subtle animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search poems, writers, tags..."
              autoFocus
              className="w-full h-9 pl-9 pr-8 rounded-[var(--radius-full)] bg-background border border-border-subtle text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
}
