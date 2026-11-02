"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import GlobalHeader from "./GlobalHeader";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MainContent from "./MainContent";
import RightRail from "./RightRail";

export interface AppShellProps {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
  maxWidth?: "feed" | "reading" | "wide" | "full";
  noSidebar?: boolean;
  noHeader?: boolean;
  rawContent?: boolean;
  className?: string;
  contentClassName?: string;
}

export default function AppShell({
  children,
  rightRail,
  maxWidth = "feed",
  noSidebar = false,
  noHeader = false,
  rawContent = false,
  className = "",
  contentClassName = "",
}: AppShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileDrawerOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  return (
    <div className={`min-h-screen bg-background text-text-primary flex flex-col relative ${className}`}>
      {/* Top Header */}
      {!noHeader && (
        <GlobalHeader
          onMenuToggle={() => setMobileDrawerOpen((prev) => !prev)}
          isMenuOpen={mobileDrawerOpen}
        />
      )}

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-surface border-r border-border-default p-3 flex flex-col md:hidden transition-transform duration-300 ease-out shadow-2xl ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        <Sidebar onNavigate={() => setMobileDrawerOpen(false)} />
      </div>

      {/* Main Layout Grid */}
      <div className="relative z-10 flex-1 w-full max-w-[1360px] mx-auto px-2 sm:px-4 lg:px-8 flex gap-6 lg:gap-8">
        {/* Desktop & Tablet Sidebar */}
        {!noSidebar && (
          <aside className="hidden md:block w-[240px] lg:w-[260px] shrink-0">
            <Sidebar />
          </aside>
        )}

        {/* Center Main Content Area */}
        {rawContent ? (
          <div className="flex-1 min-w-0 w-full">{children}</div>
        ) : (
          <MainContent
            maxWidth={maxWidth}
            className={`pb-24 md:pb-8 ${contentClassName}`}
          >
            {children}
          </MainContent>
        )}

        {/* Optional Right Rail */}
        {rightRail && <RightRail>{rightRail}</RightRail>}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
