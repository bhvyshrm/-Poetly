"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Flag,
  Sparkles,
} from "lucide-react";
import { PoemWithAuthor } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/ui/Avatar";

export interface PoemCardProps {
  poem: PoemWithAuthor;
  variant?: "default" | "featured" | "compact";
  onReport?: (poemId: string) => void;
  className?: string;
}

export default function PoemCard({
  poem,
  variant = "default",
  onReport,
  className = "",
}: PoemCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("poem_id", poem.id),
          supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("poem_id", poem.id),
        ]);

        if (isMounted) {
          if (!likesRes.error) setLikeCount(likesRes.count || 0);
          if (!commentsRes.error) setCommentCount(commentsRes.count || 0);
        }

        if (user && isMounted) {
          const [userLike, userSave] = await Promise.all([
            supabase
              .from("likes")
              .select("id")
              .eq("poem_id", poem.id)
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("saves")
              .select("id")
              .eq("poem_id", poem.id)
              .eq("user_id", user.id)
              .maybeSingle(),
          ]);

          if (isMounted) {
            setIsLiked(Boolean(userLike.data));
            setIsSaved(Boolean(userSave.data));
          }
        }
      } catch {
        // silent fail
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [poem.id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      if (previousLiked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("poem_id", poem.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .insert({ poem_id: poem.id, user_id: user.id });
        if (error) throw error;

        if (user.id !== poem.author_id) {
          await supabase.from("notifications").insert({
            recipient_id: poem.author_id,
            actor_id: user.id,
            type: "like",
            reference_id: poem.id,
          });
        }
      }
    } catch {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    const previousSaved = isSaved;
    setIsSaved(!previousSaved);

    try {
      if (previousSaved) {
        const { error } = await supabase
          .from("saves")
          .delete()
          .eq("poem_id", poem.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saves")
          .insert({ poem_id: poem.id, user_id: user.id });
        if (error) throw error;
      }
    } catch {
      setIsSaved(previousSaved);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = typeof window !== "undefined" ? `${window.location.origin}/poem/${poem.id}` : "";
    if (navigator.share) {
      navigator.share({ title: poem.title, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
  };

  const handleReport = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setReporting(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        target_type: "poem",
        target_id: poem.id,
        reason: "Inappropriate or abusive content",
      });
      if (!error) {
        setReportSuccess(true);
        onReport?.(poem.id);
      }
    } catch {
      // silent fail
    } finally {
      setReporting(false);
      setShowActions(false);
    }
  };

  const author = poem.profiles;
  const authorName = author?.display_name || "Anonymous";
  const authorUsername = author?.username || "poet";
  const lines = poem.content ? poem.content.split("\n") : [];
  const previewMaxLines = variant === "featured" ? 8 : variant === "compact" ? 3 : 5;
  const preview = lines.slice(0, previewMaxLines).join("\n");
  const timeAgo = getTimeAgo(poem.published_at || poem.created_at);

  if (variant === "featured") {
    return (
      <article
        className={`py-8 md:py-10 border-b border-border-default animate-fade-in ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-text-primary tracking-wider uppercase font-mono">
            <span>Featured Poem</span>
          </div>
          <span className="text-xs text-text-tertiary">{timeAgo}</span>
        </div>

        <Link href={`/poem/${poem.id}`} className="group block mb-4">
          <h2 className="font-poem-title text-2xl sm:text-3xl lg:text-4xl text-text-primary group-hover:underline transition-all mb-4 break-words">
            {poem.title}
          </h2>
          <div className="poem-content-lg text-text-primary/90 leading-relaxed font-poem text-lg">
            {preview}
            {lines.length > previewMaxLines && (
              <span className="text-text-tertiary">...</span>
            )}
          </div>
        </Link>

        {/* Author Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-subtle">
          <Link
            href={`/profile/${authorUsername}`}
            className="flex items-center gap-2.5 group"
          >
            <Avatar
              src={author?.profile_image}
              name={authorName}
              size="sm"
            />
            <div>
              <p className="text-xs sm:text-sm font-medium text-text-primary group-hover:underline transition-all">
                {authorName}
              </p>
              <p className="text-[11px] text-text-tertiary">@{authorUsername}</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLiked ? "text-text-primary font-semibold" : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              <Heart
                size={16}
                strokeWidth={1.75}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>{likeCount}</span>
            </button>
            <Link
              href={`/poem/${poem.id}#comments`}
              className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <MessageCircle size={16} strokeWidth={1.75} />
              <span>{commentCount}</span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`glass-surface rounded-2xl p-5 sm:p-7 space-y-4 sm:space-y-5 border border-border-default hover:border-border-strong transition-all duration-200 mb-6 ${className}`}
    >
      {/* Header: Author + Meta + Overflow Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/profile/${authorUsername}`}
            className="shrink-0 rounded-full focus-visible:outline-none"
          >
            <Avatar
              src={author?.profile_image}
              name={authorName}
              size="md"
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${authorUsername}`}
                className="text-xs sm:text-sm font-semibold text-text-primary hover:underline transition-all truncate block"
              >
                {authorName}
              </Link>
              <span className="w-1 h-1 rounded-full bg-text-tertiary shrink-0" />
              <span className="text-xs text-text-tertiary truncate">
                @{authorUsername}
              </span>
            </div>
            <p className="text-[11px] text-text-tertiary truncate mt-0.5">
              {timeAgo}
            </p>
          </div>
        </div>

        {/* Overflow Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowActions((prev) => !prev)}
            className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="More poem actions"
            aria-expanded={showActions}
          >
            <MoreHorizontal size={17} />
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowActions(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border-default rounded-xl shadow-lg z-30 py-1.5 text-xs animate-scale-in">
                <Link
                  href={`/poem/${poem.id}/canvas`}
                  onClick={() => setShowActions(false)}
                  className="w-full px-3.5 py-2 text-left text-text-secondary hover:bg-surface-hover hover:text-text-primary flex items-center gap-2 transition-colors"
                >
                  <Sparkles size={14} />
                  <span>Poetry Canvas card</span>
                </Link>

                {reportSuccess ? (
                  <div className="px-3.5 py-2 text-text-primary">Report submitted</div>
                ) : (
                  <button
                    type="button"
                    onClick={handleReport}
                    disabled={reporting}
                    className="w-full px-3.5 py-2 text-left text-text-secondary hover:bg-surface-hover hover:text-text-primary flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Flag size={14} />
                    <span>{reporting ? "Submitting..." : "Report poem"}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <Link href={`/poem/${poem.id}`} className="group block pt-1">
        <h2 className="font-display italic text-2xl sm:text-3xl text-text-primary font-normal group-hover:underline transition-all tracking-tight break-words">
          {poem.title}
        </h2>
      </Link>

      {/* Content excerpt with literary leading */}
      <Link href={`/poem/${poem.id}`} className="group block">
        <div className="font-verse text-base sm:text-lg text-text-primary/90 font-light leading-relaxed whitespace-pre-line space-y-2 break-words">
          {preview}
          {lines.length > previewMaxLines && (
            <span className="text-text-tertiary block mt-1">...</span>
          )}
        </div>
      </Link>

      {/* Mood and Tags in neutral monochrome pills */}
      {(poem.mood || (poem.tags && poem.tags.length > 0)) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {poem.mood && (
            <span className="px-2.5 py-0.5 rounded-full bg-surface-secondary text-text-secondary border border-border-default text-[11px] font-medium tracking-wide">
              #{poem.mood.toLowerCase()}
            </span>
          )}
          {(poem.tags || []).slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full bg-surface-secondary text-text-secondary border border-border-default text-[11px] font-medium tracking-wide"
            >
              #{tag.replace(/^#/, "")}
            </span>
          ))}
        </div>
      )}

      {/* Micro-interactions Footer Toolbar */}
      <div className="flex items-center justify-between pt-4 border-t border-border-default text-text-tertiary select-none">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 min-h-[44px] py-1 transition-colors group cursor-pointer ${
              isLiked ? "text-text-primary font-semibold" : "hover:text-text-primary"
            }`}
            aria-label={isLiked ? "Unlike poem" : "Like poem"}
          >
            <Heart
              size={18}
              strokeWidth={1.8}
              fill={isLiked ? "currentColor" : "none"}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>

          {/* Comments */}
          <Link
            href={`/poem/${poem.id}#comments`}
            className="flex items-center gap-1.5 min-h-[44px] py-1 hover:text-text-primary transition-colors group"
            aria-label="View comments"
          >
            <MessageCircle size={18} strokeWidth={1.8} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">{commentCount}</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Save Bookmark */}
          <button
            type="button"
            onClick={handleSave}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors rounded-full hover:bg-surface-hover cursor-pointer ${
              isSaved ? "text-text-primary" : "hover:text-text-primary"
            }`}
            aria-label={isSaved ? "Unsave poem" : "Save poem"}
          >
            <Bookmark
              size={18}
              strokeWidth={1.8}
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-text-primary transition-colors rounded-full hover:bg-surface-hover cursor-pointer"
            aria-label="Share poem"
          >
            <Share2 size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </article>
  );
}

function getTimeAgo(dateString: string): string {
  if (!dateString) return "recently";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
