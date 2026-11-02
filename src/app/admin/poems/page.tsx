"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Star, EyeOff, RotateCcw, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Database } from "@/lib/database.types";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";
import Toast from "@/components/Toast";

type Poem = Database["public"]["Tables"]["poems"]["Row"];
type PoemWithAuthor = Poem & { profiles: Database["public"]["Tables"]["profiles"]["Row"] };

export default function AdminPoemsPage() {
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "hidden" | "removed" | "draft">("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [confirm, setConfirm] = useState<{ action: string; poemId: string; poemTitle: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPoems = useCallback(async (reset = false, customPage?: number) => {
    setLoading(true);
    setError(null);
    try {
      const pageToFetch = reset ? 0 : customPage !== undefined ? customPage : page;
      const res = await fetch(`/api/admin/data?type=poems&page=${pageToFetch}&filter=${filter}`);
      if (!res.ok) throw new Error("Failed to load poems");
      const json = await res.json();
      const typedData = (json.poems as PoemWithAuthor[]) || [];

      if (reset) {
        setPoems(typedData);
        setPage(0);
      } else {
        setPoems((prev) => (pageToFetch === 0 ? typedData : [...prev, ...typedData]));
      }
      setHasMore(Boolean(json.hasMore));
    } catch (err) {
      setError("Failed to load poems. Please try again.");
      console.error("Fetch poems error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchPoems(true);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (action: string, poemId: string, poemTitle: string) => {
    setConfirm(null);

    try {
      let body: Record<string, unknown>;
      switch (action) {
        case "feature":
          body = { action: "add_featured", contentType: "poem", contentId: poemId };
          break;
        case "hide":
          body = { action: "set_poem_status", poemId, status: "hidden", poemTitle };
          break;
        case "restore":
          body = { action: "set_poem_status", poemId, status: "published", poemTitle };
          break;
        case "delete":
          body = { action: "set_poem_status", poemId, status: "removed", poemTitle };
          break;
        default:
          return;
      }

      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Action failed");

      if (action === "feature") setToast("Poem featured successfully.");
      else if (action === "hide") setToast("Poem hidden.");
      else if (action === "restore") setToast("Poem restored to published.");
      else if (action === "delete") setToast("Poem removed.");

      fetchPoems(true);
    } catch (err) {
      setToast("Action failed. Please try again.");
      console.error("Poem action error:", err);
    }
  };

  const filters = [
    { id: "all" as const, label: "All" },
    { id: "published" as const, label: "Published" },
    { id: "draft" as const, label: "Drafts" },
    { id: "hidden" as const, label: "Hidden" },
    { id: "removed" as const, label: "Removed" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Poems</h1>
        <p className="text-sm text-text-secondary">Manage poem content.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-surface-secondary rounded-[var(--radius-full)] p-1 max-w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filter === f.id ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-error-subtle border border-error/20 rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {loading && poems.length === 0 ? (
        <AdminSkeleton rows={8} />
      ) : poems.length > 0 ? (
        <>
          <div className="space-y-0">
            {poems.map((poem) => (
              <div key={poem.id} className="flex items-center gap-4 py-4 border-b border-border-default group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/poem/${poem.id}`} className="text-sm font-medium text-text-primary hover:underline transition-colors truncate">
                      {poem.title}
                    </Link>
                    <ExternalLink size={12} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    <span>{poem.profiles?.display_name || "Unknown"}</span>
                    <span>{new Date(poem.created_at).toLocaleDateString()}</span>
                    {poem.visibility !== "public" && (
                      <span className="text-text-tertiary text-[10px] uppercase">{poem.visibility}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <StatusBadge status={poem.status} />
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setConfirm({ action: "feature", poemId: poem.id, poemTitle: poem.title })}
                    className="p-1.5 text-text-tertiary hover:text-text-primary transition-colors"
                    title="Feature"
                  >
                    <Star size={14} strokeWidth={1.5} />
                  </button>
                  {poem.status === "hidden" ? (
                    <button
                      onClick={() => setConfirm({ action: "restore", poemId: poem.id, poemTitle: poem.title })}
                      className="p-1.5 text-text-tertiary hover:text-success transition-colors"
                      title="Restore"
                    >
                      <RotateCcw size={14} strokeWidth={1.5} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirm({ action: "hide", poemId: poem.id, poemTitle: poem.title })}
                      className="p-1.5 text-text-tertiary hover:text-warning transition-colors"
                      title="Hide"
                    >
                      <EyeOff size={14} strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirm({ action: "delete", poemId: poem.id, poemTitle: poem.title })}
                    className="p-1.5 text-text-tertiary hover:text-error transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-text-tertiary">
              Showing {poems.length} poem{poems.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPage(Math.max(0, page - 1)); fetchPoems(true); }}
                disabled={page === 0}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-text-tertiary">Page {page + 1}</span>
              <button
                onClick={() => { setPage(page + 1); fetchPoems(false); }}
                disabled={!hasMore || loading}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <AdminEmptyState title="No poems found" description={filter === "all" ? "No poems exist yet." : `No ${filter} poems.`} />
      )}

      {confirm && (
        <ConfirmDialog
          title={
            confirm.action === "feature" ? "Feature this poem?" :
            confirm.action === "hide" ? "Hide this poem?" :
            confirm.action === "restore" ? "Restore this poem?" :
            "Remove this poem?"
          }
          message={
            confirm.action === "delete"
              ? `This will permanently remove "${confirm.poemTitle}" from Poetly.`
              : confirm.action === "hide"
              ? `This will hide "${confirm.poemTitle}" from public view.`
              : `Perform this action on "${confirm.poemTitle}"?`
          }
          confirmLabel={
            confirm.action === "feature" ? "Feature" :
            confirm.action === "hide" ? "Hide" :
            confirm.action === "restore" ? "Restore" :
            "Remove"
          }
          danger={confirm.action === "delete"}
          onConfirm={() => handleAction(confirm.action, confirm.poemId, confirm.poemTitle)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
