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
    <div className="space-y-4 sm:space-y-6">
      {/* Emotional Greeting & Literary Anchor */}
      <section className="glass-surface rounded-2xl p-5 sm:p-6 relative overflow-hidden specular-top-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-primary text-xs font-medium tracking-wide">
              <Moon size={14} className="text-primary" />
              <span>Sanctuary Hours</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-text-primary tracking-tight font-light">
              {getGreeting()}, {displayName}.
            </h1>
          </div>
          <Quote className="text-text-tertiary/20 shrink-0" size={32} />
        </div>
        <p className="font-verse text-base sm:text-lg italic text-text-secondary mt-3 pt-3 border-t border-border-subtle/40 font-light leading-relaxed">
          &ldquo;{moment.line}&rdquo;
        </p>
      </section>

      {/* Level 2 Interactive: Daily Prompt Card */}
      <section className="glass-panel-elevated rounded-2xl p-5 sm:p-6 relative border-t-2 border-t-tertiary">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase text-tertiary tracking-wider font-mono">
              Daily Prompt
            </span>
          </div>
          <span className="text-xs text-text-tertiary flex items-center gap-1 font-mono">
            <Clock size={13} />
            <span>Today</span>
          </span>
        </div>

        <h3 className="font-display text-lg sm:text-2xl leading-snug text-text-primary mb-2 font-light">
          &ldquo;{activePrompt ? activePrompt.title : "Write about a place you never truly left."}&rdquo;
        </h3>

        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-border-subtle/40">
          <div className="flex items-center gap-1.5 text-text-tertiary text-xs">
            <PenTool size={14} className="text-primary" />
            <span>
              {responseCount > 0
                ? `${responseCount.toLocaleString()} stanzas penned today`
                : "Be the first to pen a stanza today"}
            </span>
          </div>
          <Link
            href={activePrompt ? `/write?prompt=${activePrompt.id}` : "/write"}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-tertiary/15 text-tertiary border border-tertiary/30 hover:bg-tertiary/25 text-xs font-semibold transition-all active:scale-95"
          >
            <span>Respond to Prompt</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
}

