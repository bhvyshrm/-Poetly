"use client";

import Link from "next/link";

const trendingTags = [
  { tag: "love", count: 1240 },
  { tag: "night", count: 890 },
  { tag: "healing", count: 756 },
  { tag: "nature", count: 623 },
  { tag: "life", count: 589 },
  { tag: "melancholy", count: 445 },
  { tag: "hope", count: 398 },
  { tag: "friendship", count: 312 },
];

export default function TrendingTags() {
  return (
    <section className="bg-surface rounded-[var(--radius-lg)] border border-border-default p-5 space-y-3.5">
      <h3 className="font-display text-lg text-text-primary font-medium tracking-tight">
        Trending Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {trendingTags.map((item) => (
          <Link
            key={item.tag}
            href={`/search?tag=${item.tag}`}
            className="px-3 py-1.5 rounded-full bg-surface-secondary border border-border-default text-xs font-medium text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors min-h-[32px] inline-flex items-center"
          >
            #{item.tag}
          </Link>
        ))}
      </div>
    </section>
  );
}

