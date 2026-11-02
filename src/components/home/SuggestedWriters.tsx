"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Profile } from "@/lib/types";

interface SuggestedWriter extends Profile {
  isFollowed: boolean;
}

export default function SuggestedWriters() {
  const router = useRouter();
  const { user } = useAuth();
  const [writers, setWriters] = useState<SuggestedWriter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggested = useCallback(async () => {
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);

      if (user) {
        query = query.neq("id", user.id);
      }

      const { data: profiles, error } = await query;
      if (error || !profiles) {
        setWriters([]);
        setLoading(false);
        return;
      }

      let followedIds = new Set<string>();
      if (user) {
        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);
        if (follows) {
          followedIds = new Set(follows.map((f) => f.following_id));
        }
      }

      const formatted: SuggestedWriter[] = profiles.slice(0, 4).map((p) => ({
        ...p,
        isFollowed: followedIds.has(p.id),
      }));

      setWriters(formatted);
    } catch {
      setWriters([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSuggested();
  }, [fetchSuggested]);

  const toggleFollow = async (writerId: string, currentlyFollowed: boolean) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setWriters((prev) =>
      prev.map((w) => (w.id === writerId ? { ...w, isFollowed: !currentlyFollowed } : w))
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
        prev.map((w) => (w.id === writerId ? { ...w, isFollowed: currentlyFollowed } : w))
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border-default rounded-[var(--radius-lg)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-28 h-5 skeleton rounded" />
          <div className="w-12 h-3 skeleton rounded" />
        </div>
        <div className="space-y-3.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full skeleton shrink-0" />
                <div className="space-y-1">
                  <div className="w-24 h-3 skeleton rounded" />
                  <div className="w-16 h-2 skeleton rounded" />
                </div>
              </div>
              <div className="w-16 h-7 skeleton rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (writers.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface border border-border-default rounded-[var(--radius-lg)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-text-primary font-medium tracking-tight">
          Suggested Poets
        </h3>
        <Link
          href="/writers"
          className="text-xs text-text-secondary hover:text-text-primary hover:underline font-medium"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3.5">
        {writers.map((writer) => (
          <div key={writer.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href={`/profile/${writer.username}`}
                className="shrink-0 focus-visible:outline-none"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border border-border-default shrink-0 bg-surface-secondary flex items-center justify-center">
                  {writer.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={writer.profile_image}
                      alt={writer.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-xs text-text-secondary">
                      {writer.display_name?.[0]?.toUpperCase() || "P"}
                    </span>
                  )}
                </div>
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${writer.username}`}
                  className="font-medium text-xs text-text-primary hover:underline transition-colors block truncate"
                >
                  {writer.display_name}
                </Link>
                <p className="text-[11px] text-text-tertiary truncate">
                  {writer.bio ? writer.bio : `@${writer.username}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleFollow(writer.id, writer.isFollowed)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors min-h-[32px] ${
                writer.isFollowed
                  ? "border border-border-default text-text-secondary bg-surface-secondary hover:bg-surface-hover hover:text-text-primary"
                  : "bg-primary text-background hover:opacity-90"
              }`}
            >
              {writer.isFollowed ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

