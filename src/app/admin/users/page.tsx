"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Database } from "@/lib/database.types";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import AdminEmptyState from "@/components/admin/EmptyState";
import Toast from "@/components/Toast";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [confirm, setConfirm] = useState<{ action: string; userId: string; userName: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (reset = false, customPage?: number) => {
    setLoading(true);
    setError(null);
    try {
      const pageToFetch = reset ? 0 : customPage !== undefined ? customPage : page;
      const res = await fetch(`/api/admin/data?type=users&page=${pageToFetch}&search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed to load users");
      const json = await res.json();
      const typedData = (json.users as Profile[]) || [];

      if (reset) {
        setUsers(typedData);
        setPage(0);
      } else {
        setUsers((prev) => (pageToFetch === 0 ? typedData : [...prev, ...typedData]));
      }
      setHasMore(Boolean(json.hasMore));
    } catch (err) {
      setError("Failed to load users. Please try again.");
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (userId: string, newStatus: "active" | "suspended" | "banned", userName: string) => {
    setConfirm(null);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_user_status",
          userId,
          status: newStatus,
          userName,
        }),
      });
      if (!res.ok) throw new Error("Status update failed");
      setToast(`User ${newStatus === "active" ? "restored" : newStatus}.`);
      fetchUsers(true);
    } catch (err) {
      setToast("Failed to update user status.");
      console.error("Status change error:", err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-text-primary mb-1">Users</h1>
        <p className="text-sm text-text-secondary">Manage user accounts.</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or username..."
          className="w-full bg-surface border border-border-default rounded-[var(--radius-sm)] pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-text-primary transition-colors"
        />
      </div>

      {error && (
        <div className="bg-surface-secondary border border-border-default rounded-[var(--radius-md)] p-4 mb-6">
          <p className="text-sm text-text-primary">{error}</p>
        </div>
      )}

      {loading && users.length === 0 ? (
        <AdminSkeleton rows={8} />
      ) : users.length > 0 ? (
        <>
          <div className="space-y-0">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 py-4 border-b border-border-subtle group">
                <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-surface-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {u.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.profile_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-text-tertiary">{u.display_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">{u.display_name}</p>
                    <Link href={`/profile/${u.username}`} className="text-text-tertiary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                  <p className="text-xs text-text-tertiary">@{u.username}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={u.status || "active"} />
                  <span className="text-xs text-text-tertiary hidden sm:inline">{new Date(u.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {u.status !== "suspended" && (
                      <button
                        onClick={() => setConfirm({ action: "suspend", userId: u.id, userName: u.display_name })}
                        className="px-2 py-1 text-[10px] font-medium text-warning hover:bg-warning-subtle rounded transition-colors"
                      >
                        Suspend
                      </button>
                    )}
                    {u.status !== "banned" && (
                      <button
                        onClick={() => setConfirm({ action: "ban", userId: u.id, userName: u.display_name })}
                        className="px-2 py-1 text-[10px] font-medium text-error hover:bg-error-subtle rounded transition-colors"
                      >
                        Ban
                      </button>
                    )}
                    {u.status !== "active" && (
                      <button
                        onClick={() => setConfirm({ action: "restore", userId: u.id, userName: u.display_name })}
                        className="px-2 py-1 text-[10px] font-medium text-success hover:bg-success-subtle rounded transition-colors"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-text-tertiary">
              Showing {users.length} user{users.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPage(Math.max(0, page - 1)); fetchUsers(true); }}
                disabled={page === 0}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-text-tertiary">Page {page + 1}</span>
              <button
                onClick={() => { setPage(page + 1); fetchUsers(false); }}
                disabled={!hasMore || loading}
                className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <AdminEmptyState
          title={search ? "No users found" : "No users yet"}
          description={search ? `No users matching "${search}".` : "No users have joined Poetly yet."}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={
            confirm.action === "suspend" ? "Suspend this user?" :
            confirm.action === "ban" ? "Ban this user?" :
            "Restore this user?"
          }
          message={
            confirm.action === "suspend"
              ? `This will suspend "${confirm.userName}". They will not be able to use Poetly.`
              : confirm.action === "ban"
              ? `This will ban "${confirm.userName}". They will be permanently blocked.`
              : `This will restore "${confirm.userName}" to active status.`
          }
          confirmLabel={confirm.action === "restore" ? "Restore" : confirm.action === "suspend" ? "Suspend" : "Ban"}
          danger={confirm.action === "ban"}
          onConfirm={() => handleStatusChange(confirm.userId, confirm.action === "restore" ? "active" : confirm.action as "suspended" | "banned", confirm.userName)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
