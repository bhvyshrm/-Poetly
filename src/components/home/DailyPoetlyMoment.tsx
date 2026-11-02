"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Quote, Clock, PenTool, ArrowRight, Moon } from "lucide-react";
import { dailyMoment } from "@/lib/moments";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export default function DailyPoetlyMoment() {
  const { user, profile } = useAuth();
  const [moment] = useState(() => dailyMoment());
  const [activePrompt, setActivePrompt] = useState<{ id: string; title: string } | null>(null);
  const [responseCount, setResponseCount] = useState<number>(0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = profile?.display_name || user?.user_metadata?.full_name?.split(" ")[0] || "Poet";

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("prompts")
          .select("id, title")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setActivePrompt(data);

          // Get count of responses if any
          const { count } = await supabase
            .from("poems")
            .select("id", { count: "exact", head: true })
            .eq("prompt_id", data.id);

          setResponseCount(count || 0);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <section className="glass-surface rounded-2xl p-4 sm:p-5 relative border border-border-default">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-text-tertiary text-xs font-mono">
            <span>{getGreeting()}, {displayName}</span>
            <span>·</span>
            <span className="uppercase tracking-wider font-semibold">Today&apos;s Prompt</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl text-text-primary font-normal leading-snug truncate">
            &ldquo;{activePrompt ? activePrompt.title : moment.line}&rdquo;
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
          {responseCount > 0 && (
            <span className="text-xs text-text-tertiary font-mono hidden md:inline">
              {responseCount} penned
            </span>
          )}
          <Link
            href={activePrompt ? `/write?prompt=${activePrompt.id}` : "/write"}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-on-primary text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <span>Write response</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}

