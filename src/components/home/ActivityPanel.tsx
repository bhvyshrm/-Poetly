"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { NotificationWithActor } from "@/lib/types";

interface RecentPoemActivity {
  id: string;
  type: "new_poem";
  created_at: string;
  title: string;
  profiles: {
    username: string;
    display_name: string;
    profile_image: string | null;
  };
}

function getTimeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [recentPoems, setRecentPoems] = useState<RecentPoemActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    try {
      if (user) {
        const { data: userNotifications } = await supabase
          .from("notifications")
          .select("*, profiles!actor_id(*)")
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4);

        if (userNotifications && userNotifications.length > 0) {
          setNotifications(userNotifications as NotificationWithActor[]);
          setLoading(false);
          return;
        }
      }

      // If no notifications or user not logged in, fetch recently published poems
      const { data: poemsData } = await supabase
        .from("poems")
        .select("id, title, created_at, profiles!inner(username, display_name, profile_image)")
        .eq("status", "published")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(4);

      if (poemsData) {
        setRecentPoems(
          poemsData.map((p) => ({
            id: p.id,
            type: "new_poem" as const,
            created_at: p.created_at,
            title: p.title,
            profiles: p.profiles as unknown as RecentPoemActivity["profiles"],
          }))
        );
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const getActionText = (n: NotificationWithActor) => {
    switch (n.type) {
      case "like": return "liked your poem";
      case "comment": return "commented on your poem";
      case "follow": return "started following you";
      case "response": return "responded with a poem";
      case "mention": return "mentioned you";
      default: return "interacted with you";
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Salon Acoustic Banner from Stitch */}
      <section className="glass-surface rounded-2xl p-5 relative overflow-hidden border border-secondary/30">
        <div className="flex items-center gap-2 text-secondary mb-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-secondary">
            Community Salon
          </span>
        </div>
        <h4 className="font-display text-lg text-text-primary font-light leading-snug">
          Midnight Acoustics: Verse &amp; Cello
        </h4>
        <p className="text-xs text-text-tertiary mt-1.5 line-clamp-2">
          Live reading session hosted in the salon. Bring a draft or quiet ears.
        </p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle/40">
          <div className="flex -space-x-2 overflow-hidden">
            <span className="inline-flex h-6 w-6 rounded-full ring-2 ring-background bg-primary/40 items-center justify-center text-[10px] text-white">LV</span>
            <span className="inline-flex h-6 w-6 rounded-full ring-2 ring-background bg-tertiary/40 items-center justify-center text-[10px] text-white">MK</span>
            <span className="inline-flex h-6 w-6 rounded-full ring-2 ring-background bg-secondary/40 items-center justify-center text-[10px] text-white">+32</span>
          </div>
          <Link
            href="/explore"
            className="px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-xs font-semibold hover:bg-secondary/25 transition-colors"
          >
            Join Salon
          </Link>
        </div>
      </section>

      {/* Community Activity Card */}
      <section className="glass-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-text-primary font-semibold tracking-tight">
            Recent Echoes
          </h3>
          {user && notifications.length > 0 && (
            <Link
              href="/notifications"
              className="text-xs text-primary hover:underline font-medium"
            >
              See all
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full skeleton shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="w-24 h-3 skeleton rounded" />
                  <div className="w-16 h-2 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-center gap-2.5 text-xs">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-border-subtle/40 bg-surface-secondary flex items-center justify-center">
                  {n.profiles?.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.profiles.profile_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-xs text-text-secondary">{n.profiles?.display_name?.[0] || "?"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text-secondary truncate">
                    <Link href={`/profile/${n.profiles?.username}`} className="font-medium text-text-primary hover:text-primary">
                      {n.profiles?.display_name || "Someone"}
                    </Link>{" "}
                    {getActionText(n)}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">{getTimeAgo(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : recentPoems.length > 0 ? (
          <div className="space-y-3">
            {recentPoems.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 text-xs">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-border-subtle/40 bg-surface-secondary flex items-center justify-center">
                  {p.profiles?.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.profiles.profile_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-xs text-text-secondary">{p.profiles?.display_name?.[0] || "P"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text-secondary truncate">
                    <Link href={`/profile/${p.profiles?.username}`} className="font-medium text-text-primary hover:text-primary">
                      {p.profiles?.display_name}
                    </Link>{" "}
                    penned{" "}
                    <Link href={`/poem/${p.id}`} className="hover:text-primary font-verse italic text-text-primary font-medium">
                      &ldquo;{p.title}&rdquo;
                    </Link>
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">{getTimeAgo(p.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-tertiary py-1 font-verse italic">Quiet in the salon today.</p>
        )}
      </section>
    </div>
  );
}

