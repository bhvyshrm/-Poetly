"use client";

import { useState, useEffect, useCallback } from "react";
import { Database } from "@/lib/database.types";
import AdminSkeleton from "@/components/admin/AdminSkeleton";

type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data?type=settings");
      if (!res.ok) throw new Error("Failed to load admin settings");
      const json = await res.json();
      setAdmins((json.admins as AdminUser[]) || []);
    } catch (err) {
      console.error("Fetch admins error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Settings</h1>
        <p className="text-sm text-text-secondary">Admin configuration.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface border border-border-subtle rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-2">Authentication</h2>
          <p className="text-xs text-text-tertiary leading-relaxed">
            Admin access uses dedicated username + password authentication,
            separate from Google Sign-In used by normal Poetly users.
            Admin credentials are stored as environment variables.
          </p>
        </div>

        <div className="bg-surface border border-border-default rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-2">Admin Roles</h2>
          <p className="text-xs text-text-tertiary leading-relaxed mb-3">
            Roles determine what actions an admin can perform. Stored in the{" "}
            <code className="text-text-primary bg-surface-secondary px-1 py-0.5 rounded text-[11px]">admin_users</code> table.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-text-primary w-20">Admin</span>
              <span className="text-xs text-text-tertiary">Full access to all moderation and management features.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-text-primary w-20">Moderator</span>
              <span className="text-xs text-text-tertiary">Can review reports and moderate content. Cannot manage users or settings.</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border-default rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-3">Registered Admins</h2>
          {loading ? (
            <AdminSkeleton rows={2} />
          ) : admins.length > 0 ? (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-surface-secondary flex items-center justify-center">
                      <span className="text-[10px] font-medium text-text-primary">{admin.user_id.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-primary">{admin.user_id.slice(0, 8)}...</p>
                      <p className="text-[10px] text-text-tertiary capitalize">{admin.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-text-tertiary">
                    Added {new Date(admin.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-tertiary">No admin records found in database.</p>
          )}
        </div>

        <div className="bg-surface border border-border-default rounded-[var(--radius-md)] p-5">
          <h2 className="text-sm font-medium text-text-primary mb-2">Activity Log</h2>
          <p className="text-xs text-text-tertiary leading-relaxed">
            All admin actions are logged in the{" "}
            <code className="text-text-primary bg-surface-secondary px-1 py-0.5 rounded text-[11px]">admin_activity_log</code> table
            for audit purposes. View the full log in the Activity tab.
          </p>
        </div>
      </div>
    </div>
  );
}
