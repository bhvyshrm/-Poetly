"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Collection, PoemWithAuthor } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/layout/AppShell";
import Toast from "@/components/Toast";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPoem, setShowAddPoem] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isOwner = Boolean(user && collection && user.id === collection.user_id);

  const fetchData = useCallback(async () => {
    try {
      const { data: col, error: colErr } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

      if (colErr || !col) {
        setCollection(null);
        setLoading(false);
        return;
      }

      setCollection(col);
      setEditTitle(col.title);
      setEditDesc(col.description || "");

      const { data: cp } = await supabase
        .from("collection_poems")
        .select("poem_id")
        .eq("collection_id", id);

      const poemIds = cp?.map((r) => r.poem_id) || [];
      if (poemIds.length > 0) {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .in("id", poemIds);
        setPoems((data as PoemWithAuthor[]) || []);
      } else {
        setPoems([]);
      }
    } catch {
      setToast("Failed to load collection");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !collection) return;
    setSavingEdit(true);

    try {
      const { error } = await supabase
        .from("collections")
        .update({
          title: editTitle.trim(),
          description: editDesc.trim() || null,
        })
        .eq("id", id);

      if (!error) {
        setCollection({
          ...collection,
          title: editTitle.trim(),
          description: editDesc.trim() || null,
        });
        setIsEditing(false);
        setToast("Collection updated");
      } else {
        setToast("Failed to update collection");
      }
    } catch {
      setToast("Failed to update collection");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);

    try {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (!error) {
        router.push("/collections");
      } else {
        setToast("Failed to delete collection");
        setDeleting(false);
      }
    } catch {
      setToast("Failed to delete collection");
      setDeleting(false);
    }
  };

  const handleAddPoem = async (poemId: string) => {
    try {
      const { error } = await supabase
        .from("collection_poems")
        .insert({ collection_id: id, poem_id: poemId });

      if (!error) {
        setShowAddPoem(false);
        fetchData();
        setToast("Poem added to collection");
      } else {
        setToast("Failed to add poem");
      }
    } catch {
      setToast("Failed to add poem");
    }
  };

  const handleRemovePoem = async (poemId: string) => {
    try {
      const { error } = await supabase
        .from("collection_poems")
        .delete()
        .eq("collection_id", id)
        .eq("poem_id", poemId);

      if (!error) {
        setPoems(poems.filter((p) => p.id !== poemId));
        setToast("Poem removed from collection");
      } else {
        setToast("Failed to remove poem");
      }
    } catch {
      setToast("Failed to remove poem");
    }
  };

  if (loading) {
    return (
      <AppShell maxWidth="feed">
        <div className="py-12 space-y-4">
          <div className="w-32 h-4 skeleton rounded" />
          <div className="w-3/4 h-10 skeleton rounded-xl" />
          <div className="w-1/2 h-4 skeleton rounded" />
          <div className="pt-8 space-y-4">
            <div className="h-44 skeleton rounded-2xl" />
            <div className="h-44 skeleton rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!collection) {
    return (
      <AppShell maxWidth="feed">
        <div className="py-20 text-center bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-default">
          <p className="font-display text-2xl text-text-primary mb-2">Collection Not Found</p>
          <p className="font-verse italic text-text-tertiary mb-6">This anthology binder does not exist or has been retired.</p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-surface text-text-primary border border-border-default hover:bg-surface-hover text-xs font-medium transition-colors"
          >
            <ArrowLeft size={14} /> Return to Collections
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="feed">
      <div className="space-y-6">
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors group min-h-[44px]"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Library</span>
        </Link>

        {isEditing ? (
          <div className="p-6 bg-surface rounded-[var(--radius-lg)] border border-border-default space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary">Edit Binder Details</span>
              <button
                onClick={() => setIsEditing(false)}
                className="text-text-tertiary hover:text-text-primary p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block mb-1">
                Anthology Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-surface-secondary border border-border-default rounded-[var(--radius-md)] px-4 py-2.5 text-text-primary outline-none focus:border-text-primary transition-colors text-sm font-sans"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary block mb-1">
                Poetic Curatorial Note
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-surface-secondary border border-border-default rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary transition-colors resize-none font-sans"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 min-h-[44px] text-xs font-medium text-text-secondary hover:text-text-primary rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editTitle.trim()}
                className="px-5 py-2 min-h-[44px] text-xs font-medium text-background bg-primary rounded-full hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <section className="bg-surface rounded-[var(--radius-lg)] p-6 sm:p-8 border border-border-default space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary px-2.5 py-0.5 rounded bg-surface-secondary border border-border-default">
                    Anthology Binder
                  </span>
                  <span className="text-xs text-text-tertiary font-mono">
                    {poems.length} {poems.length === 1 ? "poem bound" : "poems bound"}
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-text-primary font-normal leading-tight">
                  {collection.title}
                </h1>
                {collection.description && (
                  <p className="font-verse italic text-text-secondary text-sm sm:text-base leading-relaxed">
                    &ldquo;{collection.description}&rdquo;
                  </p>
                )}
              </div>

              {isOwner && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-[var(--radius-md)] bg-surface-secondary border border-border-default hover:border-text-primary transition-colors"
                    title="Edit Anthology Details"
                    aria-label="Edit Anthology Details"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-tertiary hover:text-text-primary rounded-[var(--radius-md)] bg-surface-secondary border border-border-default hover:border-text-primary transition-colors"
                    title="Delete Anthology"
                    aria-label="Delete Anthology"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>

            {isOwner && (
              <div className="pt-2">
                <button
                  onClick={() => setShowAddPoem(!showAddPoem)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 min-h-[44px] rounded-full bg-primary text-background hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>Bind Stanza to Anthology</span>
                </button>
              </div>
            )}
          </section>
        )}

        {showAddPoem && (
          <AddPoemSelector
            onSelect={handleAddPoem}
            existingIds={poems.map((p) => p.id)}
            onClose={() => setShowAddPoem(false)}
          />
        )}

        {poems.length > 0 ? (
          <div className="space-y-4 pt-2">
            {poems.map((poem) => (
              <div key={poem.id} className="relative group">
                <PoemCard poem={poem} />
                {isOwner && (
                  <button
                    onClick={() => handleRemovePoem(poem.id)}
                    className="absolute top-4 right-4 text-[11px] font-mono text-text-tertiary hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100 bg-surface px-2.5 py-1 rounded-full border border-border-default shadow-sm min-h-[32px]"
                  >
                    Remove from Binder
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-secondary rounded-[var(--radius-lg)] p-8 border border-border-default space-y-3">
            <p className="font-display text-xl text-text-primary">This Sanctuary is Quiet</p>
            <p className="font-verse italic text-xs sm:text-sm text-text-tertiary max-w-sm mx-auto">
              Bind stanzas to weave this collection into an enduring tapestry.
            </p>
            {isOwner && (
              <div className="pt-2">
                <button
                  onClick={() => setShowAddPoem(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-primary text-background text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} />
                  <span>Add First Poem</span>
                </button>
              </div>
            )}
          </div>
        )}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </AppShell>
  );
}

function AddPoemSelector({
  onSelect,
  existingIds,
  onClose,
}: {
  onSelect: (id: string) => void;
  existingIds: string[];
  onClose: () => void;
}) {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(30);

        if (!error && data) {
          setPoems(data as PoemWithAuthor[]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const available = poems.filter((p) => !existingIds.includes(p.id));

  return (
    <div className="mb-6 p-5 bg-surface border border-border-default rounded-[var(--radius-lg)] animate-fade-in shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-default">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary">Select a Stanza to Bind</p>
        <button
          onClick={onClose}
          className="text-xs text-text-tertiary hover:text-text-primary p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md transition-colors"
          aria-label="Close poem selector"
        >
          <X size={15} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-surface-secondary skeleton rounded-[var(--radius-md)]" />
          ))}
        </div>
      ) : available.length > 0 ? (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {available.map((poem) => (
            <button
              key={poem.id}
              onClick={() => onSelect(poem.id)}
              className="w-full text-left px-3.5 py-2.5 rounded-[var(--radius-md)] hover:bg-surface-secondary border border-transparent hover:border-border-default transition-colors flex items-center justify-between group min-h-[44px]"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-sm font-medium text-text-primary truncate">{poem.title}</p>
                <p className="text-xs text-text-tertiary truncate">by {poem.profiles?.display_name || "Anonymous Poet"}</p>
              </div>
              <span className="text-xs font-medium text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Bind +
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary py-4 text-center font-verse italic">No more available published poems found.</p>
      )}
    </div>
  );
}
