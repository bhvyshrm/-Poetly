"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { uploadImage } from "@/lib/supabase/storage";
import AppShell from "@/components/layout/AppShell";
import Avatar from "@/components/ui/Avatar";
import Toast from "@/components/Toast";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(profile && profile.username);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      if (profile) {
        setUsername(profile.username || "");
        setDisplayName(profile.display_name || "");
        setBio(profile.bio || "");
        setWebsite(profile.website || "");
        setLocation(profile.location || "");
        setProfileImage(profile.profile_image || "");
        setUsernameStatus("available");
      } else {
        const defaultName = user.user_metadata?.full_name || user.user_metadata?.name || "";
        const defaultAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";
        const defaultUsername = (
          user.user_metadata?.user_name ||
          (user.email ? user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") : "")
        ).slice(0, 20);

        setDisplayName(defaultName);
        setProfileImage(defaultAvatar);
        if (defaultUsername && defaultUsername.length >= 3) {
          setUsername(defaultUsername);
        }
      }
      setChecking(false);
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    // If username hasn't changed from existing profile
    if (profile && username.toLowerCase() === profile.username?.toLowerCase()) {
      setUsernameStatus("available");
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const query = supabase
          .from("profiles")
          .select("id")
          .eq("username", username.toLowerCase());

        if (user) {
          query.neq("id", user.id);
        }

        const { data } = await query.maybeSingle();
        setUsernameStatus(data ? "taken" : "available");
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, profile, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    const { url, error: uploadErr } = await uploadImage(file, "avatars", user.id);
    setUploadingImage(false);

    if (uploadErr || !url) {
      setToast(uploadErr || "Failed to upload avatar");
    } else {
      setProfileImage(url);
      setToast("Avatar updated");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username.trim() || !displayName.trim()) return;

    setLoading(true);
    setError("");

    const normalizedUsername = username.toLowerCase().trim();

    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setError("Username must be 3-20 characters: lowercase letters, numbers, and underscores only.");
      setLoading(false);
      return;
    }

    if (usernameStatus === "taken") {
      setError("That username is already taken. Please choose another.");
      setLoading(false);
      return;
    }

    try {
      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username: normalizedUsername,
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          website: website.trim() || null,
          location: location.trim() || null,
          profile_image: profileImage || null,
          status: profile?.status || "active",
        },
        { onConflict: "id" }
      );

      if (upsertError) {
        if (upsertError.message.toLowerCase().includes("unique")) {
          setError("That username is already taken. Please choose another.");
        } else {
          setError("Something went wrong while saving your profile. Please try again.");
        }
        setLoading(false);
        return;
      }

      await refreshProfile();
      setToast(isEditing ? "Profile updated" : "Welcome to Poetly!");
      router.push(`/profile/${normalizedUsername}`);
    } catch {
      setError("Failed to save profile. Please check your connection and try again.");
      setLoading(false);
    }
  };

  if (checking || authLoading) {
    return (
      <AppShell maxWidth="feed">
        <div className="py-12 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="feed">
      <div className="max-w-lg mx-auto animate-fade-in">
        {isEditing && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-6 min-h-[44px]"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> Back
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="font-poem-title text-2xl md:text-3xl text-text-primary mb-2">
            {isEditing ? "Edit Profile" : "Welcome to Poetly"}
          </h1>
          <p className="text-sm text-text-secondary">
            {isEditing ? "Update your writer identity and information." : "Choose your identity as a writer."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-surface-secondary border border-border-default rounded-[var(--radius-md)]">
            <p className="text-xs text-text-primary font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="relative group">
              <div className="w-20 h-20 rounded-[var(--radius-md)] overflow-hidden border border-border-subtle">
                <Avatar
                  src={profileImage}
                  name={displayName || "P"}
                  size="xl"
                  className="w-20 h-20 rounded-[var(--radius-md)]"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute inset-0 bg-black/60 rounded-[var(--radius-md)] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Upload profile image"
              >
                <Camera size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors py-1"
            >
              {uploadingImage ? "Uploading..." : profileImage ? "Change avatar" : "Add avatar"}
            </button>
          </div>

          <div>
            <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
              Username *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="yourname"
                className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] pl-7 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-text-primary transition-colors"
                required
                minLength={3}
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && (
                  <div className="w-4 h-4 border-2 border-text-tertiary border-t-transparent rounded-full animate-spin" />
                )}
                {usernameStatus === "available" && (
                  <span className="text-text-primary text-xs font-bold">✓</span>
                )}
                {usernameStatus === "taken" && (
                  <span className="text-text-tertiary text-xs font-bold">✕</span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-text-tertiary mt-1">Lowercase letters, numbers, and underscores (3-20 characters).</p>
          </div>

          <div>
            <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-text-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers about your writing and soul..."
              className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-text-primary transition-colors resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-[11px] text-text-tertiary mt-1">{bio.length}/200</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-text-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-text-tertiary tracking-widest uppercase mb-1.5 block">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full bg-surface border border-border-subtle rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-text-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 min-h-[44px] py-3 border border-border-default text-text-secondary text-sm font-medium rounded-full hover:bg-surface-hover hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !username.trim() || !displayName.trim() || usernameStatus === "taken"}
              className="flex-1 min-h-[44px] py-3 bg-primary text-background text-sm font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {loading ? "Saving..." : isEditing ? "Save Profile" : "Start Writing"}
            </button>
          </div>
        </form>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
