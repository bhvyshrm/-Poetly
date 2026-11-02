"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { PoemWithAuthor } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import PoemCard from "@/components/PoemCard";

// Desktop & shared components
import PoemComposer from "./PoemComposer";
import DailyPoetlyMoment from "./DailyPoetlyMoment";
import FeedTabs, { FeedTabType } from "./FeedTabs";
import ActivityPanel from "./ActivityPanel";
import SuggestedWriters from "./SuggestedWriters";
import WritingCTA from "./WritingCTA";

// States & Skeletons
import { PoemCardSkeleton } from "./Skeletons";
import { EmptyFeedState, ErrorFeedState } from "./States";

export default function HomeLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTabType>("for-you");
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "following") {
        if (!user) {
          setPoems([]);
          setLoading(false);
          return;
        }

        const { data: followRows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        const followingIds = followRows?.map((f) => f.following_id) || [];
        if (followingIds.length === 0) {
          setPoems([]);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .in("author_id", followingIds)
          .eq("status", "published")
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .limit(20);

        if (fetchError) throw fetchError;
        setPoems((data as PoemWithAuthor[]) || []);
      } else if (activeTab === "trending") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: likesData } = await supabase
          .from("likes")
          .select("poem_id")
          .gte("created_at", sevenDaysAgo.toISOString());

        const likeCounts: Record<string, number> = {};
        likesData?.forEach((l) => {
          likeCounts[l.poem_id] = (likeCounts[l.poem_id] || 0) + 1;
        });

        const sortedIds = Object.entries(likeCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .map(([id]) => id);

        if (sortedIds.length > 0) {
          const { data, error: fetchError } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .in("id", sortedIds)
            .eq("status", "published")
            .eq("visibility", "public");

          if (fetchError) throw fetchError;
          setPoems((data as PoemWithAuthor[]) || []);
        } else {
          // Fallback to recent poems if no recent likes
          const { data, error: fetchError } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .eq("status", "published")
            .eq("visibility", "public")
            .order("created_at", { ascending: false })
            .limit(20);

          if (fetchError) throw fetchError;
          setPoems((data as PoemWithAuthor[]) || []);
        }
      } else if (activeTab === "new-voices") {
        // "new-voices": poems written by the newest active community writers
        const { data: newWriters } = await supabase
          .from("profiles")
          .select("id")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(20);

        const writerIds = newWriters?.map((w) => w.id) || [];
        if (writerIds.length > 0) {
          const { data, error: fetchError } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .in("author_id", writerIds)
            .eq("status", "published")
            .eq("visibility", "public")
            .order("created_at", { ascending: false })
            .limit(20);

          if (fetchError) throw fetchError;
          setPoems((data as PoemWithAuthor[]) || []);
        } else {
          setPoems([]);
        }
      } else {
        // "for-you": algorithmic community discovery
        const { data, error: fetchError } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .limit(20);

        if (fetchError) throw fetchError;
        setPoems((data as PoemWithAuthor[]) || []);
      }
    } catch (err) {
      console.error("Failed to load poems:", err);
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [activeTab, user]);

  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);

  const rightRailContent = (
    <div className="space-y-6">
      <ActivityPanel />
      <SuggestedWriters />
      <WritingCTA />
    </div>
  );

  return (
    <AppShell maxWidth="feed" rightRail={rightRailContent}>
      <div className="space-y-6">
        {/* Sanctuary Hours Greeting & Daily Prompt */}
        <DailyPoetlyMoment />

        {/* Thought / Verse Quick Composer */}
        <PoemComposer />

        {/* Feed Filter Navigation Tabs */}
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Feed List */}
        <section className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              <PoemCardSkeleton />
              <PoemCardSkeleton />
              <PoemCardSkeleton />
            </div>
          ) : error ? (
            <ErrorFeedState onRetry={fetchPoems} />
          ) : poems.length > 0 ? (
            <div className="space-y-6">
              {poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          ) : activeTab === "following" ? (
            <div className="text-center py-12 px-6 glass-surface rounded-2xl border border-border-subtle/40">
              <p className="font-verse text-lg text-text-tertiary italic mb-2">
                {!user
                  ? "Sign in to see your following feed."
                  : "You haven't followed any writers yet."}
              </p>
              <p className="text-xs text-text-secondary mb-5">
                {!user
                  ? "Follow your favorite poets to see their poems here."
                  : "Discover poets in the salon and follow their work."}
              </p>
              <Link
                href={!user ? "/login" : "/writers"}
                className="inline-flex items-center px-4 py-2 text-xs font-medium text-on-primary bg-primary rounded-full hover:opacity-90 transition-opacity"
              >
                {!user ? "Sign in →" : "Discover writers →"}
              </Link>
            </div>
          ) : (
            <EmptyFeedState />
          )}
        </section>
      </div>
    </AppShell>
  );
}
