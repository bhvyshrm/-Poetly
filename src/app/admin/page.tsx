"use client";

import { useState, useEffect, useCallback } from "react";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/EmptyState";

interface ActivityEntry {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  created_at: string;
  admin_id: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    poems: 0,
    publishedPoems: 0,
    draftPoems: 0,
    reports: 0,
    pendingReports: 0,
    comments: 0,
    featured: 0,
  });
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/data?type=dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const json = await res.json();
      if (json.stats) setStats(json.stats);
      if (json.activity) setActivity(json.activity);
    } catch (err) {
      setError("Failed to load dashboard statistics.");
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-1">
          <div className="w-32 h-4 skeleton rounded" />
          <div className="w-64 h-8 skeleton rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-light text-text-primary tracking-tight">
            Curator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">Overview of the Poetly literary salon.</p>
        </div>
        <div className="glass-surface border border-red-500/30 rounded-2xl p-5 text-red-400 text-xs">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      {/* Header */}
      <section className="space-y-1.5 pb-2 border-b border-border-subtle/30">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-medium">
          <span className="uppercase tracking-widest text-[11px]">Salon Moderation &amp; Telemetry</span>
          <span className="text-text-tertiary">/</span>
          <span className="text-text-secondary">Overview</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-text-primary tracking-tight">
          Curator Sanctuary Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary font-light">
          Real-time community telemetry, moderation queues, and publication velocity.
        </p>
      </section>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <AdminCard label="Registered Poets" value={stats.users} sub="Active community members" />
        <AdminCard
          label="Total Stanzas"
          value={stats.poems}
          sub={`${stats.publishedPoems} published · ${stats.draftPoems} in desk`}
        />
        <AdminCard
          label="Pending Reports"
          value={stats.pendingReports}
          sub={stats.pendingReports > 0 ? "Requires curatorial review" : "All reports cleared"}
          className={stats.pendingReports > 0 ? "border-amber-400/40 bg-amber-400/5" : ""}
        />
        <AdminCard label="Marginalia Notes" value={stats.comments} sub="Reader discussions" />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
        <AdminCard label="Published Verses" value={stats.publishedPoems} sub="Public salon works" />
        <AdminCard label="Private Drafts" value={stats.draftPoems} sub="Authors' working desks" />
        <AdminCard label="Spotlight Works" value={stats.featured} sub="Curated on home salon" />
      </div>

      {/* Recent Activity Section */}
      <div className="glass-surface border border-border-subtle/40 rounded-2xl p-6 specular-top-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle/30">
          <h2 className="font-display text-lg text-text-primary font-light">Recent Curatorial Stream</h2>
          <span className="font-mono text-xs text-text-tertiary">Live Logs</span>
        </div>

        {activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-surface-secondary/40 transition-colors border border-transparent hover:border-border-subtle/30"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-xs shadow-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-text-secondary">
                    <span className="text-text-primary font-medium">{entry.action}</span>
                    {entry.target_type && (
                      <span className="text-text-tertiary"> on {entry.target_type}</span>
                    )}
                    {entry.details && (
                      <span className="text-text-tertiary"> — {entry.details}</span>
                    )}
                  </p>
                  <p className="font-mono text-[10px] text-text-tertiary mt-1">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState title="No activity recorded" description="Curatorial and administrative actions will gather here." />
        )}
      </div>
    </div>
  );
}
