"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Database } from "@/lib/database.types";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";

type Collection = Database["public"]["Tables"]["collections"]["Row"];

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data?type=collections");
      if (!res.ok) throw new Error("Failed to load collections");
      const json = await res.json();
      setCollections((json.collections as Collection[]) || []);
    } catch (err) {
      setError("Failed to load collections.");
      console.error("Fetch collections error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-text-primary mb-1">Collections</h1>
          <p className="text-sm text-text-secondary">View user collections.</p>
        </div>
        <Link
          href="/collections"
          className="flex items-center gap-1.5 text-xs font-medium text-text-primary hover:underline transition-colors min-h-[44px]"
        >
          Public Collections <ExternalLink size={12} strokeWidth={1.5} />
        </Link>
      </div>

      {error && (
        <div className="bg-surface-secondary border border-border-default rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-text-primary">{error}</p>
        </div>
      )}

      {loading ? (
        <AdminSkeleton rows={5} />
      ) : collections.length > 0 ? (
        <div className="space-y-0">
          {collections.map((collection) => (
            <div key={collection.id} className="flex items-center gap-4 py-4 border-b border-border-subtle">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{collection.title}</p>
                {collection.description && (
                  <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">{collection.description}</p>
                )}
                <p className="text-[10px] text-text-tertiary mt-1">
                  Created {new Date(collection.created_at).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/collections/${collection.id}`}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="No collections yet"
          description="User collections will appear here."
        />
      )}
    </div>
  );
}
