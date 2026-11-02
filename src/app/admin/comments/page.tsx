"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Trash2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Database } from "@/lib/database.types";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";
import Toast from "@/components/Toast";

type Comment = Database["public"]["Tables"]["comments"]["Row"];
type CommentWithAuthor = Comment & { profiles: Database["public"]["Tables"]["profiles"]["Row"] };

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [confirm, setConfirm] = useState<{ commentId: string; content: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (reset = false, customPage?: number) => {
    setLoading(true);
    setError(null);
    try {
      const pageToFetch = reset ? 0 : customPage !== undefined ? customPage : page;
      const res = await fetch(`/api/admin/data?type=comments&page=${pageToFetch}&search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed to load comments");
      const json = await res.json();
      const typedData = (json.comments as CommentWithAuthor[]) || [];

      if (reset) {
        setComments(typedData);
        setPage(0);
      } else {
        setComments((prev) => (pageToFetch === 0 ? typedData : [...prev, ...typedData]));
      }
      setHasMore(Boolean(json.hasMore));
    } catch (err) {
      setError("Failed to load comments.");
      console.error("Fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComments(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (commentId: string, content: string) => {
    setConfirm(null);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_comment",
          commentId,
          content,
        }),
      });
      if (!res.ok) throw new Error("Delete comment failed");
      setToast("Comment deleted.");
      fetchComments(true);
    } catch (err) {
      setToast("Failed to delete comment.");
      console.error("Delete comment error:", err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Comments</h1>
        <p className="text-sm text-text-secondary">Moderate user comments.</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search comments..."
          className="w-full bg-surface border border-border-default rounded-[var(--radius-sm)] pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-text-primary transition-colors"
        />
      </div>

      {error && (
        <div className="bg-surface-secondary border border-border-default rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-text-primary">{error}</p>
        </div>
      )}

      {loading && comments.length === 0 ? (
        <AdminSkeleton rows={8} />
      ) : comments.length > 0 ? (
        <>
          <div className="space-y-0">
            {comments.map((comment) => (
              <div key={comment.id} className="py-4 border-b border-border-default group">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-text-primary">{comment.profiles?.display_name || "Unknown"}</span>
                      <span className="text-[10px] text-text-tertiary">@{comment.profiles?.username}</span>
                      <span className="text-[10px] text-text-tertiary">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">{comment.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Link href={`/poem/${comment.poem_id}`} className="text-[10px] text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1">
                        View poem <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirm({ commentId: comment.id, content: comment.content })}
                    className="p-1.5 text-text-tertiary hover:text-error transition-colors opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title="Delete comment"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-text-tertiary">
              Showing {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPage(Math.max(0, page - 1)); fetchComments(true); }}
                disabled={page === 0}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-text-tertiary">Page {page + 1}</span>
              <button
                onClick={() => { setPage(page + 1); fetchComments(false); }}
                disabled={!hasMore || loading}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <AdminEmptyState
          title={search ? "No comments found" : "No comments yet"}
          description={search ? "No comments match your search." : "No comments have been posted yet."}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete this comment?"
          message={`This will permanently delete: "${confirm.content.slice(0, 100)}${confirm.content.length > 100 ? "..." : ""}"`}
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDelete(confirm.commentId, confirm.content)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
