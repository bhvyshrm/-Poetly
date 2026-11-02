"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Edit3,
  Share2,
  Calendar,
  Globe,
  MapPin,
  BookOpen,
  Pin,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Profile, PoemWithAuthor, Collection } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/layout/AppShell";
import Toast from "@/components/Toast";
import SuggestedWriters from "@/components/home/SuggestedWriters";
import { PoemCardSkeleton } from "@/components/home/Skeletons";

export default function ProfileByUsernamePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"poems" | "collections" | "about">("poems");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const isOwnProfile = user && profile && user.id === profile.id;

  const loadProfile = useCallback(async (p: Profile) => {
    setProfile(p);

    try {
      // Load user poems
      const { data: poemData } = await supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("author_id", p.id)
        .eq("status", "published")
        .eq("visibility", "public")
        .order("published_at", { ascending: false });

      setPoems((poemData as PoemWithAuthor[]) || []);

      // Load user collections
      const { data: colData } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", p.id)
        .order("created_at", { ascending: false });

      setCollections((colData as Collection[]) || []);

      // Load follower / following counts
      const { count: fc } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", p.id);
      setFollowerCount(fc || 0);

      const { count: fgc } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", p.id);
      setFollowingCount(fgc || 0);

      if (user && user.id !== p.id) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", p.id)
          .maybeSingle();
        setIsFollowing(!!followData);
      }
    } catch {
      setToast("Failed to load profile details");
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (username) {
      supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle()
        .then(({ data, error }) => {
          if (data) {
            loadProfile(data as Profile);
          } else if (error) {
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }
  }, [username, loadProfile]);

  const handleFollow = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!profile || user.id === profile.id) return;

    const previousFollow = isFollowing;
    const previousCount = followerCount;

    if (previousFollow) {
      setFollowerCount(Math.max(0, previousCount - 1));
      setIsFollowing(false);
    } else {
      setFollowerCount(previousCount + 1);
      setIsFollowing(true);
    }

    try {
      if (previousFollow) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: profile.id });
        if (error) throw error;

        // Create notification
        await supabase.from("notifications").insert({
          recipient_id: profile.id,
          actor_id: user.id,
          type: "follow",
        });
      }
    } catch {
      setIsFollowing(previousFollow);
      setFollowerCount(previousCount);
      setToast("Failed to update follow");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setToast("Profile link copied to clipboard");
    }
  };

  const rightRailContent = (
    <div className="space-y-6">
      {/* Curated Anthologies by this Creator */}
      {collections.length > 0 && (
        <section className="glass-surface rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-text-primary font-semibold tracking-tight flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              <span>Bound Anthologies</span>
            </h3>
            <span className="text-xs text-text-tertiary font-mono">({collections.length})</span>
          </div>
          <div className="space-y-2.5">
            {collections.slice(0, 4).map((col) => (
              <Link
                key={col.id}
                href="/collections"
                className="glass-pill p-3 rounded-xl flex items-center justify-between hover:border-primary/40 transition-all group block"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-sm text-text-primary group-hover:text-primary transition-colors truncate">
                    {col.title}
                  </h4>
                  {col.description && (
                    <p className="text-[11px] text-text-tertiary line-clamp-1 mt-0.5 font-light">
                      {col.description}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-secondary font-mono ml-2 shrink-0">
                  Folio
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Poets */}
      <SuggestedWriters />
    </div>
  );

  if (loading) {
    return (
      <AppShell maxWidth="feed">
        <div className="space-y-6 animate-pulse">
          <div className="h-44 sm:h-52 w-full skeleton rounded-2xl" />
          <div className="space-y-4">
            <PoemCardSkeleton />
            <PoemCardSkeleton />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell maxWidth="feed">
        <div className="py-16 text-center glass-surface rounded-2xl p-8 max-w-md mx-auto space-y-3">
          <p className="font-verse text-xl text-text-tertiary italic">
            Poet not found in the salon.
          </p>
          <Link
            href="/home"
            className="text-xs text-primary hover:underline font-semibold inline-block pt-2"
          >
            ← Return to Sanctuary
          </Link>
        </div>
      </AppShell>
    );
  }

  const pinnedPoem = poems[0];
  const remainingPoems = poems.slice(1);

  return (
    <AppShell maxWidth="feed" rightRail={rightRailContent}>
      <div className="space-y-6">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        {/* 1. PROFILE HEADER / WRITER BANNER */}
        <section className="glass-surface rounded-2xl overflow-hidden border border-border-default relative">
          {/* Minimal Clean Banner */}
          <div className="h-28 sm:h-36 w-full relative overflow-hidden bg-surface-secondary border-b border-border-default" />

          {/* Identity Content */}
          <div className="px-5 sm:px-8 pb-6 pt-0 relative">
            {/* Avatar & Action Buttons Row */}
            <div className="flex flex-wrap items-end justify-between -mt-10 sm:-mt-12 gap-4 mb-4">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 border border-border-default shadow-sm relative overflow-hidden bg-surface-secondary shrink-0">
                  {profile.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.profile_image}
                      alt={profile.display_name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-surface-secondary flex items-center justify-center font-display text-2xl sm:text-3xl font-medium text-text-primary">
                      {profile.display_name?.[0]?.toUpperCase() || "P"}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {isOwnProfile ? (
                  <Link
                    href="/profile/setup"
                    className="border border-border-default hover:bg-surface-hover transition-colors px-4 py-2 rounded-full text-text-primary text-xs font-medium flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-none"
                  >
                    <Edit3 size={14} />
                    <span>Edit Profile</span>
                  </Link>
                ) : user ? (
                  <button
                    type="button"
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors select-none cursor-pointer flex items-center gap-1.5 ${
                      isFollowing
                        ? "border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                        : "bg-primary text-on-primary hover:opacity-90"
                    }`}
                  >
                    <span>{isFollowing ? "Following" : "Follow"}</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Follow
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  className="border border-border-default p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-95 transition-colors cursor-pointer"
                  title="Share Profile"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Identity Headings */}
            <div className="mb-3 space-y-0.5">
              <h1 className="font-display italic text-2xl sm:text-3xl text-text-primary font-normal tracking-tight">
                {profile.display_name}
              </h1>
              <p className="text-xs text-text-tertiary font-mono">
                @{profile.username}
                {profile.location && ` · ${profile.location}`}
              </p>
            </div>

            {/* Literary Bio */}
            {profile.bio && (
              <p className="font-verse italic text-base sm:text-lg text-text-primary/90 leading-relaxed max-w-2xl mb-4 font-light">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary mb-5">
              {profile.website && (
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary font-mono transition-colors"
                >
                  <Globe size={13} />
                  <span>{profile.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {profile.location && (
                <span className="inline-flex items-center gap-1 font-mono">
                  <MapPin size={13} className="text-text-tertiary" />
                  <span>{profile.location}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 font-mono">
                <Calendar size={13} className="text-text-tertiary" />
                <span>Member since {new Date(profile.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
              </span>
            </div>

            {/* Follower & Stanza Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-border-subtle">
              <div className="bg-surface-secondary border border-border-default rounded-xl p-3 text-center">
                <div className="font-display text-lg sm:text-xl text-text-primary font-semibold">
                  {followerCount.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-mono">
                  Followers
                </div>
              </div>
              <div className="bg-surface-secondary border border-border-default rounded-xl p-3 text-center">
                <div className="font-display text-lg sm:text-xl text-text-primary font-semibold">
                  {followingCount.toLocaleString()}
                </div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-mono">
                  Following
                </div>
              </div>
              <div className="bg-surface-secondary border border-border-default rounded-xl p-3 text-center">
                <div className="font-display text-lg sm:text-xl text-text-primary font-semibold">
                  {poems.length}
                </div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-mono">
                  Poems
                </div>
              </div>
              <div className="bg-surface-secondary border border-border-default rounded-xl p-3 text-center">
                <div className="font-display text-lg sm:text-xl text-text-primary font-semibold">
                  {collections.length}
                </div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-mono">
                  Collections
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROFILE CONTENT NAVIGATION TABS */}
        <div className="border-b border-border-default flex items-center gap-6 sm:gap-8 text-sm overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("poems")}
            className={`pb-3 relative font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "poems" ? "text-text-primary font-semibold" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <span>Poems</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-secondary border border-border-default text-text-primary text-[11px] font-mono">
              {poems.length}
            </span>
            {activeTab === "poems" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("collections")}
            className={`pb-3 relative font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "collections" ? "text-text-primary font-semibold" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <span>Collections</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-secondary border border-border-default text-text-primary text-[11px] font-mono">
              {collections.length}
            </span>
            {activeTab === "collections" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`pb-3 relative font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "about" ? "text-text-primary font-semibold" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            About
            {activeTab === "about" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary rounded-full" />
            )}
          </button>
        </div>

        {/* 3. PROFILE FEED CONTENT */}
        <section className="space-y-6">
          {activeTab === "poems" ? (
            poems.length > 0 ? (
              <div className="space-y-6">
                {/* Pinned / Featured Stanza Ribbon if first poem */}
                {pinnedPoem && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-primary text-xs font-mono font-semibold px-1">
                      <Pin size={13} className="text-primary rotate-45" />
                      <span>Featured Stanza</span>
                    </div>
                    <PoemCard poem={pinnedPoem} />
                  </div>
                )}

                {/* Remaining Poems */}
                {remainingPoems.map((poem) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 px-6 bg-surface-secondary rounded-[var(--radius-lg)] border border-border-default">
                <p className="font-verse text-lg text-text-tertiary italic mb-2">
                  No poems published in the salon yet.
                </p>
                {isOwnProfile && (
                  <Link
                    href="/write"
                    className="inline-flex items-center px-4 py-2 min-h-[44px] text-xs font-medium text-background bg-primary rounded-full hover:opacity-90 transition-opacity mt-3"
                  >
                    Write your first poem →
                  </Link>
                )}
              </div>
            )
          ) : activeTab === "collections" ? (
            collections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {collections.map((col) => (
                  <div
                    key={col.id}
                    className="bg-surface rounded-[var(--radius-lg)] p-5 border border-border-default hover:border-text-primary transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-text-tertiary font-mono">
                        <span className="text-text-secondary bg-surface-secondary border border-border-default px-2 py-0.5 rounded text-[10px]">
                          Chapbook
                        </span>
                        <span>{new Date(col.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-display text-xl text-text-primary font-normal">
                        {col.title}
                      </h3>
                      {col.description && (
                        <p className="text-xs text-text-secondary font-light line-clamp-2">
                          {col.description}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/collections"
                      className="text-xs text-text-primary font-medium hover:underline pt-2 border-t border-border-subtle block"
                    >
                      Open Chapbook →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 px-6 bg-surface-secondary rounded-[var(--radius-lg)] border border-border-default">
                <p className="font-verse text-lg text-text-tertiary italic mb-2">
                  No bound anthologies yet.
                </p>
                {isOwnProfile && (
                  <Link
                    href="/collections"
                    className="inline-flex items-center px-4 py-2 min-h-[44px] text-xs font-medium text-background bg-primary rounded-full hover:opacity-90 transition-opacity mt-3"
                  >
                    Create a collection →
                  </Link>
                )}
              </div>
            )
          ) : (
            <div className="bg-surface rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-6 border border-border-default">
              <div>
                <h3 className="font-display text-xl text-text-primary font-medium mb-3">
                  Literary Statement
                </h3>
                {profile.bio ? (
                  <p className="font-verse italic text-lg text-text-primary leading-relaxed font-light">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                ) : (
                  <p className="text-sm text-text-tertiary italic">
                    This poet has not written an extended statement yet.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-default text-xs">
                {profile.location && (
                  <div className="space-y-1">
                    <span className="text-text-tertiary uppercase font-mono tracking-wider text-[10px]">
                      Sanctuary Locale
                    </span>
                    <p className="text-text-primary font-medium flex items-center gap-1.5">
                      <MapPin size={14} className="text-text-tertiary" />
                      <span>{profile.location}</span>
                    </p>
                  </div>
                )}
                {profile.website && (
                  <div className="space-y-1">
                    <span className="text-text-tertiary uppercase font-mono tracking-wider text-[10px]">
                      Marginalia Press
                    </span>
                    <p className="text-text-primary font-medium">
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {profile.website}
                      </a>
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-text-tertiary uppercase font-mono tracking-wider text-[10px]">
                    Salon Guild
                  </span>
                  <p className="text-text-primary font-medium flex items-center gap-1.5">
                    <Users size={14} className="text-text-tertiary" />
                    <span>Poetly Fellowship</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-text-tertiary uppercase font-mono tracking-wider text-[10px]">
                    Fellow Since
                  </span>
                  <p className="text-text-primary font-medium flex items-center gap-1.5">
                    <Calendar size={14} className="text-text-tertiary" />
                    <span>{new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </AppShell>
  );
}

