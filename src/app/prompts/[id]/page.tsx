"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Prompt, PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Toast from "@/components/Toast";

export default function PromptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [poems, setPoems] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: promptData } = await supabase.from("prompts").select("*").eq("id", id).single();
      setPrompt(promptData as Prompt);

      if (promptData) {
        const { data: poemData } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .eq("prompt_id", id)
          .order("created_at", { ascending: false });
        setPoems((poemData as PoemWithAuthor[]) || []);
      }
    } catch {
      setToast("Failed to load prompt");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <AppShell maxWidth="feed">
        <div className="py-8">
          <div className="w-48 h-6 skeleton rounded mb-4" />
          <div className="w-full h-20 skeleton rounded" />
        </div>
      </AppShell>
    );
  }

  if (!prompt) {
    return (
      <AppShell maxWidth="feed">
        <div className="py-16 text-center">
          <p className="font-poem text-xl text-text-tertiary italic">Prompt not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="feed">
      <div className="animate-fade-in">
        <PageHeader
          title={prompt.title}
          backHref="/prompts"
          backLabel="Prompts"
          badge={
            <span
              className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                prompt.is_active
                  ? "bg-surface-secondary text-text-primary border-border-default"
                  : "bg-surface-secondary text-text-tertiary border-border-default"
              }`}
            >
              {prompt.is_active ? "Active" : "Ended"}
            </span>
          }
          actions={
            prompt.is_active ? (
              <Link
                href={`/write?prompt=${prompt.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-primary text-background text-xs md:text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
              >
                <PenLine size={14} strokeWidth={2} /> Write for this Prompt
              </Link>
            ) : undefined
          }
        />

        {prompt.description && (
          <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8 font-poem italic">
            &ldquo;{prompt.description}&rdquo;
          </p>
        )}

        <div className="border-t border-border-default pt-6">
          <h2 className="font-poem text-lg font-medium text-text-primary mb-4 flex items-center justify-between">
            <span>Poems inspired by this prompt</span>
            {poems.length > 0 && (
              <span className="text-xs text-text-tertiary font-sans font-normal">
                {poems.length} {poems.length === 1 ? "poem" : "poems"}
              </span>
            )}
          </h2>

          {poems.length > 0 ? (
            <div className="space-y-3">
              {poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-poem text-lg text-text-tertiary italic mb-2">
                No poems yet for this prompt.
              </p>
              <p className="text-xs text-text-tertiary">Be the first to respond.</p>
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
