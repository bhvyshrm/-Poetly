"use client";

import Link from "next/link";
import { Compass, PenLine, RefreshCw } from "lucide-react";

export function EmptyFeedState() {
  return (
    <div className="glass-surface rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto space-y-4 specular-top-border">
      <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
        <PenLine size={24} />
      </div>
      <h3 className="font-display text-2xl text-text-primary font-light">
        Your Poetly is quiet.
      </h3>
      <p className="font-verse text-base text-text-tertiary italic max-w-sm mx-auto">
        Discover new voices in the salon or pen something from the heart.
      </p>
      <div className="flex items-center justify-center gap-3 pt-3">
        <Link
          href="/explore"
          className="px-4 py-2 rounded-full glass-pill text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
        >
          <Compass size={14} className="text-secondary" />
          <span>Explore</span>
        </Link>
        <Link
          href="/write"
          className="px-4 py-2 rounded-full bg-gradient-to-r from-primary-container to-secondary text-white text-xs font-semibold flex items-center gap-1.5 glowing-btn-aura hover:opacity-95 transition-all"
        >
          <PenLine size={14} />
          <span>Write Poem</span>
        </Link>
      </div>
    </div>
  );
}

export function ErrorFeedState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="glass-surface rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto space-y-4 border border-error/30">
      <div className="w-14 h-14 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mx-auto text-error">
        <RefreshCw size={24} />
      </div>
      <h3 className="font-display text-2xl text-text-primary font-light">
        Something went quiet.
      </h3>
      <p className="text-xs text-text-tertiary max-w-sm mx-auto">
        We couldn&apos;t load the salon feed. Please check your connection.
      </p>
      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-full glass-pill hover:border-primary/40 text-xs font-semibold text-text-primary inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Try again</span>
          </button>
        </div>
      )}
    </div>
  );
}


export function EmptyActivityState() {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-text-tertiary">
        No recent activity.
      </p>
    </div>
  );
}

export function EmptyWritersState() {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-text-tertiary">
        No suggestions yet.
      </p>
      <Link
        href="/writers"
        className="text-sm text-brand hover:text-brand-hover transition-colors mt-2 inline-block"
      >
        Discover writers
      </Link>
    </div>
  );
}
