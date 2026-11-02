"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const trendingThemes = [
  { tag: "solitude", count: "4.2k verses" },
  { tag: "midnightink", count: "1.8k verses" },
  { tag: "haiku", count: "3.1k verses" },
  { tag: "petrichor", count: "950 verses" },
];

export default function WritingCTA() {
  return (
    <div className="space-y-6">
      {/* Trending Stanzas & Themes */}
      <section className="bg-surface border border-border-default rounded-[var(--radius-lg)] p-5 space-y-3.5">
        <h3 className="font-display text-lg text-text-primary font-medium tracking-tight">
          Trending Themes
        </h3>
        <div className="space-y-1.5">
          {trendingThemes.map((item) => (
            <Link
              key={item.tag}
              href={`/explore?tag=${item.tag}`}
              className="flex items-center justify-between p-2 rounded-[var(--radius-md)] hover:bg-surface-hover transition-colors group"
            >
              <div>
                <p className="font-medium text-xs text-text-primary group-hover:underline transition-colors">
                  #{item.tag}
                </p>
                <p className="text-[11px] text-text-tertiary">{item.count}</p>
              </div>
              <ArrowUpRight
                size={14}
                className="text-text-tertiary group-hover:text-text-primary transition-colors"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Micro-links */}
      <div className="px-2 text-[11px] text-text-tertiary space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link href="/about" className="hover:text-text-primary transition-colors">
            Manifesto
          </Link>
          <Link href="/explore" className="hover:text-text-primary transition-colors">
            Anthology
          </Link>
          <Link href="/collections" className="hover:text-text-primary transition-colors">
            Collections
          </Link>
          <Link href="/privacy" className="hover:text-text-primary transition-colors">
            Privacy
          </Link>
        </div>
        <p className="text-[10px] text-text-tertiary/80 font-verse italic">
          © {new Date().getFullYear()} Poetly Salon. Crafted for quiet thoughts.
        </p>
      </div>
    </div>
  );
}

