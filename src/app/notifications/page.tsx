"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Feather,
  AtSign,
  Sparkles,
  CheckCheck,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { NotificationWithActor } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import Avatar from "@/components/ui/Avatar";
import SuggestedWriters from "@/components/home/SuggestedWriters";

type FilterTab = "all" | "likes" | "comments" | "follows";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("notifications")
        .select("*, profiles!notifications_actor_id_fkey(*)")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setNotifications((data as NotificationWithActor[]) || []);

      // Mark all as read
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("recipient_id", user.id)
        .eq("read", false);
    } catch {
      // Silent fail
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [authLoading, fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "likes") {
      return notifications.filter((n) => n.type === "like");
    }
    if (activeTab === "comments") {
      return notifications.filter((n) => n.type === "comment" || n.type === "response" || n.type === "mention");
    }
    if (activeTab === "follows") {
      return notifications.filter((n) => n.type === "follow");
    }
    return notifications;
  }, [notifications, activeTab]);

  const getNotificationIcon = (type: NotificationWithActor["type"]) => {
    switch (type) {
      case "like":
        return <Heart size={14} className="text-text-primary fill-text-primary" />;
      case "comment":
        return <MessageSquare size={14} className="text-text-secondary" />;
      case "follow":
        return <UserPlus size={14} className="text-text-secondary" />;
      case "response":
        return <Feather size={14} className="text-text-primary" />;
      case "mention":
        return <AtSign size={14} className="text-text-secondary" />;
      default:
        return <Sparkles size={14} className="text-text-tertiary" />;
    }
  };

  const getNotificationText = (n: NotificationWithActor) => {
    const actorName = n.profiles?.display_name || "A fellow poet";
    switch (n.type) {
      case "like":
        return (
          <span>
            <strong className="text-text-primary font-medium">{actorName}</strong> appreciated your stanza
          </span>
        );
      case "comment":
        return (
          <span>
            <strong className="text-text-primary font-medium">{actorName}</strong> inscribed a marginalia note on your poem
          </span>
        );
      case "follow":
        return (
          <span>
            <strong className="text-text-primary font-medium">{actorName}</strong> entered your circle of readership
          </span>
        );
      case "response":
        return (
          <span>
            <strong className="text-text-primary font-medium">{actorName}</strong> published a resonant response stanza
          </span>
        );
      case "mention":
        return (
          <span>
            <strong className="text-text-primary font-medium">{actorName}</strong> invoked your name in verse
          </span>
        );
      default:
        return (
          <span>
            <strong className="text-text-primary font-medium">{actorName}</strong> interacted with your poetry
          </span>
        );
    }
  };

  const getNotificationLink = (n: NotificationWithActor) => {
    if (n.type === "follow") {
      return `/profile/${n.profiles?.username || ""}`;
    }
    if (n.reference_id) {
      return `/poem/${n.reference_id}`;
    }
    return "/home";
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const rightRailContent = (
    <div className="space-y-6">
      {/* Resonance Sanctuary Digest Card */}
      <section className="bg-surface rounded-[var(--radius-lg)] p-5 border border-border-default space-y-4">
        <div className="flex items-center gap-2 text-text-primary font-mono text-xs font-medium">
          <Bell size={14} className="text-text-primary" />
          <span>Resonance Sanctuary</span>
        </div>
        <h4 className="font-display text-lg text-text-primary font-normal">
          Audience Echoes
        </h4>
        <div className="space-y-3 pt-1 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-default">
            <span className="text-text-tertiary">Total Whispers</span>
            <span className="font-mono font-medium text-text-primary">{notifications.length}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-border-default">
            <span className="text-text-tertiary">Salon Status</span>
            <span className="text-text-secondary font-mono text-[11px] flex items-center gap-1">
              <CheckCheck size={13} />
              All caught up
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Channel</span>
            <span className="font-mono text-text-secondary">Monochrome Digest</span>
          </div>
        </div>
      </section>

      {/* Suggested Writers */}
      <SuggestedWriters />
    </div>
  );

  return (
    <AppShell maxWidth="wide" rightRail={rightRailContent}>
      <div className="space-y-6">
        {/* Header */}
        <section className="space-y-2 pt-1">
          <p className="text-xs uppercase tracking-widest text-text-tertiary font-mono">
            Salon Marginalia / Notifications
          </p>

          <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-normal tracking-tight">
            Whispers &amp; Activity
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary font-light">
            Echoes, appreciations, and fellow poets encountering your stanzas.
          </p>
        </section>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-border-default">
          {(
            [
              { id: "all", label: "All Whispers" },
              { id: "likes", label: "Appreciations" },
              { id: "comments", label: "Marginalia & Responses" },
              { id: "follows", label: "New Readers" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors shrink-0 cursor-pointer min-h-[36px] ${
                activeTab === tab.id
                  ? "bg-primary text-background font-semibold"
                  : "bg-surface-secondary text-text-secondary border border-border-default hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Stream */}
        {authLoading || loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-surface rounded-[var(--radius-lg)] p-4 sm:p-5 flex items-center gap-4 border border-border-default"
              >
                <div className="w-10 h-10 skeleton rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/5 h-4 skeleton rounded" />
                  <div className="w-1/4 h-3 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !user ? (
          <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-default space-y-4">
            <p className="font-display text-2xl text-text-primary font-normal">
              Enter the Sanctuary to View Whispers
            </p>
            <p className="font-verse italic text-text-tertiary max-w-md mx-auto text-sm">
              Follow fellow poets and receive echoes whenever they interact with your writing.
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
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-2.5">
            {filteredNotifications.map((n) => (
              <Link
                key={n.id}
                href={getNotificationLink(n)}
                className={`bg-surface rounded-[var(--radius-lg)] p-4 sm:p-4.5 border transition-colors flex items-center justify-between gap-3 group min-h-[60px] ${
                  !n.read
                    ? "border-text-primary bg-surface-secondary"
                    : "border-border-default hover:border-text-primary"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar
                      src={n.profiles?.profile_image}
                      name={n.profiles?.display_name || "Poet"}
                      size="md"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-surface border border-border-default shadow-xs">
                      {getNotificationIcon(n.type)}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-text-secondary leading-snug">
                      {getNotificationText(n)}
                    </p>
                    <p className="font-mono text-[11px] text-text-tertiary mt-1">
                      {formatRelativeTime(n.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.read && (
                    <span
                      className="w-2 h-2 rounded-full bg-primary"
                      aria-label="Unread notification"
                    />
                  )}
                  <ArrowRight
                    size={14}
                    className="text-text-tertiary group-hover:text-text-primary group-hover:translate-x-0.5 transition-transform hidden sm:block"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-default space-y-3">
            <p className="font-display text-xl text-text-primary">The Sanctuary is Silent</p>
            <p className="font-verse italic text-xs sm:text-sm text-text-tertiary max-w-sm mx-auto">
              {activeTab === "all"
                ? "No whispers have reached your desk yet. As fellow poets read and appreciate your verse, their echoes will gather here."
                : "No whispers found matching this category."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
