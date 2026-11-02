"use client";

import React from "react";
import Link from "next/link";
import { Profile } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";

export interface WriterCardProps {
  writer: Profile;
  showBio?: boolean;
  showFollow?: boolean;
  isFollowed?: boolean;
  onFollowToggle?: () => void;
  variant?: "default" | "compact" | "row";
  className?: string;
}

export default function WriterCard({
  writer,
  showBio = true,
  showFollow = false,
  isFollowed = false,
  onFollowToggle,
  variant = "default",
  className = "",
}: WriterCardProps) {
  const isRow = variant === "row";

  return (
    <div
      className={`group flex items-center justify-between gap-3.5 transition-all p-3 rounded-xl hover:bg-surface-hover/40 ${className}`}
    >
      <Link
        href={`/profile/${writer.username}`}
        className="flex items-center gap-3 min-w-0 flex-1 focus-visible:outline-none"
      >
        <Avatar
          src={writer.profile_image}
          name={writer.display_name}
          size={isRow ? "sm" : "md"}
          className="shrink-0 group-hover:ring-2 group-hover:ring-primary/40 transition-all"
        />

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs sm:text-sm text-text-primary group-hover:text-primary transition-colors truncate">
            {writer.display_name}
          </p>
          <p className="text-[11px] text-text-tertiary truncate">
            @{writer.username}
          </p>
          {showBio && writer.bio && (
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1 font-verse italic text-text-secondary/80">
              {writer.bio}
            </p>
          )}
        </div>
      </Link>

      {showFollow && onFollowToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFollowToggle();
          }}
          className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all select-none ${
            isFollowed
              ? "bg-surface-secondary text-text-primary border border-border-default hover:bg-surface-hover"
              : "bg-primary text-on-primary hover:opacity-90"
          }`}
          aria-label={isFollowed ? `Unfollow ${writer.display_name}` : `Follow ${writer.display_name}`}
        >
          {isFollowed ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}
