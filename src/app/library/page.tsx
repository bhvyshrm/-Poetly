"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Bookmark, Sparkles, BookOpen, ArrowRight, Search } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/layout/AppShell";
import SuggestedWriters from "@/components/home/SuggestedWriters";

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedPoems, setSavedPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSaved = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: savesData } = await supabase
        .from("saves")
        .select("poem_id")
        .eq("user_id", user.id);

      if (savesData && savesData.length > 0) {
        const poemIds = savesData.map((s) => s.poem_id);
        const { data: poemsData } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .in("id", poemIds)
          .eq("status", "published");
        setSavedPoems((poemsData as PoemWithAuthor[]) || []);
      }
    } catch {
      // Silent fail
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchSaved();
    }
  }, [authLoading, fetchSaved]);

  const filteredPoems = useMemo(() => {
    if (!searchQuery.trim()) return savedPoems;
    const q = searchQuery.toLowerCase();
    return savedPoems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.profiles?.display_name?.toLowerCase().includes(q) ||
        p.profiles?.username?.toLowerCase().includes(q)
    );
  }, [savedPoems, searchQuery]);

  const rightRailContent = (
    <div className="space-y-6">
      {/* Sanctuary Bookmarks Card */}
      <section className="bg-surface rounded-[var(--radius-lg)] p-5 border border-border-default space-y-4">
        <div className="flex items-center gap-2 text-text-primary font-mono text-xs font-medium">
          <Bookmark size={14} className="text-text-primary fill-text-primary" />
          <span>Sanctuary Keepsakes</span>
        </div>
        <h4 className="font-display text-lg text-text-primary font-normal">
          Preserved Stanzas
        </h4>
        <div className="space-y-3 pt-1 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-default">
            <span className="text-text-tertiary">Verses Bookmarked</span>
            <span className="font-mono font-medium text-text-primary">{savedPoems.length}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-border-default">
            <span className="text-text-tertiary">Collections Access</span>
            <Link
              href="/collections"
              className="text-text-primary font-mono text-xs hover:underline flex items-center gap-1"
            >
              <span>View Bindings</span>
              <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Atmosphere</span>
            <span className="font-mono text-text-secondary">Monochrome</span>
          </div>
        </div>
      </section>

      {/* Suggested Poets */}
      <SuggestedWriters />
    </div>
  );

  return (
    <AppShell maxWidth="wide" rightRail={rightRailContent}>
      <div className="space-y-6">
        {/* Header */}
        <section className="space-y-2 pt-1">
          <p className="text-xs uppercase tracking-widest text-text-tertiary font-mono">
            Sanctuary Reliquary / Saved Stanzas
          </p>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-normal tracking-tight">
                Saved Verses &amp; Marginalia
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary font-light mt-1">
                Words gathered along your path, preserved for quiet contemplation.
              </p>
            </div>

            {savedPoems.length > 3 && (
              <div className="relative sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Filter saved poems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface border border-border-default rounded-full text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-text-primary transition-colors font-sans"
                />
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        {authLoading || loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-surface rounded-[var(--radius-lg)] border border-border-default skeleton" />
            ))}
          </div>
        ) : !user ? (
          <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-default space-y-4">
            <p className="font-display text-2xl text-text-primary font-normal">
              Sign In to Access Your Saved Verses
            </p>
            <p className="font-verse italic text-text-tertiary max-w-md mx-auto text-sm">
              Bookmark poetry you resonate with across Poetly to revisit them in your personal sanctuary anytime.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-xs font-medium text-background bg-primary rounded-full hover:opacity-90 transition-opacity"
              >
                <span>Sign In to Poetly</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : filteredPoems.length > 0 ? (
          <div className="space-y-4">
            {filteredPoems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : savedPoems.length > 0 ? (
          <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-default space-y-3">
            <p className="font-display text-xl text-text-primary">No Matching Verses</p>
            <p className="font-verse italic text-xs sm:text-sm text-text-tertiary max-w-sm mx-auto">
              No saved poems matched &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-default space-y-4">
            <div className="w-12 h-12 rounded-full bg-surface border border-border-default flex items-center justify-center mx-auto text-text-primary">
              <BookOpen size={22} />
            </div>
            <p className="font-display text-2xl text-text-primary font-normal">
              Your Sanctuary Shelf is Empty
            </p>
            <p className="font-verse italic text-text-tertiary max-w-md mx-auto text-sm">
              When a stanza stirs something within you, tap the bookmark icon to bind it here.
            </p>
            <div className="pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-xs font-medium text-background bg-primary rounded-full hover:opacity-90 transition-opacity"
              >
                <span>Explore the Salon</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
