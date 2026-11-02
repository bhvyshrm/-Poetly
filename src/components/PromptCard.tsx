"use client";

import { Prompt } from "@/lib/types";
import { Clock, ArrowRight } from "lucide-react";

interface PromptCardProps {
  prompt: Prompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  return (
    <article className="glass-surface rounded-2xl p-5 sm:p-6 border border-border-default space-y-3 relative overflow-hidden group hover:border-border-strong transition-all h-full flex flex-col justify-between">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-text-primary" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-text-secondary font-bold font-mono">
              Daily Prompt
            </span>
          </div>
          <span className="text-xs text-text-tertiary flex items-center gap-1 font-mono">
            <Clock size={12} />
            <span>Active</span>
          </span>
        </div>

        <h3 className="font-display text-lg sm:text-xl text-text-primary font-normal leading-snug group-hover:underline transition-colors">
          &ldquo;{prompt.title}&rdquo;
        </h3>

        {prompt.description && (
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-3 font-light">
            {prompt.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs text-text-tertiary mt-2">
        <span className="font-verse italic">Explore stanzas</span>
        <span className="text-text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Write response</span>
          <ArrowRight size={13} />
        </span>
      </div>
    </article>
  );
}

