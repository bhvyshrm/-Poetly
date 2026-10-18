"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HelpCircle, Loader2, Send, AlignLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export default function PoemComposer() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <Link
        href="/login"
        className="glass-surface rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 hover:border-primary/40 transition-colors block group"
      >
        <div className="w-10 h-10 rounded-full bg-surface-secondary/80 flex items-center justify-center font-display text-text-tertiary group-hover:text-primary transition-colors text-sm border border-border-subtle">
          ✦
        </div>
        <div className="flex-1 text-sm text-text-tertiary group-hover:text-text-secondary transition-colors font-verse italic">
          Leave a quiet verse or thought... Sign in to write.
        </div>
        <span className="text-xs text-primary font-medium tracking-wide">
          Join Salon →
        </span>
      </Link>
    );
  }

  const handlePost = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    setError(null);

    try {
      const lines = content.trim().split("\n").filter(Boolean);
      const title = lines[0]?.length <= 40 ? lines[0] : "Untitled";

      const { data, error: insertError } = await supabase
        .from("poems")
        .insert({
          author_id: user.id,
          title,
          content: content.trim(),
          status: "published",
          visibility: "public",
          published_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      setContent("");
      setFocused(false);
      if (data) {
        router.push(`/poem/${data.id}`);
      }
    } catch {
      setError("Failed to post poem. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="glass-surface rounded-2xl p-4 sm:p-5 transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/30">
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mt-0.5 ring-1 ring-primary/20 bg-surface-secondary flex items-center justify-center">
          {profile?.profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profile_image}
              alt={profile.display_name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display font-medium text-primary text-sm">
              {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "P"}
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Leave a quiet verse or thought..."
            className="w-full bg-transparent border-0 p-0 text-text-primary placeholder:text-text-tertiary font-verse text-base sm:text-lg focus:outline-none focus:ring-0 resize-none font-light leading-relaxed min-h-[50px]"
            rows={focused || content ? 3 : 2}
          />

          {error && <p className="text-xs text-error mt-1">{error}</p>}

          <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle/40">
            <div className="flex items-center gap-2">
              <Link
                href="/write"
                className="px-2.5 py-1 rounded-lg glass-pill text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
                title="Open full studio"
              >
                <AlignLeft size={13} className="text-primary/70" />
                <span>Full Desk</span>
              </Link>
              <Link
                href="/prompts"
                className="px-2.5 py-1 rounded-lg glass-pill text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
                title="Browse daily prompts"
              >
                <HelpCircle size={13} className="text-tertiary" />
                <span>Prompts</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {focused && content.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setContent("");
                    setFocused(false);
                  }}
                  className="text-xs text-text-tertiary hover:text-text-primary px-2 py-1 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handlePost}
                disabled={posting || !content.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-container to-secondary text-white font-semibold text-xs tracking-wider glowing-btn-aura hover:opacity-95 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              >
                {posting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Penning...</span>
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Pen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

