"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { WriterWithStats } from "@/lib/types";
import WriterCard from "@/components/WriterCard";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

export default function WritersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [writers, setWriters] = useState<WriterWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWriters = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(30);

      if (searchQuery.trim()) {
        query = query.or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
      }

      const { data: profiles } = await query;

      if (profiles) {
        let followingSet = new Set<string>();
        if (user) {
          const { data: userFollows } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id);
          if (userFollows) {
            followingSet = new Set(userFollows.map((f) => f.following_id));
          }
        }

        const writersWithStats: WriterWithStats[] = await Promise.all(
          profiles.map(async (p) => {
            const [{ count: followers }, { count: following }, { count: poems }] = await Promise.all([
              supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", p.id),
              supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", p.id),
              supabase.from("poems").select("*", { count: "exact", head: true }).eq("author_id", p.id).eq("status", "published"),
            ]);
            return {
              ...p,
              followerCount: followers || 0,
              followingCount: following || 0,
              poemCount: poems || 0,
              isFollowed: followingSet.has(p.id),
            };
          })
        );
        setWriters(writersWithStats);
      }
    } catch (error) {
      console.error("Failed to load writers:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, user]);

  const handleToggleFollow = async (writerId: string, currentlyFollowed: boolean) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setWriters((prev) =>
      prev.map((w) =>
        w.id === writerId
          ? {
              ...w,
              isFollowed: !currentlyFollowed,
              followerCount: currentlyFollowed ? Math.max(0, w.followerCount - 1) : w.followerCount + 1,
            }
          : w
      )
    );

    try {
      if (currentlyFollowed) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", writerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: writerId });
        if (error) throw error;

        await supabase.from("notifications").insert({
          recipient_id: writerId,
          actor_id: user.id,
          type: "follow",
        });
      }
    } catch {
      // Revert on error
      setWriters((prev) =>
        prev.map((w) =>
          w.id === writerId
            ? {
                ...w,
                isFollowed: currentlyFollowed,
                followerCount: currentlyFollowed ? w.followerCount + 1 : Math.max(0, w.followerCount - 1),
              }
            : w
        )
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchWriters, 300);
    return () => clearTimeout(timer);
  }, [fetchWriters]);

  return (
    <AppShell maxWidth="wide">
      <div className="animate-fade-in">
        <PageHeader
          title="Writers"
          description="Discover poets and voices to follow across Poetly"
        />

        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search writers by name or handle..."
            className="w-full bg-surface border border-border-default rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-text-primary transition-colors"
          />
        </div>

        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 skeleton rounded-[var(--radius-md)]" />
              ))}
            </div>
          ) : writers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {writers.map((writer) => (
                <WriterCard
                  key={writer.id}
                  writer={writer}
                  showFollow={Boolean(user && user.id !== writer.id)}
                  isFollowed={writer.isFollowed}
                  onFollowToggle={() => handleToggleFollow(writer.id, writer.isFollowed)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-poem text-xl text-text-tertiary italic mb-2">
                {searchQuery ? "No writers found." : "No writers yet."}
              </p>
              <p className="text-xs text-text-tertiary">
                {searchQuery ? "Try a different search term." : "Be the first to join."}
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
