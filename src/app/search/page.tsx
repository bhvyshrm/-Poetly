"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, Tag as TagIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, Profile } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import WriterCard from "@/components/WriterCard";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <AppShell maxWidth="feed">
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        </AppShell>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag") || "";
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialTag || initialQ);
  const [activeTab, setActiveTab] = useState<"poems" | "writers" | "tags">(
    initialTag ? "tags" : "poems"
  );
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [writers, setWriters] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTag) {
      setQuery(initialTag);
      setActiveTab("tags");
    } else if (initialQ) {
      setQuery(initialQ);
      setActiveTab("poems");
    }
  }, [initialTag, initialQ]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setPoems([]);
      setWriters([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (activeTab === "poems") {
          const { data } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .eq("status", "published")
            .eq("visibility", "public")
            .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
            .order("created_at", { ascending: false })
            .limit(20);
          setPoems((data as PoemWithAuthor[]) || []);
        } else if (activeTab === "writers") {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("status", "active")
            .or(`username.ilike.%${q}%,display_name.ilike.%${q}%,bio.ilike.%${q}%`)
            .limit(20);
          setWriters((data as Profile[]) || []);
        } else if (activeTab === "tags") {
          // Search poems by tag or mood
          const cleanTag = q.replace(/^#/, "").trim().toLowerCase().replace(/[^a-zA-Z0-9_\-]/g, "");
          if (!cleanTag) {
            setPoems([]);
            return;
          }
          const { data } = await supabase
            .from("poems")
            .select("*, profiles!inner(*)")
            .eq("status", "published")
            .eq("visibility", "public")
            .or(`tags.cs.{${cleanTag}},mood.ilike.%${cleanTag}%`)
            .order("created_at", { ascending: false })
            .limit(20);
          setPoems((data as PoemWithAuthor[]) || []);
        }
      } catch (error) {
        console.error("Failed to search:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  return (
    <AppShell maxWidth="feed">
      <div className="animate-fade-in">
        <PageHeader
          title="Search"
          description="Find poems, poets, and moods across Poetly"
        />

        <div className="relative mb-6">
          <SearchIcon
            size={16}
            strokeWidth={1.5}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search poems, writers, or tags..."
            className="w-full bg-surface border border-border-default focus:border-text-primary rounded-[var(--radius-md)] outline-none pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors"
            autoFocus
          />
        </div>

        <div className="flex gap-1 mb-6 bg-surface-secondary border border-border-default rounded-full p-1">
          {(["poems", "writers", "tags"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 min-h-[44px] text-xs font-medium rounded-full transition-colors capitalize ${
                activeTab === tab
                  ? "bg-primary text-background font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 skeleton rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : !query.trim() ? (
          <div className="text-center py-16 text-text-tertiary">
            <SearchIcon size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-poem text-lg italic mb-1">Seek and you shall read.</p>
            <p className="text-xs">Type a keyword, writer name, or tag above.</p>
          </div>
        ) : activeTab === "poems" ? (
          poems.length > 0 ? (
            <div className="space-y-3">
              {poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary py-12 text-center">
              No poems found matching &ldquo;{query}&rdquo;.
            </p>
          )
        ) : activeTab === "writers" ? (
          writers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {writers.map((writer) => (
                <div key={writer.id} className="p-3 bg-surface border border-border-subtle rounded-[var(--radius-md)]">
                  <WriterCard writer={writer} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary py-12 text-center">
              No writers found matching &ldquo;{query}&rdquo;.
            </p>
          )
        ) : poems.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4 text-xs text-text-tertiary">
              <TagIcon size={12} />
              <span>Showing poems tagged with #{query.replace(/^#/, "")}</span>
            </div>
            {poems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary py-12 text-center">
            No poems found tagged with &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
    </AppShell>
  );
}
