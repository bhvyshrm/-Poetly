"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { PoemWithAuthor } from "@/lib/types";
import PoemCard from "@/components/PoemCard";
import AppShell from "@/components/layout/AppShell";

export default function PoemResponsesPage() {
  const params = useParams();
  const poemId = params.id as string;
  const [parentPoem, setParentPoem] = useState<PoemWithAuthor | null>(null);
  const [responses, setResponses] = useState<PoemWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const { data: parent } = await supabase
        .from("poems")
        .select("*, profiles!inner(*)")
        .eq("id", poemId)
        .single();

      setParentPoem(parent as PoemWithAuthor);

      const { data: responseLinks } = await supabase
        .from("responses")
        .select("response_poem_id")
        .eq("original_poem_id", poemId)
        .order("created_at", { ascending: false });

      if (responseLinks && responseLinks.length > 0) {
        const poemIds = responseLinks.map((r) => r.response_poem_id);
        const { data: poemData } = await supabase
          .from("poems")
          .select("*, profiles!inner(*)")
          .in("id", poemIds)
          .eq("status", "published");

        // Preserve chronological order of responses
        const poemMap = new Map((poemData || []).map((p) => [p.id, p]));
        const ordered = poemIds.map((id) => poemMap.get(id)).filter(Boolean) as PoemWithAuthor[];
        setResponses(ordered);
      } else {
        setResponses([]);
      }
    } catch {
      // Failed to load responses — will show empty state
    }

    setLoading(false);
  }, [poemId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AppShell maxWidth="feed">
      <div className="space-y-6 py-2 sm:py-4">
        <Link
          href={`/poem/${poemId}`}
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Original Poem</span>
        </Link>

        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-medium">
              <span className="uppercase tracking-widest text-[11px]">Resonance Stream</span>
              <span className="text-text-tertiary">/</span>
              <span className="text-text-secondary">Conversation</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-text-primary font-light tracking-tight">
              Poetic Dialogue
            </h1>
            {parentPoem && (
              <p className="font-verse italic text-xs sm:text-sm text-text-secondary">
                Responses to &ldquo;{parentPoem.title || "Untitled"}&rdquo; by {parentPoem.profiles.display_name}
              </p>
            )}
          </div>
          <Link
            href={`/poem/${poemId}/respond`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-on-primary bg-primary rounded-full hover:opacity-90 transition-opacity self-start sm:self-auto shrink-0"
          >
            <PenLine size={13} />
            <span>Write Response</span>
          </Link>
        </section>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 skeleton rounded-2xl" />
            ))}
          </div>
        ) : responses.length > 0 ? (
          <div className="space-y-4">
            {responses.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-surface rounded-2xl p-8 border border-border-default space-y-4">
            <p className="font-display text-xl text-text-primary">No Responses Yet</p>
            <p className="font-verse italic text-xs sm:text-sm text-text-tertiary max-w-sm mx-auto">
              A response is not a comment. It is a poem written in conversation.
            </p>
            <div className="pt-2">
              <Link
                href={`/poem/${poemId}/respond`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-xs font-medium rounded-full hover:opacity-90 transition-opacity"
              >
                <PenLine size={13} />
                <span>Be the First to Respond</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
