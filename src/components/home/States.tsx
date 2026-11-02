"use client";

import Link from "next/link";
import { Compass, PenLine, RefreshCw } from "lucide-react";

export function EmptyFeedState() {
  return (
    <div className="glass-surface rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 border border-border-default">
      <div className="w-12 h-12 rounded-full bg-surface-secondary border border-border-default flex items-center justify-center mx-auto text-text-primary">
        <PenLine size={20} />
      </div>
      <h3 className="font-display text-2xl text-text-primary font-normal">
        Your feed is quiet.
      </h3>
      <p className="font-verse text-base text-text-tertiary italic max-w-sm mx-auto">
        Discover new voices or write a poem from the heart.
      </p>
      <div className="flex items-center justify-center gap-3 pt-3">
        <Link
          href="/explore"
          className="px-4 py-2 rounded-full border border-border-default hover:bg-surface-hover text-xs font-medium text-text-primary flex items-center gap-1.5 transition-colors"
        >
          <Compass size={14} />
          <span>Explore</span>
        </Link>
        <Link
          href="/write"
          className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
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
    <div className="glass-surface rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 border border-border-default">
      <div className="w-12 h-12 rounded-full bg-surface-secondary border border-border-default flex items-center justify-center mx-auto text-text-primary">
        <RefreshCw size={20} />
      </div>
      <h3 className="font-display text-2xl text-text-primary font-normal">
        Something went quiet.
      </h3>
      <p className="text-xs text-text-tertiary max-w-sm mx-auto">
        We couldn&apos;t load the feed. Please check your connection.
      </p>
      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-full border border-border-default hover:bg-surface-hover text-xs font-medium text-text-primary inline-flex items-center gap-2 transition-colors cursor-pointer"
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
