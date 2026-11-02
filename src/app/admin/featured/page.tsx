"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { Database } from "@/lib/database.types";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";
import Toast from "@/components/Toast";

type FeaturedRow = Database["public"]["Tables"]["featured_content"]["Row"];
type Poem = Database["public"]["Tables"]["poems"]["Row"];
type Prompt = Database["public"]["Tables"]["prompts"]["Row"];

interface FeaturedItem extends FeaturedRow {
  poem?: Poem;
  prompt?: Prompt;
}

export default function AdminFeaturedPage() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<"poem" | "prompt">("poem");
  const [availablePoems, setAvailablePoems] = useState<Poem[]>([]);
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [confirm, setConfirm] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/data?type=featured");
      if (!res.ok) throw new Error("Failed to load featured content");
      const json = await res.json();
      setItems((json.items as FeaturedItem[]) || []);
      setAvailablePoems((json.availablePoems as Poem[]) || []);
      setAvailablePrompts((json.availablePrompts as Prompt[]) || []);
    } catch (err) {
      setError("Failed to load featured content.");
      console.error("Fetch featured error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeatured(); }, [fetchFeatured]);

  const loadAvailable = async () => {
    // Available items already loaded during fetchFeatured
  };

  const handleAdd = async (contentId: string) => {
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_featured",
          contentType: addType,
          contentId,
        }),
      });
      if (!res.ok) throw new Error("Add featured failed");
      setShowAdd(false);
      setToast("Content added to featured.");
      fetchFeatured();
    } catch (err) {
      setToast("Failed to add featured content.");
      console.error("Add featured error:", err);
    }
  };

  const handleRemove = async (id: string) => {
    setConfirm(null);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_featured",
          id,
        }),
      });
      if (!res.ok) throw new Error("Remove featured failed");
      setToast("Content removed from featured.");
      fetchFeatured();
    } catch (err) {
      setToast("Failed to remove featured content.");
      console.error("Remove featured error:", err);
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const updated = [...items];
    [updated[idx].position, updated[swapIdx].position] = [updated[swapIdx].position, updated[idx].position];
    const [moved] = updated.splice(idx, 1);
    updated.splice(swapIdx, 0, moved);
    setItems(updated);

    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder_featured",
          items: updated.map((item) => ({ id: item.id, position: item.position })),
        }),
      });
      if (!res.ok) throw new Error("Reorder failed");
    } catch (err) {
      console.error("Reorder error:", err);
      fetchFeatured();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-text-primary mb-1">Featured</h1>
          <p className="text-sm text-text-secondary">Manage featured content on Poetly.</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); loadAvailable(); }}
          className="flex items-center gap-1.5 text-xs font-medium bg-primary text-background px-3.5 py-2 min-h-[44px] rounded-full hover:opacity-90 transition-opacity"
        >
          <Plus size={12} strokeWidth={2} /> Add Featured
        </button>
      </div>

      {error && (
        <div className="bg-surface-secondary border border-border-default rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-text-primary">{error}</p>
        </div>
      )}

      {loading ? (
        <AdminSkeleton rows={4} />
      ) : items.length > 0 ? (
        <div className="space-y-0">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3 py-4 border-b border-border-default group">
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMove(item.id, "up")}
                  disabled={idx === 0}
                  className="text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors p-1"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => handleMove(item.id, "down")}
                  disabled={idx === items.length - 1}
                  className="text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors p-1"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-text-tertiary uppercase tracking-widest">{item.content_type}</span>
                  <span className="text-[10px] text-text-tertiary">#{item.position}</span>
                </div>
                {item.poem && (
                  <Link href={`/poem/${item.poem.id}`} className="text-sm font-medium text-text-primary hover:underline transition-colors">
                    {item.poem.title}
                  </Link>
                )}
                {item.prompt && (
                  <Link href={`/prompts/${item.prompt.id}`} className="text-sm font-medium text-text-primary hover:underline transition-colors italic">
                    &ldquo;{item.prompt.title}&rdquo;
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {(item.poem || item.prompt) && (
                  <Link
                    href={item.poem ? `/poem/${item.poem.id}` : `/prompts/${item.prompt!.id}`}
                    className="p-1.5 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <ExternalLink size={14} strokeWidth={1.5} />
                  </Link>
                )}
                <button
                  onClick={() => setConfirm({
                    id: item.id,
                    title: item.poem?.title || item.prompt?.title || "this item",
                  })}
                  className="p-1.5 text-text-tertiary hover:text-error transition-colors"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="No featured content"
          description="Feature poems or prompts to highlight them on Poetly."
        />
      )}

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-surface border border-border-subtle rounded-[var(--radius-lg)] p-6 max-w-md w-full shadow-xl animate-fade-in max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-medium text-text-primary mb-4">Add Featured Content</h3>
            <div className="flex gap-1 mb-4 bg-surface-secondary rounded-[var(--radius-full)] p-1">
              {(["poem", "prompt"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setAddType(t)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-full transition-all capitalize ${
                    addType === t ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary"
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {addType === "poem"
                ? availablePoems.map((poem) => (
                    <button
                      key={poem.id}
                      onClick={() => handleAdd(poem.id)}
                      className="w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors"
                    >
                      <p className="text-sm font-medium text-text-primary truncate">{poem.title}</p>
                    </button>
                  ))
                : availablePrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handleAdd(prompt.id)}
                      className="w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors"
                    >
                      <p className="text-sm font-medium text-text-primary truncate italic">&ldquo;{prompt.title}&rdquo;</p>
                    </button>
                  ))}
              {((addType === "poem" && availablePoems.length === 0) || (addType === "prompt" && availablePrompts.length === 0)) && (
                <p className="text-sm text-text-tertiary text-center py-4">No {addType}s available.</p>
              )}
            </div>
            <button onClick={() => setShowAdd(false)} className="mt-4 text-xs text-text-tertiary hover:text-text-primary">Close</button>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title="Remove from featured?"
          message={`This will remove "${confirm.title}" from the featured list.`}
          confirmLabel="Remove"
          danger
          onConfirm={() => handleRemove(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
