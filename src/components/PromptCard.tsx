"use client";

import { Prompt } from "@/lib/types";
import { Clock, ArrowRight } from "lucide-react";

interface PromptCardProps {
  prompt: Prompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  return (
    <article className="glass-surface rounded-2xl p-5 sm:p-6 border-t-2 border-t-tertiary space-y-3 relative overflow-hidden group hover:border-tertiary/40 transition-all h-full flex flex-col justify-between">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-tertiary font-bold font-mono">
              Salon Prompt
            </span>
          </div>
          <span className="text-xs text-text-tertiary flex items-center gap-1 font-mono">
            <Clock size={12} />
            <span>Active</span>
          </span>
        </div>

        <h3 className="font-display text-lg sm:text-xl text-text-primary font-normal leading-snug group-hover:text-tertiary transition-colors">
          &ldquo;{prompt.title}&rdquo;
        </h3>

        {prompt.description && (
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-3 font-light">
            {prompt.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40 text-xs text-text-tertiary mt-2">
        <span className="font-verse italic">Explore stanzas</span>
        <span className="text-tertiary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Pen response</span>
          <ArrowRight size={13} />
        </span>
      </div>
    </article>
  );
}

