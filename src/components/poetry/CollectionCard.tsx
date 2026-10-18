"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Collection } from "@/lib/types";

export interface CollectionCardProps {
  collection: Collection;
  poemCount?: number;
  className?: string;
}

export default function CollectionCard({
  collection,
  poemCount,
  className = "",
}: CollectionCardProps) {
  const count =
    poemCount !== undefined
      ? poemCount
      : ((collection as unknown as { collection_poems?: unknown[] }).collection_poems?.length) || 0;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className={`glass-surface rounded-2xl p-5 sm:p-6 border border-border-subtle/40 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group h-full hover:-translate-y-0.5 specular-top-border ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-secondary px-2 py-0.5 rounded-full bg-secondary/15 border border-secondary/30">
            Salon Binder
          </span>
          <span className="text-xs text-text-tertiary font-mono flex items-center gap-1">
            <BookOpen size={12} />
            <span>
              {count} {count === 1 ? "poem" : "poems"}
            </span>
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl text-text-primary group-hover:text-primary transition-colors font-normal leading-snug">
          {collection.title}
        </h3>

        {collection.description && (
          <p className="font-verse italic text-xs sm:text-sm text-text-secondary line-clamp-2 font-light leading-relaxed">
            &ldquo;{collection.description}&rdquo;
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-border-subtle/30 flex items-center justify-between text-xs text-text-tertiary mt-4">
        <span className="font-mono text-[11px]">
          Bound {new Date(collection.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
        </span>
        <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Open Binder</span>
          <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}

