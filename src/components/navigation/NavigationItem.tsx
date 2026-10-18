"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

export interface NavigationItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isAccent?: boolean;
  badge?: number | string;
  onClick?: () => void;
  className?: string;
}

export default function NavigationItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  isAccent = false,
  badge,
  onClick,
  className = "",
}: NavigationItemProps) {
  if (isAccent) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-primary/40 text-primary hover:bg-primary/10 active:scale-[0.98] font-medium text-xs sm:text-sm transition-all duration-200 select-none shadow-xs ${className}`}
      >
        <Icon
          size={16}
          strokeWidth={2.2}
          className="transition-transform duration-200 group-hover:rotate-6 shrink-0"
        />
        <span className="truncate tracking-wide">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 select-none ${
        isActive
          ? "bg-surface-elevated/80 dark:bg-surface-elevated/70 border border-outline-variant/40 dark:border-outline-variant/30 text-primary dark:text-primary shadow-xs"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover/50 active:scale-[0.99]"
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon
          size={18}
          strokeWidth={isActive ? 2.2 : 1.7}
          className={`shrink-0 transition-colors duration-150 ${
            isActive ? "text-primary" : "text-text-tertiary group-hover:text-text-primary"
          }`}
        />
        <span className="truncate">{label}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {badge !== undefined && (
          <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1.5 text-[10px] font-semibold rounded-full bg-primary/20 text-primary">
            {badge}
          </span>
        )}

        {/* Stitch active indicator dot */}
        {isActive && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>
    </Link>
  );
}
