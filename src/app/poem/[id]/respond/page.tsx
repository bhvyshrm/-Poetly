"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import AppShell from "@/components/layout/AppShell";
import Toast from "@/components/Toast";

export default function RespondPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [originalPoem, setOriginalPoem] = useState<PoemWithAuthor | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("id", id)
          .single();
        setOriginalPoem(data as PoemWithAuthor);
      } catch {
        setToast("Failed to load poem");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePublish = async () => {
    if (!content.trim()) {
      setToast("Write your response first");
      return;
    }
    if (!user) {
      setToast("You must be logged in");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("poems")
        .insert({
          author_id: user.id,
          title: title || "Response",
          content,
          response_to: id,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        await supabase.from("responses").insert({
          original_poem_id: id,
          response_poem_id: data.id,
          author_id: user.id,
        });

        // Notify original poem author
        if (originalPoem && user.id !== originalPoem.author_id) {
          await supabase.from("notifications").insert({
            recipient_id: originalPoem.author_id,
            actor_id: user.id,
            type: "response",
            reference_id: data.id,
          });
        }

        router.push(`/poem/${data.id}`);
      } else {
        setToast("Failed to publish");
      }
    } catch {
      setToast("Failed to publish");
    }
  };

  if (loading || !originalPoem) {
    return (
      <AppShell maxWidth="feed">
        <div className="py-12 space-y-4">
          <div className="w-32 h-4 skeleton rounded" />
          <div className="w-3/4 h-10 skeleton rounded-xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6 py-2 sm:py-4">
        <Link
          href={`/poem/${id}`}
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Original Poem</span>
        </Link>

        <section className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-medium">
            <span className="uppercase tracking-widest text-[11px]">Poetic Dialogue</span>
            <span className="text-text-tertiary">/</span>
            <span className="text-text-secondary">Response Stanza</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-light tracking-tight">
            Inscribe a Response
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary font-light">
            Not a comment. A poem. Answer verse with verse.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Original Poem Reference Card */}
          <div className="lg:col-span-5 glass-surface rounded-2xl p-6 border border-border-subtle/50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle/30">
              <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">Original Verse</span>
              <span className="text-xs text-text-tertiary">by {originalPoem.profiles.display_name}</span>
            </div>
            <h3 className="font-display text-xl text-text-primary font-medium">{originalPoem.title}</h3>
            <div className="font-verse text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line font-light">
              {originalPoem.content}
            </div>
          </div>

          {/* Response Composer Card */}
          <div className="lg:col-span-7 glass-surface rounded-2xl p-6 border border-primary/30 specular-top-border space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle/30">
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary">Your Resonant Stanza</span>
              <span className="text-xs text-text-tertiary font-mono">Status: Composing</span>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title your response poem..."
              className="w-full bg-transparent font-display text-xl sm:text-2xl text-text-primary placeholder:text-text-tertiary/60 outline-none pb-2 border-b border-border-subtle/30 focus:border-primary transition-colors"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Inscribe your stanzas in response..."
              className="w-full bg-transparent font-verse text-base sm:text-lg text-text-primary placeholder:text-text-tertiary/60 outline-none resize-none min-h-[280px] leading-relaxed font-light"
            />

            <div className="flex items-center justify-end pt-3 border-t border-border-subtle/30">
              <button
                onClick={handlePublish}
                className="px-6 py-2.5 rounded-full gradient-brand text-white text-xs font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition-all cursor-pointer"
              >
                Publish Response Poem
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
