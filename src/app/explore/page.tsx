"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles, BookOpen, ArrowRight, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, Prompt, Profile } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import PromptCard from "@/components/PromptCard";
import WriterCard from "@/components/WriterCard";
import AppShell from "@/components/layout/AppShell";
import TrendingTags from "@/components/home/TrendingTags";
import SuggestedWriters from "@/components/home/SuggestedWriters";
import WritingCTA from "@/components/home/WritingCTA";
import { PoemCardSkeleton } from "@/components/home/Skeletons";

const curatedAnthologies = [
  {
    title: "Solitude at 3 A.M.",
    tag: "solitude",
    category: "Featured",
    categoryColor: "text-text-secondary bg-surface-secondary border-border-default",
    hoverBorder: "hover:border-text-primary",
    stanzas: "42 stanzas",
    poets: "14 Poets",
    desc: "Late-night contemplation, quiet insomnia, and moonlit windows.",
  },
  {
    title: "Petrichor & Pavements",
    tag: "petrichor",
    category: "Pastoral",
    categoryColor: "text-text-secondary bg-surface-secondary border-border-default",
    hoverBorder: "hover:border-text-primary",
    stanzas: "29 stanzas",
    poets: "8 Poets",
    desc: "Modern pastoral verses blooming inside heavy metropolitan asphalt.",
  },
  {
    title: "Translations of Unspoken",
    tag: "haiku",
    category: "Haiku & Verse",
    categoryColor: "text-text-secondary bg-surface-secondary border-border-default",
    hoverBorder: "hover:border-text-primary",
    stanzas: "68 stanzas",
    poets: "21 Poets",
    desc: "Micro-haikus and translated fragments of unreturned glances.",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [writers, setWriters] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"poems" | "prompts" | "writers">("poems");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "poems") {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .limit(30);
        setPoems((data as PoemWithAuthor[]) || []);
      } else if (activeTab === "prompts") {
        const { data } = await supabase
          .from("prompts")
          .select("*")
          .order("created_at", { ascending: false });
        setPrompts((data as Prompt[]) || []);
      } else if (activeTab === "writers") {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(30);
        setWriters((data as Profile[]) || []);
      }
    } catch (error) {
      console.error("Failed to load explore content:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const rightRailContent = (
    <div className="space-y-6">
      <TrendingTags />
      <SuggestedWriters />
      <WritingCTA />
    </div>
  );

  return (
    <AppShell maxWidth="feed" rightRail={rightRailContent}>
      <div className="space-y-8">
        {/* Editorial Header Section */}
        <header className="space-y-1.5 pt-1">
          <p className="text-xs uppercase tracking-widest text-text-tertiary font-mono">
            Sanctuary of Stanzas
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-normal tracking-tight">
            Explore the Salon
          </h1>
          <p className="text-sm text-text-secondary font-light">
            Wander through stanzas, curated anthologies, and voices writing in quiet unison.
          </p>
        </header>

        {/* Expanded Literary Search & Filter Bar */}
        <section className="space-y-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative bg-surface border border-border-default rounded-[var(--radius-lg)] p-1.5 focus-within:border-text-primary transition-colors flex items-center gap-2">
              <Search size={18} className="text-text-tertiary ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search poems, stanzas, themes, or poets..."
                className="w-full bg-transparent border-0 font-sans text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-0 py-2 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 min-h-[36px] rounded-[var(--radius-md)] bg-surface-secondary hover:bg-surface-hover text-text-primary text-xs font-medium transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Filter Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("poems")}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] ${
                activeTab === "poems"
                  ? "bg-primary text-background font-semibold"
                  : "bg-surface-secondary text-text-secondary border border-border-default hover:text-text-primary"
              }`}
            >
              Poems
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("writers")}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] ${
                activeTab === "writers"
                  ? "bg-primary text-background font-semibold"
                  : "bg-surface-secondary text-text-secondary border border-border-default hover:text-text-primary"
              }`}
            >
              Writers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("prompts")}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px] ${
                activeTab === "prompts"
                  ? "bg-primary text-background font-semibold"
                  : "bg-surface-secondary text-text-secondary border border-border-default hover:text-text-primary"
              }`}
            >
              Prompts
            </button>
            <Link
              href="/collections"
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface-secondary text-text-secondary border border-border-default hover:text-text-primary transition-colors flex items-center gap-1.5 min-h-[36px]"
            >
              <BookOpen size={13} className="text-text-tertiary" />
              <span>Collections</span>
            </Link>
          </div>
        </section>

        {/* Featured Spotlight: Curated Anthologies */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-text-primary" />
              <h2 className="font-display text-xl text-text-primary font-medium">
                Curated Anthologies
              </h2>
            </div>
            <Link
              href="/collections"
              className="text-xs text-text-secondary hover:text-text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <span>Browse all</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {curatedAnthologies.map((item) => (
              <Link
                key={item.title}
                href={`/search?tag=${item.tag}`}
                className={`bg-surface border border-border-default rounded-[var(--radius-lg)] p-4 sm:p-5 flex flex-col justify-between ${item.hoverBorder} transition-colors group`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${item.categoryColor}`}>
                      {item.category}
                    </span>
                    <span>{item.stanzas}</span>
                  </div>
                  <h3 className="font-display text-lg text-text-primary font-normal leading-snug group-hover:underline">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary font-light line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border-default mt-4 text-xs text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Users size={13} />
                    <span>{item.poets}</span>
                  </div>
                  <ArrowRight size={14} className="text-text-tertiary group-hover:text-text-primary group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Discovery Filter Tabs */}
        <section className="border-b border-border-default flex items-center gap-6 sm:gap-8 text-sm overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("poems")}
            className={`pb-3 relative font-medium transition-colors whitespace-nowrap cursor-pointer min-h-[44px] flex items-center ${
              activeTab === "poems" ? "text-text-primary font-semibold" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            Featured Poems
            {activeTab === "poems" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("writers")}
            className={`pb-3 relative font-medium transition-colors whitespace-nowrap cursor-pointer min-h-[44px] flex items-center ${
              activeTab === "writers" ? "text-text-primary font-semibold" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            Emerging Voices
            {activeTab === "writers" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prompts")}
            className={`pb-3 relative font-medium transition-colors whitespace-nowrap cursor-pointer min-h-[44px] flex items-center ${
              activeTab === "prompts" ? "text-text-primary font-semibold" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            Active Prompts
            {activeTab === "prompts" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </section>

        {/* Discovery Content Feed */}
        <section className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              <PoemCardSkeleton />
              <PoemCardSkeleton />
            </div>
          ) : activeTab === "poems" ? (
            poems.length > 0 ? (
              <div className="space-y-6">
                {poems.map((poem) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 px-6 bg-surface-secondary rounded-[var(--radius-lg)] border border-border-default">
                <p className="font-verse text-lg text-text-tertiary italic mb-2">
                  No poems published in the salon yet.
                </p>
                <p className="text-xs text-text-secondary mb-5">
                  Be the first to share your words with the community.
                </p>
                <Link
                  href="/write"
                  className="inline-flex items-center px-4 py-2 min-h-[44px] text-xs font-medium text-background bg-primary rounded-full hover:opacity-90 transition-opacity"
                >
                  Write a poem →
                </Link>
              </div>
            )
          ) : activeTab === "prompts" ? (
            prompts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {prompts.map((prompt) => (
                  <Link key={prompt.id} href={`/prompts/${prompt.id}`} className="block h-full">
                    <PromptCard prompt={prompt} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 px-6 bg-surface-secondary rounded-[var(--radius-lg)] border border-border-default">
                <p className="font-verse text-lg text-text-tertiary italic mb-2">
                  No active prompts right now.
                </p>
                <p className="text-xs text-text-secondary">
                  Writing prompts will appear here soon.
                </p>
              </div>
            )
          ) : writers.length > 0 ? (
            <div className="bg-surface rounded-[var(--radius-lg)] border border-border-default p-3 sm:p-4 divide-y divide-border-default space-y-1">
              {writers.map((writer) => (
                <WriterCard key={writer.id} writer={writer} variant="row" />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 px-6 bg-surface-secondary rounded-[var(--radius-lg)] border border-border-default">
              <p className="font-verse text-lg text-text-tertiary italic mb-2">
                No writers found yet.
              </p>
              <p className="text-xs text-text-secondary">
                Join Poetly and be one of the founding voices.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

