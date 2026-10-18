"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Save,
  CheckCircle2,
  Cloud,
  Sparkles,
  X,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AppShell from "@/components/layout/AppShell";
import Toast from "@/components/Toast";
import { Collection } from "@/lib/types";

const typographyOptions = [
  { id: "serif", label: "Newsreader", className: "font-verse" },
  { id: "sans", label: "Jakarta", className: "font-sans" },
  { id: "editorial", label: "Editorial", className: "font-editorial" },
];

const moodOptions = [
  { name: "Midnight", color: "#4A4F7C" },
  { name: "Rain", color: "#6CA4D9" },
  { name: "Lavender", color: "#CEBDFF" },
  { name: "Dawn", color: "#F8ACFF" },
  { name: "Paper", color: "#E0D7C6" },
  { name: "Love", color: "#E879F9" },
  { name: "Solitude", color: "#90CFF1" },
  { name: "Melancholy", color: "#8B7FB0" },
];

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <WritePageInner />
    </Suspense>
  );
}

function WritePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptId = searchParams.get("prompt");
  const draftParam = searchParams.get("draft");

  const [draftId, setDraftId] = useState<string | null>(draftParam || null);
  const [promptInfo, setPromptInfo] = useState<{ id: string; title: string } | null>(null);
  const [title, setTitle] = useState("");
  const [epigraph, setEpigraph] = useState("");
  const [content, setContent] = useState("");
  const [selectedTypography, setSelectedTypography] = useState("serif");
  const [selectedAlignment, setSelectedAlignment] = useState<"left" | "center" | "right">("left");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [tagInput, setTagInput] = useState("");
  const [tagList, setTagList] = useState<string[]>([]);
  const [userCollections, setUserCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  const [showPreview, setShowPreview] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved" | null>(null);

  // Stanza and word counts
  const lines = content.split("\n");
  const stanzaCount = lines.filter((l) => l.trim().length > 0).length > 0
    ? content.split(/\n\s*\n/).filter((s) => s.trim().length > 0).length
    : 0;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 100));

  // Protect against accidental navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSaveStatus === "unsaved" || (content.trim() && autoSaveStatus !== "saved")) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [autoSaveStatus, content]);

  // Load prompt information if responding to a prompt
  useEffect(() => {
    if (!promptId) return;
    (async () => {
      try {
        const { data } = await supabase.from("prompts").select("id, title").eq("id", promptId).single();
        if (data) setPromptInfo(data);
      } catch {
        // ignore
      }
    })();
  }, [promptId]);

  // Load existing draft if present
  useEffect(() => {
    if (!draftParam || !user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("poems")
          .select("*")
          .eq("id", draftParam)
          .eq("author_id", user.id)
          .single();

        if (!error && data) {
          setTitle(data.title || "");
          setContent(data.content || "");
          setSelectedMood(data.mood || null);
          setVisibility(data.visibility === "private" ? "private" : "public");
          if (data.tags && Array.isArray(data.tags)) {
            setTagList(data.tags);
          }
          setDraftId(data.id);
          setAutoSaveStatus("saved");
        }
      } catch {
        // ignore
      }
    })();
  }, [draftParam, user]);

  // Fetch user's collections
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase
          .from("collections")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setUserCollections(data as Collection[]);
      } catch {
        // ignore
      }
    })();
  }, [user]);

  // Reliable Auto-Save
  useEffect(() => {
    if (!user || (!title.trim() && !content.trim())) return;
    setAutoSaveStatus("unsaved");

    const timer = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        const fullContent = epigraph ? `[epigraph: ${epigraph}]\n\n${content}` : content;
        const payload: Record<string, unknown> = {
          author_id: user.id,
          title: title.trim() || "Untitled",
          content: fullContent,
          mood: selectedMood,
          tags: tagList.length > 0 ? tagList : null,
          status: "draft",
          visibility,
        };
        if (promptId) payload.prompt_id = promptId;

        if (draftId) {
          const { error } = await supabase.from("poems").update(payload).eq("id", draftId);
          if (!error) setAutoSaveStatus("saved");
        } else {
          const { data, error } = await supabase.from("poems").insert(payload).select("id").single();
          if (!error && data) {
            setDraftId(data.id);
            setAutoSaveStatus("saved");
          }
        }
      } catch {
        setAutoSaveStatus("unsaved");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, epigraph, content, selectedMood, tagList, visibility, user, draftId, promptId]);

  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter" && e.key !== ",") return;
    if (e) e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, "");
    if (clean && !tagList.includes(clean)) {
      setTagList([...tagList, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagList(tagList.filter((t) => t !== tagToRemove));
  };

  const handleSaveDraft = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      setToast("Write something first");
      return;
    }
    if (!user) {
      setToast("You must be logged in to save drafts");
      return;
    }
    setSaving(true);

    try {
      const fullContent = epigraph ? `[epigraph: ${epigraph}]\n\n${content}` : content;
      const payload: Record<string, unknown> = {
        author_id: user.id,
        title: title.trim() || "Untitled",
        content: fullContent,
        mood: selectedMood,
        tags: tagList.length > 0 ? tagList : null,
        status: "draft",
        visibility,
      };
      if (promptId) payload.prompt_id = promptId;

      if (draftId) {
        const { error } = await supabase.from("poems").update(payload).eq("id", draftId);
        if (error) throw error;
        setAutoSaveStatus("saved");
        setToast("Draft updated");
      } else {
        const { data, error } = await supabase.from("poems").insert(payload).select("id").single();
        if (error) throw error;
        if (data) setDraftId(data.id);
        setAutoSaveStatus("saved");
        setToast("Draft saved");
      }
    } catch {
      setToast("Failed to save draft");
    } finally {
      setSaving(false);
    }
  }, [title, epigraph, content, selectedMood, tagList, visibility, user, draftId, promptId]);

  const handlePublish = async () => {
    if (!content.trim()) {
      setToast("Write poem content before publishing");
      return;
    }
    if (!user) {
      setToast("You must be logged in to publish");
      return;
    }
    setPublishing(true);

    try {
      const fullContent = epigraph ? `[epigraph: ${epigraph}]\n\n${content}` : content;
      const payload: Record<string, unknown> = {
        author_id: user.id,
        title: title.trim() || "Untitled",
        content: fullContent.trim(),
        mood: selectedMood,
        tags: tagList.length > 0 ? tagList : null,
        status: "published",
        visibility,
        published_at: new Date().toISOString(),
      };
      if (promptId) payload.prompt_id = promptId;

      let resultId: string | null = null;

      if (draftId) {
        const { data, error } = await supabase
          .from("poems")
          .update(payload)
          .eq("id", draftId)
          .select("id")
          .single();
        if (error) throw error;
        resultId = data?.id || draftId;
      } else {
        const { data, error } = await supabase
          .from("poems")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        resultId = data?.id || null;
      }

      // Add to collection if selected
      if (resultId && selectedCollectionId) {
        try {
          await supabase.from("collection_poems").insert({
            collection_id: selectedCollectionId,
            poem_id: resultId,
          });
        } catch {
          // ignore if already present or failed
        }
      }

      if (resultId) {
        router.push(`/poem/${resultId}`);
      }
    } catch {
      setToast("Failed to publish poem. Please try again.");
      setPublishing(false);
    }
  };

  const insertEmDash = () => {
    setContent((prev) => prev + "—");
  };

  const insertAsterism = () => {
    setContent((prev) => prev + "\n\n✦ · · ✦\n\n");
  };

  const indentVerse = () => {
    setContent((prev) => prev + "  ");
  };

  const rightPanelContent = (
    <aside className="w-full xl:w-[320px] glass-surface rounded-2xl p-5 space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle/40">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-primary" />
          <h2 className="font-sans font-bold text-xs uppercase tracking-wider text-text-primary">
            Salon Settings
          </h2>
        </div>
        <span className="text-[10px] text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-mono">
          Editorial Mode
        </span>
      </div>

      {/* 1. Anthology / Collection Assignment */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">
          Anthology / Collection
        </label>
        <select
          value={selectedCollectionId}
          onChange={(e) => setSelectedCollectionId(e.target.value)}
          className="w-full bg-surface-secondary/70 border border-border-subtle/50 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/50 cursor-pointer"
        >
          <option value="">No anthology assigned</option>
          {userCollections.map((col) => (
            <option key={col.id} value={col.id}>
              {col.title}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Publishing Visibility */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">
          Publishing Visibility
        </label>
        <div className="space-y-2">
          <label
            onClick={() => setVisibility("public")}
            className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
              visibility === "public"
                ? "bg-primary/10 border-primary/40"
                : "bg-surface-secondary/40 border-border-subtle/40 hover:bg-surface-secondary/70"
            }`}
          >
            <input
              type="radio"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
              className="mt-1 text-primary focus:ring-0"
            />
            <div className="text-left">
              <span className="font-semibold text-xs text-text-primary flex items-center gap-1.5">
                <span>Public Salon</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </span>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                Visible to all salon readers &amp; curated anthology feeds
              </p>
            </div>
          </label>

          <label
            onClick={() => setVisibility("private")}
            className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
              visibility === "private"
                ? "bg-primary/10 border-primary/40"
                : "bg-surface-secondary/40 border-border-subtle/40 hover:bg-surface-secondary/70"
            }`}
          >
            <input
              type="radio"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
              className="mt-1 text-primary focus:ring-0"
            />
            <div className="text-left">
              <span className="font-semibold text-xs text-text-primary">
                Quiet Draft (Private)
              </span>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                Saved solely in your personal sanctuary notebook
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Atmosphere & Mood */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">
          Atmospheric Tone
        </label>
        <div className="flex flex-wrap gap-1.5">
          {moodOptions.map((mood) => {
            const isSelected = selectedMood === mood.name;
            return (
              <button
                key={mood.name}
                type="button"
                onClick={() => setSelectedMood(isSelected ? null : mood.name)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/20 border-primary/60 text-primary font-semibold"
                    : "glass-pill text-text-secondary hover:text-text-primary"
                }`}
              >
                #{mood.name.toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Literary Motifs & Tags */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">
          Literary Motifs &amp; Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {tagList.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs flex items-center gap-1 font-medium"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag and press Enter..."
            className="w-full bg-surface-secondary/70 border border-border-subtle/50 rounded-xl px-3 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={() => handleAddTag()}
            className="px-3 py-1.5 rounded-xl glass-pill text-xs font-semibold text-text-secondary hover:text-primary transition-colors shrink-0"
          >
            Add
          </button>
        </div>
      </div>

      {/* Footnote */}
      <div className="pt-4 border-t border-border-subtle/30 flex items-center justify-between text-[11px] text-text-tertiary font-verse italic">
        <span>Poetly Writing Studio</span>
        <span>Crafted for quiet words</span>
      </div>
    </aside>
  );

  return (
    <AppShell maxWidth="wide" rightRail={!focusMode ? rightPanelContent : undefined}>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* SUB-BAR / EDITOR ACTION BAR */}
        <div className="glass-surface rounded-2xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-20 z-20 specular-top-border">
          {/* Breadcrumb & Autosave Telemetry */}
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="flex items-center gap-1.5 text-text-tertiary hover:text-primary text-xs font-medium transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </Link>

            <span className="w-px h-3.5 bg-border-subtle/50" />

            {/* Autosave Status */}
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-mono">
              {autoSaveStatus === "saving" ? (
                <>
                  <Cloud size={14} className="text-primary animate-pulse" />
                  <span className="hidden sm:inline">Saving draft...</span>
                </>
              ) : autoSaveStatus === "saved" ? (
                <>
                  <CheckCircle2 size={13} className="text-primary" />
                  <span className="hidden sm:inline">Draft saved</span>
                </>
              ) : (
                <span className="text-text-tertiary/70 hidden sm:inline">Unsaved draft</span>
              )}
            </div>

            {/* Telemetry Pill */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-text-tertiary bg-surface-secondary/60 px-2.5 py-0.5 rounded-full border border-border-subtle/40 font-mono">
              <span>{stanzaCount} {stanzaCount === 1 ? "stanza" : "stanzas"}</span>
              <span>·</span>
              <span>{wordCount} words</span>
              <span>·</span>
              <span>~{readTimeMin} min read</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Focus Mode Toggle */}
            <button
              type="button"
              onClick={() => setFocusMode(!focusMode)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                focusMode
                  ? "bg-primary/20 border-primary text-primary"
                  : "glass-pill text-text-secondary hover:text-text-primary"
              }`}
              title={focusMode ? "Exit Focus Mode" : "Focus Mode"}
            >
              {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span className="hidden sm:inline">{focusMode ? "Exit Focus" : "Focus"}</span>
            </button>

            {/* Preview Button */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                showPreview
                  ? "bg-primary/20 border-primary text-primary"
                  : "glass-pill text-text-secondary hover:text-text-primary"
              }`}
            >
              <Eye size={14} />
              <span>{showPreview ? "Edit" : "Preview"}</span>
            </button>

            {/* Mobile Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="xl:hidden p-1.5 rounded-lg glass-pill text-text-secondary hover:text-primary"
              title="Salon Settings"
            >
              <Sliders size={15} />
            </button>

            {/* Save Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-full glass-pill hover:border-primary/40 text-xs font-semibold text-text-secondary hover:text-primary transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <Save size={13} />
              <span className="hidden sm:inline">{saving ? "Saving..." : "Save Draft"}</span>
            </button>

            {/* Primary Glowing Action: Publish to Salon */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || !content.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-container to-secondary text-white font-semibold text-xs tracking-wider glowing-btn-aura hover:opacity-95 transition-all disabled:opacity-40 cursor-pointer active:scale-95"
            >
              <span>{publishing ? "Publishing..." : "Publish Poem"}</span>
              <span className="text-xs">✦</span>
            </button>
          </div>
        </div>

        {/* EDITORIAL CANVAS */}
        <div className="glass-surface rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden space-y-6">
          {/* Daily Prompt Ambient Notification Pill */}
          {promptInfo && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-tertiary/15 via-surface-secondary/40 to-transparent border border-tertiary/30 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles size={18} className="text-tertiary shrink-0" />
                <div className="text-xs sm:text-sm truncate">
                  <span className="text-text-tertiary">Writing to Prompt:</span>
                  <span className="font-semibold text-text-primary italic ml-1.5">
                    &ldquo;{promptInfo.title}&rdquo;
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-tertiary px-2 py-0.5 rounded-full bg-tertiary/20 border border-tertiary/30 font-mono">
                  Prompt Seeded
                </span>
                <button
                  type="button"
                  onClick={() => setPromptInfo(null)}
                  className="text-text-tertiary hover:text-text-primary p-0.5 cursor-pointer"
                  title="Unlink Prompt"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {showPreview ? (
            <div className="py-6 space-y-8 animate-fade-in">
              <div className="text-[11px] uppercase tracking-widest text-primary font-mono font-bold">
                Live Salon Preview
              </div>
              <h1 className="font-display italic text-3xl sm:text-4xl md:text-5xl text-text-primary font-light tracking-tight">
                {title || "Untitled"}
              </h1>
              {epigraph && (
                <p className="font-verse italic text-base sm:text-lg text-text-secondary font-light">
                  &ldquo;{epigraph}&rdquo;
                </p>
              )}
              <div
                className={`text-lg sm:text-xl text-text-primary/95 leading-[2.1] whitespace-pre-line font-light ${
                  selectedTypography === "serif"
                    ? "font-verse"
                    : selectedTypography === "editorial"
                    ? "font-editorial"
                    : "font-sans"
                }`}
                style={{ textAlign: selectedAlignment }}
              >
                {content || "Your poem will appear here..."}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Poem Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title your poem..."
                className="w-full bg-transparent border-0 font-display italic text-3xl sm:text-4xl md:text-5xl text-text-primary placeholder:text-text-tertiary/40 font-light tracking-tight focus:outline-none focus:ring-0 p-0"
              />

              {/* Epigraph / Dedication Input */}
              <input
                type="text"
                value={epigraph}
                onChange={(e) => setEpigraph(e.target.value)}
                placeholder="An epigraph, dedication, or note (optional)..."
                className="w-full bg-transparent border-0 font-verse italic text-base sm:text-lg text-text-secondary placeholder:text-text-tertiary/30 font-light focus:outline-none focus:ring-0 p-0 border-b border-border-subtle/30 pb-3"
              />

              {/* Poetic Stanza Canvas */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="We left the lantern burning at the rim of the orchard..."
                className={`w-full bg-transparent border-0 text-lg sm:text-xl text-text-primary/90 placeholder:text-text-tertiary/30 leading-[2.1] font-light focus:outline-none focus:ring-0 resize-none min-h-[50vh] p-0 ${
                  selectedTypography === "serif"
                    ? "font-verse"
                    : selectedTypography === "editorial"
                    ? "font-editorial"
                    : "font-sans"
                }`}
                style={{ textAlign: selectedAlignment }}
              />
            </div>
          )}

          {/* FLOATING LITERARY TOOLBAR */}
          <div className="sticky bottom-6 z-30 flex justify-center pt-6">
            <div className="glass-panel-elevated px-4 py-2 rounded-full flex items-center gap-3 shadow-xl border border-white/10">
              {/* Indent control */}
              <button
                type="button"
                onClick={indentVerse}
                className="p-1.5 rounded-lg text-text-secondary hover:text-primary transition-colors cursor-pointer text-xs font-mono"
                title="Add Caesura / Indent"
              >
                ⇥
              </button>

              <span className="w-px h-4 bg-border-subtle/50" />

              {/* Special punctuation */}
              <button
                type="button"
                onClick={insertEmDash}
                className="px-2 py-1 rounded text-xs font-mono text-text-secondary hover:text-primary transition-colors cursor-pointer"
                title="Insert Em-dash (—)"
              >
                —
              </button>
              <button
                type="button"
                onClick={insertAsterism}
                className="p-1 rounded text-primary hover:opacity-80 transition-colors cursor-pointer text-xs"
                title="Insert Asterism Divider (✦ · · ✦)"
              >
                ✦
              </button>

              <span className="w-px h-4 bg-border-subtle/50" />

              {/* Typography options */}
              <div className="flex items-center gap-1">
                {typographyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedTypography(opt.id)}
                    className={`px-2.5 py-1 text-xs rounded-full transition-all cursor-pointer ${
                      selectedTypography === opt.id
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-text-tertiary hover:text-text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <span className="w-px h-4 bg-border-subtle/50" />

              {/* Alignment options */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedAlignment("left")}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    selectedAlignment === "left" ? "text-primary" : "text-text-tertiary hover:text-text-primary"
                  }`}
                  title="Align Left"
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAlignment("center")}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    selectedAlignment === "center" ? "text-primary" : "text-text-tertiary hover:text-text-primary"
                  }`}
                  title="Align Center"
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAlignment("right")}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    selectedAlignment === "right" ? "text-primary" : "text-text-tertiary hover:text-text-primary"
                  }`}
                  title="Align Right"
                >
                  <AlignRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Settings Modal / Drawer */}
        {showSettingsDrawer && (
          <div className="xl:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md max-h-[85vh] overflow-y-auto">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSettingsDrawer(false)}
                  className="absolute right-4 top-4 text-text-tertiary hover:text-text-primary z-10 p-1"
                >
                  <X size={18} />
                </button>
                {rightPanelContent}
              </div>
            </div>
          </div>
        )}

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </AppShell>
  );
}

