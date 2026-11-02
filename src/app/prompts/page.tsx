"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Prompt } from "@/lib/types";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Toast from "@/components/Toast";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let query = supabase.from("prompts").select("*").order("created_at", { ascending: false });

        if (activeTab === "active") {
          query = query.eq("is_active", true);
        } else {
          query = query.eq("is_active", false);
        }

        const { data } = await query;
        setPrompts((data as Prompt[]) || []);
      } catch {
        setToast("Failed to load prompts");
      } finally {
        setLoading(false);
      }
    })();
  }, [activeTab]);

  return (
    <AppShell maxWidth="feed">
      <div className="animate-fade-in">
        <PageHeader
          title="Writing Prompts"
          description="Find your next poem and participate in community writing exercises."
        />

        <div className="flex gap-1 mb-6 bg-surface-secondary border border-border-default rounded-full p-1">
          {[
            { id: "active" as const, label: "Active" },
            { id: "archive" as const, label: "Archive" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 min-h-[44px] text-xs md:text-sm font-medium rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-background font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface rounded-[var(--radius-md)] border border-border-default skeleton" />
            ))}
          </div>
        ) : prompts.length > 0 ? (
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <Link
                key={prompt.id}
                href={`/prompts/${prompt.id}`}
                className="group block p-4 bg-surface border border-border-default hover:border-text-primary rounded-[var(--radius-md)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-poem text-lg md:text-xl font-medium text-text-primary mb-1 group-hover:underline transition-colors italic">
                      &ldquo;{prompt.title}&rdquo;
                    </h3>
                    {prompt.description && (
                      <p className="text-xs md:text-sm text-text-secondary leading-relaxed line-clamp-2">
                        {prompt.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                          prompt.is_active
                            ? "bg-surface-secondary text-text-primary border-border-default"
                            : "bg-surface-secondary text-text-tertiary border-border-default"
                        }`}
                      >
                        {prompt.is_active ? "Active" : "Ended"}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {new Date(prompt.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-poem text-xl text-text-tertiary italic mb-2">
              {activeTab === "active" ? "No active prompts right now." : "No archived prompts yet."}
            </p>
            <p className="text-xs text-text-tertiary">
              {activeTab === "active"
                ? "Check back soon for new writing prompts."
                : "Completed prompts will appear here."}
            </p>
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
