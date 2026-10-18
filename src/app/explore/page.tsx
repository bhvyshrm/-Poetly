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
    categoryColor: "text-secondary bg-secondary/15 border-secondary/30",
    hoverBorder: "hover:border-primary/40",
    stanzas: "42 stanzas",
    poets: "14 Poets",
    desc: "Late-night contemplation, quiet insomnia, and moonlit windows.",
  },
  {
    title: "Petrichor & Pavements",
    tag: "petrichor",
    category: "Pastoral",
    categoryColor: "text-tertiary bg-tertiary/15 border-tertiary/30",
    hoverBorder: "hover:border-tertiary/40",
    stanzas: "29 stanzas",
    poets: "8 Poets",
    desc: "Modern pastoral verses blooming inside heavy metropolitan asphalt.",
  },
  {
    title: "Translations of Unspoken",
    tag: "haiku",
    category: "Haiku & Verse",
    categoryColor: "text-primary bg-primary/15 border-primary/30",
    hoverBorder: "hover:border-primary/40",
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
          <div className="flex items-center gap-1.5 text-primary text-xs font-medium tracking-wide">
            <Sparkles size={14} className="text-primary" />
            <span>Curated Sanctuary of Stanzas</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-light tracking-tight">
            Explore the Salon
          </h1>
          <p className="text-sm text-text-secondary font-light">
            Wander through stanzas, curated anthologies, and voices writing in quiet unison.
          </p>
        </header>

        {/* Expanded Literary Search & Filter Bar */}
        <section className="space-y-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative glass-surface rounded-2xl p-1.5 focus-within:border-primary/50 transition-all shadow-md flex items-center gap-2">
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
                className="px-4 py-1.5 rounded-xl bg-surface-secondary/80 hover:bg-surface-secondary text-text-primary text-xs font-semibold transition-all shrink-0"
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
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "poems"
                  ? "bg-primary/15 border border-primary/40 text-primary shadow-sm"
                  : "glass-pill text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "poems" ? "bg-primary" : "bg-text-tertiary"}`} />
              Poems
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("writers")}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "writers"
                  ? "bg-primary/15 border border-primary/40 text-primary shadow-sm"
                  : "glass-pill text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "writers" ? "bg-primary" : "bg-text-tertiary"}`} />
              Writers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("prompts")}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "prompts"
                  ? "bg-primary/15 border border-primary/40 text-primary shadow-sm"
                  : "glass-pill text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "prompts" ? "bg-primary" : "bg-text-tertiary"}`} />
              Prompts
            </button>
            <Link
              href="/collections"
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold glass-pill text-text-secondary hover:text-text-primary transition-all flex items-center gap-1"
            >
              <BookOpen size={13} className="text-secondary" />
              <span>Collections</span>
            </Link>
          </div>
        </section>

        {/* Featured Spotlight: Curated Anthologies (Glass Bento) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <h2 className="font-display text-xl text-text-primary font-medium">
                Curated Anthologies
              </h2>
            </div>
            <Link
              href="/collections"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
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
                className={`glass-surface rounded-2xl p-4 sm:p-5 flex flex-col justify-between ${item.hoverBorder} hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
                    <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${item.categoryColor}`}>
                      {item.category}
                    </span>
                    <span>{item.stanzas}</span>
                  </div>
                  <h3 className="font-display text-lg text-text-primary font-normal leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary font-light line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border-subtle/30 mt-4 text-xs text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Users size={13} />
                    <span>{item.poets}</span>
                  </div>
                  <ArrowRight size={14} className="text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Discovery Filter Tabs */}
        <section className="border-b border-border-subtle/40 flex items-center gap-6 sm:gap-8 text-sm overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("poems")}
            className={`pb-3 relative font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "poems" ? "text-primary" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            Featured Poems
            {activeTab === "poems" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary glow-orchid rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("writers")}
            className={`pb-3 relative font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "writers" ? "text-primary" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            Emerging Voices
            {activeTab === "writers" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary glow-orchid rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prompts")}
            className={`pb-3 relative font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "prompts" ? "text-primary" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            Active Prompts
            {activeTab === "prompts" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary glow-orchid rounded-full" />
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
              <div className="text-center py-14 px-6 glass-surface rounded-2xl border border-border-subtle/40">
                <p className="font-verse text-lg text-text-tertiary italic mb-2">
                  No poems published in the salon yet.
                </p>
                <p className="text-xs text-text-secondary mb-5">
                  Be the first to share your words with the community.
                </p>
                <Link
                  href="/write"
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-container to-secondary rounded-full hover:opacity-95 shadow-md glowing-btn-aura"
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
              <div className="text-center py-14 px-6 glass-surface rounded-2xl border border-border-subtle/40">
                <p className="font-verse text-lg text-text-tertiary italic mb-2">
                  No active prompts right now.
                </p>
                <p className="text-xs text-text-secondary">
                  Writing prompts will appear here soon.
                </p>
              </div>
            )
          ) : writers.length > 0 ? (
            <div className="glass-surface rounded-2xl p-3 sm:p-4 divide-y divide-border-subtle/30 space-y-1">
              {writers.map((writer) => (
                <WriterCard key={writer.id} writer={writer} variant="row" />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 px-6 glass-surface rounded-2xl border border-border-subtle/40">
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

