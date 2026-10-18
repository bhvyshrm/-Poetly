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
      {/* Reading Insights Card from Stitch */}
      <section className="glass-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold">
          <Sparkles size={14} className="text-primary" />
          <span>Reading Sanctuary</span>
        </div>
        <h4 className="font-display text-lg text-text-primary font-light">
          Personal Reliquary Insights
        </h4>
        <div className="space-y-3 pt-1 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/30">
            <span className="text-text-tertiary">Anthologies Bound</span>
            <span className="font-mono font-semibold text-text-primary">{collections.length}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/30">
            <span className="text-text-tertiary">Library Atmosphere</span>
            <span className="font-mono text-secondary">Sanctuary Mode</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Status</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synced
            </span>
          </div>
        </div>
      </section>

      {/* Bind Chapbook Physical Export Card from Stitch */}
      <section className="glass-surface rounded-2xl p-5 space-y-3 border border-secondary/30 relative overflow-hidden">
        <div className="flex items-center gap-2 text-secondary text-xs font-mono font-semibold">
          <BookMarked size={14} />
          <span>Poetly Press</span>
        </div>
        <h4 className="font-display text-lg text-text-primary font-light leading-snug">
          Bind Physical Chapbook
        </h4>
        <p className="text-xs text-text-tertiary line-clamp-2 font-light">
          Export your personal collection into formatted letterpress PDF or bespoke bound volume.
        </p>
        <div className="pt-2">
          <Link
            href="/write"
            className="px-3.5 py-1.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/25 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
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
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-medium">
            <BookOpen size={14} className="text-primary" />
            <span className="uppercase tracking-widest text-[11px]">Personal Sanctuary &amp; Curations</span>
            <span className="text-text-tertiary">/</span>
            <span className="text-text-secondary">Anthology Bindings</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-light tracking-tight">
            Collections &amp; Personal Library
          </h1>

          <p className="font-verse italic text-base sm:text-lg text-text-secondary max-w-2xl font-light leading-relaxed">
            &ldquo;Your personal reliquary of verses, bindings, curated anthologies, and marginalia gathered across the salon.&rdquo;
          </p>

          {/* Action Row: Filter Pills & New Collection CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-b border-border-subtle/40 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/40 shadow-sm shrink-0">
                All Collections ({collections.length})
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold glass-pill text-text-secondary shrink-0">
                Curated by Me
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary-container to-secondary text-white font-semibold text-xs tracking-wider glowing-btn-aura hover:opacity-95 transition-all active:scale-95 cursor-pointer shrink-0 shadow-md"
            >
              <Plus size={14} />
              <span>New Collection</span>
            </button>
          </div>
        </section>

        {/* Create Collection Drawer / Card */}
        {showCreate && (
          <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 border border-primary/30 animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/30">
              <h3 className="font-display text-lg text-text-primary font-medium">
                Bind a New Anthology
              </h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-text-tertiary hover:text-text-primary p-1 cursor-pointer"
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
              className="w-full bg-surface-secondary/70 border border-border-subtle/50 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors font-sans"
              autoFocus
            />

            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Poetic dedication or theme description..."
              className="w-full bg-surface-secondary/70 border border-border-subtle/50 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 resize-none transition-colors font-verse italic font-light"
              rows={2}
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-xs text-text-tertiary hover:text-text-primary px-3 py-1.5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-container to-secondary text-white font-semibold text-xs glowing-btn-aura hover:opacity-95 transition-all disabled:opacity-40 cursor-pointer"
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
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-text-secondary">
                  Sanctuary Spotlight · Featured Binder
                </h2>
              </div>
              <span className="text-xs text-text-tertiary font-mono">Curated Selection</span>
            </div>

            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-7 relative overflow-hidden group border border-primary/25 hover:border-primary/40 transition-all duration-300 specular-top-border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-secondary px-2.5 py-0.5 rounded-full bg-secondary/15 border border-secondary/30">
                      Salon Binder
                    </span>
                    <span className="text-xs text-text-tertiary font-mono">
                      Created {new Date(featuredCollection.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <h3 className="font-display italic text-2xl sm:text-3xl text-text-primary group-hover:text-primary transition-colors font-light">
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-container to-secondary text-white font-semibold text-xs glowing-btn-aura hover:opacity-95 transition-all"
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
                <div key={i} className="h-44 glass-surface rounded-2xl skeleton" />
              ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {collections.map((c) => (
                <CollectionCard key={c.id} collection={c} />
              ))}
            </div>
          ) : !user ? (
            <div className="text-center py-16 px-6 glass-surface rounded-2xl border border-border-subtle/40 space-y-3">
              <p className="font-verse text-xl text-text-tertiary italic">
                Organize your favorite poems into personal anthologies.
              </p>
              <p className="text-xs text-text-secondary">
                Sign in to create, curate, and preserve salon shelves.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-container to-secondary rounded-full hover:opacity-95 shadow-md glowing-btn-aura"
                >
                  Sign In to Salon →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-6 glass-surface rounded-2xl border border-border-subtle/40 space-y-3">
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
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
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

