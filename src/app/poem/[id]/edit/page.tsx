"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Palette, Trash2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { useAuth } from "@/components/AuthProvider";
import AppShell from "@/components/layout/AppShell";
import Toast from "@/components/Toast";

type Poem = Database["public"]["Tables"]["poems"]["Row"];

const typographyOptions = [
  { id: "serif", label: "Serif", className: "font-poem" },
  { id: "sans", label: "Sans", className: "font-sans" },
  { id: "editorial", label: "Editorial", className: "font-editorial" },
];

const alignmentOptions = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
];

const moodOptions = [
  { name: "Midnight", color: "#4A4F7C" },
  { name: "Rain", color: "#6CA4D9" },
  { name: "Love", color: "#E89AC7" },
  { name: "Hope", color: "#7BC4A0" },
  { name: "Melancholy", color: "#8B7FB0" },
];

export default function EditPoemPage() {
  const router = useRouter();
  const params = useParams();
  const poemId = params.id as string;

  const [poem, setPoem] = useState<Poem | null>(null);
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTypography, setSelectedTypography] = useState("serif");
  const [selectedAlignment, setSelectedAlignment] = useState("left");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [showCanvas, setShowCanvas] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!poemId || authLoading) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/poem/${poemId}/edit`)}`);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from("poems")
          .select("*")
          .eq("id", poemId)
          .single();

        if (error || !data) {
          setToast("Poem not found");
          router.push("/home");
          return;
        }

        if (user.id !== data.author_id) {
          setToast("You can only edit your own poems");
          router.push(`/poem/${poemId}`);
          return;
        }

        setPoem(data);
        setTitle(data.title || "");
        setContent(data.content);
        setSelectedMood(data.mood);
        setTags(data.tags?.join(", ") || "");
      } catch {
        setToast("Failed to load poem");
      } finally {
        setLoading(false);
      }
    })();
  }, [poemId, router, user, authLoading]);

  const handleSave = async () => {
    if (!poem || !content.trim()) {
      setToast("Write something first");
      return;
    }
    setSaving(true);

    try {
      const { error } = await supabase
        .from("poems")
        .update({
          title: title || "Untitled",
          content,
          mood: selectedMood,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", poem.id);

      if (error) throw error;

      setSaving(false);
      setToast("Saved");
      router.push(`/poem/${poem.id}`);
    } catch {
      setSaving(false);
      setToast("Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!poem || !confirm("Delete this poem? This cannot be undone.")) return;

    try {
      const { error } = await supabase.from("poems").delete().eq("id", poem.id);
      if (error) throw error;
      router.push("/home");
    } catch {
      setToast("Failed to delete");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-5 md:px-6 py-8">
          <div className="h-8 skeleton w-20 rounded mb-8" />
          <div className="h-10 skeleton w-64 rounded mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-5 skeleton rounded" />)}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-6 py-5 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/poem/${poemId}`} className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors">
            <ArrowLeft size={14} strokeWidth={1.5} /> Back
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full border border-border-subtle hover:border-border-default disabled:opacity-50">
              <Save size={12} strokeWidth={1.5} />
              <span className="hidden sm:inline">{saving ? "Saving..." : "Save"}</span>
            </button>
            <button onClick={() => setShowCanvas(!showCanvas)} className={`flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-full border hidden md:flex ${showCanvas ? "border-brand/30 text-brand bg-brand-subtle" : "border-border-subtle text-text-tertiary hover:text-text-primary hover:border-border-default"}`}>
              <Palette size={12} strokeWidth={1.5} /> Canvas
            </button>
            <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs text-error hover:text-error-hover transition-colors px-3 py-1.5 rounded-full border border-error/20 hover:border-error/40">
              <Trash2 size={12} strokeWidth={1.5} /> <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full bg-transparent font-poem-title text-2xl md:text-3xl text-text-primary placeholder:text-text-disabled outline-none mb-8" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing..." className={`w-full bg-transparent text-lg text-text-primary placeholder:text-text-disabled outline-none resize-none min-h-[50vh] leading-relaxed ${selectedTypography === "serif" ? "font-poem" : selectedTypography === "editorial" ? "font-editorial" : "font-sans"}`} style={{ textAlign: selectedAlignment as "left" | "center" | "right" }} />
          </div>

          {showCanvas && (
            <div className="hidden md:block w-56 flex-shrink-0 animate-slide-in">
              <div className="sticky top-20 space-y-6">
                <div>
                  <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-3">Typography</p>
                  <div className="space-y-1">
                    {typographyOptions.map((opt) => (
                      <button key={opt.id} onClick={() => setSelectedTypography(opt.id)} className={`block w-full text-left px-3 py-2 text-sm rounded-[var(--radius-sm)] transition-colors ${selectedTypography === opt.id ? "bg-brand-subtle text-brand font-medium" : "text-text-secondary hover:bg-surface-hover"}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-3">Alignment</p>
                  <div className="flex gap-1.5">
                    {alignmentOptions.map((opt) => (
                      <button key={opt.id} onClick={() => setSelectedAlignment(opt.id)} className={`flex-1 px-2 py-1.5 text-xs rounded-[var(--radius-sm)] transition-colors ${selectedAlignment === opt.id ? "bg-brand-subtle text-brand font-medium" : "text-text-secondary hover:bg-surface-hover"}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-3">Mood</p>
                  <div className="flex flex-wrap gap-1.5">
                    {moodOptions.map((mood) => (
                      <button key={mood.name} onClick={() => setSelectedMood(selectedMood === mood.name ? null : mood.name)} className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${selectedMood === mood.name ? "border-brand text-brand bg-brand-subtle" : "border-border-subtle text-text-tertiary hover:border-border-default"}`}>{mood.name}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-text-tertiary tracking-widest uppercase mb-3">Tags</p>
                  <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="love, rain, midnight" className="w-full bg-surface-secondary border border-border-subtle rounded-[var(--radius-sm)] px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand transition-colors" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
