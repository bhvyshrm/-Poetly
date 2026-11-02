"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState<"trending" | "mostLoved" | "rising">("trending");
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPoems = useCallback(async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (activeTab === "rising") {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .limit(10);
        setPoems((data as PoemWithAuthor[]) || []);
      } else {
        const { data: likesData } = await supabase
          .from("likes")
          .select("poem_id")
          .gte("created_at", sevenDaysAgo.toISOString());

        const likeCounts: Record<string, number> = {};
        likesData?.forEach((l) => {
          likeCounts[l.poem_id] = (likeCounts[l.poem_id] || 0) + 1;
        });

        const sortedPoemIds = Object.entries(likeCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .map(([id]) => id);

        if (sortedPoemIds.length === 0) {
          const { data } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .eq("status", "published")
            .eq("visibility", "public")
            .order("published_at", { ascending: false })
            .limit(10);
          setPoems((data as PoemWithAuthor[]) || []);
        } else {
          const { data } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .in("id", sortedPoemIds);
          setPoems((data as PoemWithAuthor[]) || []);
        }
      }
    } catch (error) {
      console.error("Failed to load trending poems:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);

  const tabs = [
    { id: "trending" as const, label: "Trending" },
    { id: "mostLoved" as const, label: "Most Loved" },
    { id: "rising" as const, label: "Rising Writers" },
  ];

  return (
    <AppShell maxWidth="feed">
      <div className="animate-fade-in">
        <PageHeader
          title="Discover"
          description="Poems gaining attention across the community right now"
        />

        <div className="flex gap-1 mb-6 bg-surface-secondary border border-border-default rounded-full p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 min-h-[44px] text-xs md:text-sm font-medium rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-background font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 skeleton rounded-[var(--radius-md)]" />
              ))}
            </div>
          ) : poems.length > 0 ? (
            <div className="space-y-3">
              {poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">No poems found.</p>
              <p className="text-xs text-text-tertiary">Check back later for trending pieces.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
