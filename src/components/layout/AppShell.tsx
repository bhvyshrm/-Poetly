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
      {/* Ambient Light Wells (Stitch Atmospheric Ground Layer) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 right-10 w-[680px] h-[680px] rounded-full bg-primary-container/5 blur-[140px]" />
        <div className="absolute top-[40%] -left-48 w-[600px] h-[600px] rounded-full bg-secondary-container/10 blur-[160px]" />
        <div className="absolute -bottom-40 right-1/3 w-[500px] h-[500px] rounded-full bg-tertiary-container/10 blur-[130px]" />
      </div>

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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] glass-panel-elevated border-r border-border-subtle/50 p-3 flex flex-col md:hidden transition-transform duration-300 ease-out shadow-2xl ${
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
            className={`pb-20 md:pb-8 ${contentClassName}`}
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
