"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, X, BookOpen, Sparkles, BookMarked, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Collection } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import AppShell from "@/components/layout/AppShell";
import CollectionCard from "@/components/poetry/CollectionCard";
import Toast from "@/components/Toast";
import SuggestedWriters from "@/components/home/SuggestedWriters";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      let query = supabase
        .from("collections")
        .select("*, collection_poems(id)")
        .order("created_at", { ascending: false });

      if (user) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCollections((data as unknown as Collection[]) || []);
    } catch {
      setToast("Failed to load collections");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    if (!user) {
      setToast("You must be logged in to create a collection");
      return;
    }

    try {
      const { error } = await supabase.from("collections").insert({
        user_id: user.id,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
      });

      if (!error) {
        setNewTitle("");
        setNewDesc("");
        setShowCreate(false);
        fetchCollections();
        setToast("Collection bound to your library");
      } else {
        setToast("Failed to create collection");
      }
    } catch {
      setToast("Failed to create collection");
    }
  };

  const featuredCollection = collections[0];

  const rightRailContent = (
    <div className="space-y-6">
      {/* Reading Insights Card */}
      <section className="bg-surface rounded-[var(--radius-lg)] p-5 border border-border-default space-y-4">
        <div className="flex items-center gap-2 text-text-primary font-mono text-xs font-medium">
          <BookOpen size={14} className="text-text-primary" />
          <span>Reading Sanctuary</span>
        </div>
        <h4 className="font-display text-lg text-text-primary font-normal">
          Personal Reliquary Insights
        </h4>
        <div className="space-y-3 pt-1 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-default">
            <span className="text-text-tertiary">Anthologies Bound</span>
            <span className="font-mono font-medium text-text-primary">{collections.length}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-border-default">
            <span className="text-text-tertiary">Library Atmosphere</span>
            <span className="font-mono text-text-secondary">Monochrome</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Status</span>
            <span className="text-text-secondary font-mono text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-text-secondary" />
              Synced
            </span>
          </div>
        </div>
      </section>

      {/* Bind Chapbook Card */}
      <section className="bg-surface rounded-[var(--radius-lg)] p-5 border border-border-default space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-text-secondary text-xs font-mono font-medium">
          <BookMarked size={14} />
          <span>Poetly Press</span>
        </div>
        <h4 className="font-display text-lg text-text-primary font-normal leading-snug">
          Bind Physical Chapbook
        </h4>
        <p className="text-xs text-text-secondary line-clamp-2 font-light">
          Export your personal collection into formatted letterpress PDF or bespoke bound volume.
        </p>
        <div className="pt-2">
          <Link
            href="/write"
            className="px-3.5 py-1.5 min-h-[36px] rounded-full bg-surface-secondary text-text-primary border border-border-default hover:bg-surface-hover text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Design Folio</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* Suggested Poets */}
      <SuggestedWriters />
    </div>
  );

  return (
    <AppShell maxWidth="wide" rightRail={rightRailContent}>
      <div className="space-y-8">
        {/* SECTION 1: HEADER SECTION */}
        <section className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-text-tertiary font-mono text-xs font-medium">
            <BookOpen size={14} className="text-text-primary" />
            <span className="uppercase tracking-widest text-[11px]">Personal Sanctuary &amp; Curations</span>
            <span>/</span>
            <span className="text-text-secondary">Anthology Bindings</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-normal tracking-tight">
            Collections &amp; Personal Library
          </h1>

          <p className="font-verse italic text-base sm:text-lg text-text-secondary max-w-2xl font-light leading-relaxed">
            &ldquo;Your personal reliquary of verses, bindings, curated anthologies, and marginalia gathered across the salon.&rdquo;
          </p>

          {/* Action Row: Filter Pills & New Collection CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-b border-border-default pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-primary text-background shrink-0 min-h-[36px] flex items-center">
                All Collections ({collections.length})
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface-secondary text-text-secondary border border-border-default shrink-0 min-h-[36px] flex items-center">
                Curated by Me
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-primary text-background font-medium text-xs tracking-wider hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>New Collection</span>
            </button>
          </div>
        </section>

        {/* Create Collection Drawer / Card */}
        {showCreate && (
          <div className="bg-surface rounded-[var(--radius-lg)] p-5 sm:p-6 border border-border-default animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-default">
              <h3 className="font-display text-lg text-text-primary font-medium">
                Bind a New Anthology
              </h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-text-tertiary hover:text-text-primary p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Cancel new collection"
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Anthology title (e.g. Nocturnes & Ephemera)..."
              className="w-full bg-surface-secondary border border-border-default rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors font-sans"
              autoFocus
            />

            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Poetic dedication or theme description..."
              className="w-full bg-surface-secondary border border-border-default rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary resize-none transition-colors font-verse italic font-light"
              rows={2}
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-xs text-text-secondary hover:text-text-primary px-3 py-2 min-h-[44px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="px-4 py-2 min-h-[44px] rounded-full bg-primary text-background font-medium text-xs hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
              >
                Create Binder
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: SPOTLIGHT / CURRENT READING BINDER */}
        {featuredCollection && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xs font-mono uppercase tracking-wider font-medium text-text-secondary">
                  Sanctuary Spotlight · Featured Binder
                </h2>
              </div>
              <span className="text-xs text-text-tertiary font-mono">Curated Selection</span>
            </div>

            <div className="bg-surface rounded-[var(--radius-lg)] p-6 sm:p-7 relative overflow-hidden group border border-border-default hover:border-text-primary transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary px-2.5 py-0.5 rounded bg-surface-secondary border border-border-default">
                      Salon Binder
                    </span>
                    <span className="text-xs text-text-tertiary font-mono">
                      Created {new Date(featuredCollection.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <h3 className="font-display italic text-2xl sm:text-3xl text-text-primary group-hover:underline transition-colors font-light">
                    {featuredCollection.title}
                  </h3>

                  {featuredCollection.description && (
                    <p className="font-verse italic text-base text-text-secondary max-w-xl font-light line-clamp-2">
                      &ldquo;{featuredCollection.description}&rdquo;
                    </p>
                  )}
                </div>

                <div className="shrink-0 sm:self-center">
                  <Link
                    href={`/collections/${featuredCollection.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-primary text-background font-medium text-xs hover:opacity-90 transition-opacity"
                  >
                    <span>Open Sanctuary</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: COLLECTIONS GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-text-primary font-medium">
              All Shelves &amp; Chapbooks
            </h2>
            <span className="text-xs text-text-tertiary font-mono">
              {collections.length} {collections.length === 1 ? "binder" : "binders"}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-surface rounded-[var(--radius-lg)] border border-border-default skeleton" />
              ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {collections.map((c) => (
                <CollectionCard key={c.id} collection={c} />
              ))}
            </div>
          ) : !user ? (
            <div className="text-center py-16 px-6 bg-surface-secondary rounded-[var(--radius-lg)] border border-border-default space-y-3">
              <p className="font-verse text-xl text-text-tertiary italic">
                Organize your favorite poems into personal anthologies.
              </p>
              <p className="text-xs text-text-secondary">
                Sign in to create, curate, and preserve salon shelves.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center px-5 py-2.5 min-h-[44px] text-xs font-medium text-background bg-primary rounded-full hover:opacity-90 transition-opacity"
                >
                  Sign In to Salon →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-surface-secondary rounded-[var(--radius-lg)] border border-border-default space-y-3">
              <p className="font-verse text-xl text-text-tertiary italic">
                No collections bound to your library yet.
              </p>
              <p className="text-xs text-text-secondary">
                Create collections to organize and preserve poems.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center px-4 py-2 min-h-[44px] text-xs font-medium text-text-primary hover:underline cursor-pointer"
                >
                  + Bind your first collection
                </button>
              </div>
            </div>
          )}
        </section>

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </AppShell>
  );
}

