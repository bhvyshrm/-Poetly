"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Database } from "@/lib/database.types";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";

type Prompt = Database["public"]["Tables"]["prompts"]["Row"];

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data?type=prompts");
      if (!res.ok) throw new Error("Failed to load prompts");
      const json = await res.json();
      setPrompts((json.prompts as Prompt[]) || []);
    } catch (err) {
      setError("Failed to load prompts.");
      console.error("Fetch prompts error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-text-primary mb-1">Prompts</h1>
          <p className="text-sm text-text-secondary">Manage writing prompts.</p>
        </div>
        <Link
          href="/prompts"
          className="flex items-center gap-1.5 text-xs font-medium text-text-primary hover:underline transition-colors min-h-[44px]"
        >
          Public Prompts <ExternalLink size={12} strokeWidth={1.5} />
        </Link>
      </div>

      {error && (
        <div className="bg-surface-secondary border border-border-default rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-text-primary">{error}</p>
        </div>
      )}

      {loading ? (
        <AdminSkeleton rows={5} />
      ) : prompts.length > 0 ? (
        <div className="space-y-0">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="flex items-center gap-4 py-4 border-b border-border-subtle">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary italic">&ldquo;{prompt.title}&rdquo;</p>
                {prompt.description && (
                  <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">{prompt.description}</p>
                )}
                <p className="text-[10px] text-text-tertiary mt-1">
                  Created {new Date(prompt.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${prompt.is_active ? "bg-success-subtle text-success" : "bg-surface-secondary text-text-tertiary"}`}>
                  {prompt.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="No prompts yet"
          description="Prompts are created from the public prompts interface."
        />
      )}
    </div>
  );
}
