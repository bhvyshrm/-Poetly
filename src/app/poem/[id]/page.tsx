"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ArrowLeft,
  Edit2,
  Trash2,
  Flag,
  PenTool,
  Sparkles,
  BookOpen,
  Clock,
  Send,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor, CommentWithAuthor } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import AppShell from "@/components/layout/AppShell";
import Toast from "@/components/Toast";
import Avatar from "@/components/ui/Avatar";

export default function PoemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [poem, setPoem] = useState<PoemWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const { user } = useAuth();
  const [responseCount, setResponseCount] = useState(0);

  const fetchPoemDetails = useCallback(async () => {
    try {
      const { data: poemData, error: poemError } = await supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("id", id)
        .single();

      if (poemError || !poemData) {
        setPoem(null);
        setLoading(false);
        return;
      }

      setPoem(poemData as PoemWithAuthor);

      const [likesRes, savesRes, resCountRes, commentData] = await Promise.all([
        supabase.from("likes").select("*", { count: "exact", head: true }).eq("poem_id", id),
        user
          ? supabase.from("saves").select("id").eq("poem_id", id).eq("user_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from("responses").select("*", { count: "exact", head: true }).eq("original_poem_id", id),
        supabase
          .from("comments")
          .select("*, profiles!inner(*)")
          .eq("poem_id", id)
          .order("created_at", { ascending: true }),
      ]);

      setLikeCount(likesRes.count || 0);
      setIsSaved(Boolean(savesRes.data));
      setResponseCount(resCountRes.count || 0);
      setComments((commentData.data as CommentWithAuthor[]) || []);

      if (user) {
        const { data: existingLike } = await supabase
          .from("likes")
          .select("id")
          .eq("poem_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        setIsLiked(Boolean(existingLike));
      }
    } catch {
      setToast("Failed to load poem");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchPoemDetails();
  }, [fetchPoemDetails]);

  const poemContent = poem?.content;
  const wordCount = useMemo(() => {
    if (!poemContent) return 0;
    return poemContent.trim().split(/\s+/).filter(Boolean).length;
  }, [poemContent]);

  const stanzaCount = useMemo(() => {
    if (!poemContent) return 0;
    return poemContent.trim().split(/\n\s*\n/).filter(Boolean).length;
  }, [poemContent]);

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 120));
  }, [wordCount]);

  const handleLike = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/poem/${id}`)}`);
      return;
    }
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      if (previousLiked) {
        const { error } = await supabase.from("likes").delete().eq("poem_id", id).eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("likes").insert({ user_id: user.id, poem_id: id });
        if (error) throw error;

        if (poem && user.id !== poem.author_id) {
          await supabase.from("notifications").insert({
            recipient_id: poem.author_id,
            actor_id: user.id,
            type: "like",
            reference_id: id,
          });
        }
      }
    } catch {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      setToast("Failed to update like");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/poem/${id}`)}`);
      return;
    }
    setSubmittingComment(true);

    try {
      const { error } = await supabase.from("comments").insert({
        poem_id: id,
        author_id: user.id,
        content: commentText.trim(),
      });

      if (error) throw error;

      setCommentText("");
      const { data: updatedComments } = await supabase
        .from("comments")
        .select("*, profiles!inner(*)")
        .eq("poem_id", id)
        .order("created_at", { ascending: true });

      setComments((updatedComments as CommentWithAuthor[]) || []);

      if (poem && user.id !== poem.author_id) {
        await supabase.from("notifications").insert({
          recipient_id: poem.author_id,
          actor_id: user.id,
          type: "comment",
          reference_id: id,
        });
      }
      setToast("Marginalia note inscribed");
    } catch {
      setToast("Failed to post note");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("author_id", user.id);

      if (!error) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setToast("Note erased");
      }
    } catch {
      setToast("Failed to delete note");
    }
  };

  const handleSave = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/poem/${id}`)}`);
      return;
    }
    const previousSaved = isSaved;
    setIsSaved(!previousSaved);

    try {
      if (previousSaved) {
        const { error } = await supabase.from("saves").delete().eq("poem_id", id).eq("user_id", user.id);
        if (error) throw error;
        setToast("Poem removed from sanctuary shelf");
      } else {
        const { error } = await supabase.from("saves").insert({ user_id: user.id, poem_id: id });
        if (error) throw error;
        setToast("Poem preserved in your library");
      }
    } catch {
      setIsSaved(previousSaved);
      setToast("Failed to save poem");
    }
  };

  const handleDeletePoem = async () => {
    if (!poem || !user || user.id !== poem.author_id) return;
    if (!window.confirm("Are you sure you want to permanently delete this poem? This cannot be undone.")) return;

    try {
      const { error } = await supabase.from("poems").delete().eq("id", id);
      if (error) throw error;
      setToast("Poem deleted");
      router.push("/home");
    } catch {
      setToast("Failed to delete poem");
    }
  };

  const handleReport = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/poem/${id}`)}`);
      return;
    }
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        target_type: "poem",
        target_id: id,
        reason: "Inappropriate or abusive content",
      });
      if (error) throw error;
      setToast("Thank you. Curators notified for review.");
    } catch {
      setToast("Failed to submit report");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: poem?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setToast("Link copied to clipboard");
    }
  };

  const rightRailContent = poem ? (
    <div className="space-y-6">
      {/* Poet Identity Card */}
      <section className="glass-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold">
          <BookOpen size={14} className="text-primary" />
          <span>About the Poet</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/profile/${poem.profiles.username}`} className="shrink-0">
            <Avatar
              src={poem.profiles.profile_image}
              name={poem.profiles.display_name}
              size="lg"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/profile/${poem.profiles.username}`}
              className="font-display text-lg text-text-primary hover:text-primary transition-colors block truncate"
            >
              {poem.profiles.display_name}
            </Link>
            <p className="text-xs text-text-tertiary truncate">@{poem.profiles.username}</p>
          </div>
        </div>
        {poem.profiles.bio && (
          <p className="font-verse italic text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
            &ldquo;{poem.profiles.bio}&rdquo;
          </p>
        )}
        <div className="pt-1">
          <Link
            href={`/profile/${poem.profiles.username}`}
            className="w-full text-center py-2 px-3 rounded-full glass-surface border border-border-subtle/50 hover:border-primary/40 text-xs font-semibold text-text-primary hover:text-primary transition-colors block"
          >
            View Author Sanctuary →
          </Link>
        </div>
      </section>

      {/* Stanza Telemetry */}
      <section className="glass-surface rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-secondary font-mono text-xs font-semibold">
          <Sparkles size={14} />
          <span>Reading Telemetry</span>
        </div>
        <div className="space-y-2.5 pt-1 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/30">
            <span className="text-text-tertiary flex items-center gap-1.5">
              <Clock size={12} />
              Read Duration
            </span>
            <span className="font-mono text-text-primary">~{readingTimeMinutes} min</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/30">
            <span className="text-text-tertiary">Composition</span>
            <span className="font-mono text-text-primary">{stanzaCount} stanzas · {wordCount} words</span>
          </div>
          {poem.mood && (
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/30">
              <span className="text-text-tertiary">Atmosphere Mood</span>
              <span className="font-mono text-secondary capitalize">{poem.mood}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Published</span>
            <span className="font-mono text-[11px] text-text-tertiary">
              {new Date(poem.published_at || poem.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Action Badges */}
      <section className="space-y-2">
        <Link
          href={`/poem/${id}/respond`}
          className="w-full py-2.5 px-4 rounded-full gradient-brand text-white text-xs font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <PenTool size={13} />
          <span>Inscribe Resonant Response</span>
        </Link>
        <Link
          href={`/poem/${id}/canvas`}
          className="w-full py-2.5 px-4 rounded-full glass-surface border border-border-subtle/50 hover:border-secondary/40 text-xs font-semibold text-text-primary hover:text-secondary transition-colors flex items-center justify-center gap-2"
        >
          <Palette size={13} />
          <span>Format as Canvas Folio</span>
        </Link>
      </section>
    </div>
  ) : null;

  if (loading) {
    return (
      <AppShell maxWidth="wide">
        <div className="py-12 space-y-6">
          <div className="w-32 h-4 skeleton rounded" />
          <div className="w-12 h-12 skeleton rounded-full" />
          <div className="w-3/4 h-12 skeleton rounded-2xl" />
          <div className="space-y-3 pt-4">
            <div className="w-full h-5 skeleton rounded" />
            <div className="w-5/6 h-5 skeleton rounded" />
            <div className="w-4/5 h-5 skeleton rounded" />
            <div className="w-2/3 h-5 skeleton rounded" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!poem) {
    return (
      <AppShell maxWidth="wide">
        <div className="py-20 text-center glass-surface rounded-2xl p-8 border border-border-subtle/40 space-y-4">
          <p className="font-display text-2xl text-text-primary">Stanza Not Found</p>
          <p className="font-verse italic text-text-tertiary max-w-sm mx-auto">
            This poem may have been returned to silence or withdrawn by its author.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white gradient-brand rounded-full hover:opacity-95 shadow-md shadow-primary/20 transition-all"
          >
            <ArrowLeft size={13} />
            <span>Return to Salon</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  const isAuthor = user && user.id === poem.author_id;

  return (
    <AppShell maxWidth="wide" rightRail={rightRailContent}>
      <article className="py-2 sm:py-4 space-y-8 animate-fade-in">
        {/* Navigation & Controls Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Salon</span>
          </button>

          <div className="flex items-center gap-2">
            {isAuthor && (
              <>
                <Link
                  href={`/poem/${id}/edit`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-primary px-3 py-1.5 rounded-full glass-surface border border-border-subtle/50 hover:border-primary/40 transition-colors"
                >
                  <Edit2 size={12} />
                  <span>Edit Stanza</span>
                </Link>
                <button
                  onClick={handleDeletePoem}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-red-400 px-3 py-1.5 rounded-full glass-surface border border-border-subtle/50 hover:border-red-400/40 transition-colors cursor-pointer"
                  title="Delete poem"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
            <button
              onClick={handleShare}
              className="p-2 rounded-full glass-surface border border-border-subtle/50 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              title="Share stanza"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* Reading Desk Canvas Card */}
        <section className="glass-surface rounded-3xl p-6 sm:p-10 md:p-12 border border-border-subtle/50 specular-top-border space-y-8 relative overflow-hidden">
          {/* Subtle mood gradient overlay if present */}
          {poem.mood && (
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          )}

          {/* Poet Header inside Desk */}
          <div className="flex items-center gap-3.5 pb-6 border-b border-border-subtle/30">
            <Link href={`/profile/${poem.profiles.username}`} className="shrink-0">
              <Avatar
                src={poem.profiles.profile_image}
                name={poem.profiles.display_name}
                size="md"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${poem.profiles.username}`}
                className="font-medium text-sm text-text-primary hover:text-primary transition-colors block truncate"
              >
                {poem.profiles.display_name}
              </Link>
              <p className="font-mono text-[11px] text-text-tertiary">
                @{poem.profiles.username} · {new Date(poem.published_at || poem.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-text-primary font-light tracking-tight leading-tight">
            {poem.title}
          </h1>

          {/* Literary Verse Body */}
          <div className="font-verse text-lg sm:text-xl text-stone-800 dark:text-stone-200 leading-loose sm:leading-[2.2] tracking-normal whitespace-pre-line font-light selection:bg-primary/20 selection:text-white">
            {poem.content}
          </div>

          {/* Asterism Ornament */}
          <div className="pt-6 pb-2 text-center text-text-tertiary/40 font-serif text-lg tracking-[0.5em] select-none">
            ⁂
          </div>

          {/* Tags */}
          {poem.tags && poem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {poem.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?tag=${encodeURIComponent(tag)}`}
                  className="text-xs font-mono text-text-tertiary hover:text-primary px-3 py-1 rounded-full glass-surface border border-border-subtle/40 hover:border-primary/40 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-border-subtle/30">
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isLiked
                    ? "text-rose-400 font-semibold"
                    : "text-text-tertiary hover:text-text-primary"
                }`}
                title={isLiked ? "Unlike" : "Appreciate stanza"}
              >
                <Heart
                  size={17}
                  className={isLiked ? "fill-rose-400 text-rose-400 scale-110" : "text-text-tertiary"}
                />
                <span className="font-mono">{likeCount}</span>
              </button>

              <a
                href="#marginalia"
                className="flex items-center gap-1.5 text-xs sm:text-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                <MessageCircle size={17} />
                <span className="font-mono">{comments.length}</span>
              </a>

              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isSaved ? "text-primary" : "text-text-tertiary hover:text-text-primary"
                }`}
                title={isSaved ? "Remove bookmark" : "Preserve on shelf"}
              >
                <Bookmark
                  size={17}
                  className={isSaved ? "fill-primary text-primary" : "text-text-tertiary"}
                />
                <span className="hidden sm:inline text-xs">{isSaved ? "Preserved" : "Bookmark"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {responseCount > 0 && (
                <Link
                  href={`/poem/${id}/responses`}
                  className="text-xs font-semibold text-secondary hover:underline font-mono"
                >
                  {responseCount} {responseCount === 1 ? "response stanza" : "responses"} →
                </Link>
              )}
              <button
                onClick={handleReport}
                className="text-text-tertiary hover:text-red-400 transition-colors p-1"
                title="Report content"
              >
                <Flag size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* Resonant Response Invitation */}
        <section className="glass-surface rounded-2xl p-6 sm:p-8 border border-secondary/30 relative overflow-hidden text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center mx-auto text-secondary">
            <PenTool size={18} />
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl text-text-primary font-normal">
              Not a Comment. A Poem.
            </h3>
            <p className="font-verse italic text-xs sm:text-sm text-text-secondary max-w-md mx-auto mt-1">
              Answer verse with verse. Allow your resonance to take literary form in our salon.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/poem/${id}/respond`}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full gradient-brand text-white text-xs font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition-all"
            >
              Respond with a Poem
            </Link>
            <Link
              href={`/poem/${id}/canvas`}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full glass-surface border border-border-subtle/50 text-text-primary hover:border-primary/40 text-xs font-semibold transition-colors"
            >
              Format as Canvas
            </Link>
          </div>
        </section>

        {/* Marginalia Stream (Comments) */}
        <section id="marginalia" className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl text-text-primary font-light">
              Marginalia &amp; Reader Notes
            </h3>
            <span className="font-mono text-xs text-text-tertiary px-2.5 py-0.5 rounded-full glass-surface border border-border-subtle/40">
              {comments.length} {comments.length === 1 ? "note" : "notes"}
            </span>
          </div>

          {/* New Marginalia Form */}
          <div className="glass-surface rounded-2xl p-4 sm:p-5 border border-border-subtle/50 space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Inscribe a marginalia note for the author..."
              className="w-full bg-surface-secondary/60 border border-border-subtle/50 focus:border-primary rounded-xl outline-none p-3.5 text-sm text-text-primary placeholder:text-text-tertiary resize-none font-sans transition-colors"
              rows={3}
            />
            <div className="flex justify-end">
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || submittingComment}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white gradient-brand rounded-full hover:opacity-95 disabled:opacity-40 shadow-sm shadow-primary/20 transition-all cursor-pointer"
              >
                <Send size={12} />
                <span>{submittingComment ? "Inscribing..." : "Inscribe Note"}</span>
              </button>
            </div>
          </div>

          {/* Notes List */}
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="glass-surface rounded-2xl p-4 sm:p-5 border border-border-subtle/40 flex gap-3.5 group transition-colors hover:border-primary/30"
                >
                  <Avatar
                    src={comment.profiles?.profile_image}
                    name={comment.profiles?.display_name || "Reader"}
                    size="sm"
                    className="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${comment.profiles?.username}`}
                          className="text-xs font-semibold text-text-primary hover:text-primary transition-colors"
                        >
                          {comment.profiles?.display_name || "Reader"}
                        </Link>
                        <span className="font-mono text-[10px] text-text-tertiary">
                          @{comment.profiles?.username}
                        </span>
                        <span className="text-text-tertiary/40">·</span>
                        <span className="font-mono text-[10px] text-text-tertiary">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {user && (user.id === comment.author_id || user.id === poem.author_id) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-opacity p-1 cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 glass-surface rounded-2xl p-6 border border-border-subtle/30">
              <p className="font-verse italic text-xs sm:text-sm text-text-tertiary">
                No marginalia inscribed yet. Be the first reader to leave a note on this stanza.
              </p>
            </div>
          )}
        </section>
      </article>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
