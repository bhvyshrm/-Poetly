"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Library,
  Bookmark,
  Bell,
  PenLine,
  User,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import NavigationItem from "@/components/navigation/NavigationItem";
import Avatar from "@/components/ui/Avatar";

export interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export default function Sidebar({ onNavigate, className = "" }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    (async () => {
      try {
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", user.id)
          .eq("read", false);
        if (isMounted && count && count > 0) {
          setUnreadNotifications(count);
        }
      } catch {
        // silent fail
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const isHomeActive = pathname === "/home" || pathname === "/";
  const isExploreActive = pathname.startsWith("/explore") || pathname.startsWith("/trending") || pathname.startsWith("/writers");
  const isCollectionsActive = pathname.startsWith("/collections");
  const isSavedActive = pathname.startsWith("/saved") || pathname.startsWith("/library");
  const isNotificationsActive = pathname.startsWith("/notifications");
  const isWriteActive = pathname.startsWith("/write");
  const profileHref = user && profile?.username ? `/profile/${profile.username}` : user ? "/profile" : "/login";
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <div
      className={`glass-surface rounded-2xl p-4 flex flex-col justify-between h-[calc(100vh-var(--nav-height,60px)-2.5rem)] sticky top-[calc(var(--nav-height,60px)+1.25rem)] ${className}`}
    >
      <div className="flex flex-col space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center border border-border-default text-text-primary font-serif font-bold text-sm shrink-0">
            P
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold italic text-base text-text-primary tracking-tight">
              Poetly
            </div>
            <div className="text-[10px] text-text-tertiary tracking-widest uppercase font-medium">
              Poetry & Writing
            </div>
          </div>
        </div>

        {/* Primary Navigation List */}
        <nav aria-label="Main Navigation" className="space-y-1">
          <NavigationItem
            href="/home"
            label="Home"
            icon={Home}
            isActive={isHomeActive}
            onClick={onNavigate}
          />
          <NavigationItem
            href="/explore"
            label="Explore"
            icon={Compass}
            isActive={isExploreActive}
            onClick={onNavigate}
          />
          <NavigationItem
            href={user ? "/write" : "/login"}
            label="Write"
            icon={PenLine}
            isActive={isWriteActive}
            onClick={onNavigate}
          />
          <NavigationItem
            href="/collections"
            label="Collections"
            icon={Library}
            isActive={isCollectionsActive}
            onClick={onNavigate}
          />
          <NavigationItem
            href="/saved"
            label="Saved"
            icon={Bookmark}
            isActive={isSavedActive}
            onClick={onNavigate}
          />
          <NavigationItem
            href={user ? "/notifications" : "/login"}
            label="Notifications"
            icon={Bell}
            badge={unreadNotifications}
            isActive={isNotificationsActive}
            onClick={onNavigate}
          />
          <NavigationItem
            href={profileHref}
            label={user ? (profile?.display_name || "Profile") : "Sign In"}
            icon={User}
            isActive={isProfileActive}
            onClick={onNavigate}
          />
        </nav>
      </div>

      {/* Footer Settings & User Card */}
      <div className="pt-4 border-t border-border-default space-y-3">
        <Link
          href={user ? "/profile" : "/login"}
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-hover"
        >
          <Settings size={15} />
          <span>Settings</span>
        </Link>

        {user ? (
          <Link
            href={profileHref}
            onClick={onNavigate}
            className="flex items-center justify-between p-2 rounded-xl bg-surface-secondary hover:bg-surface-hover transition-colors border border-border-default"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={profile?.profile_image}
                name={profile?.display_name}
                size="sm"
              />
              <div className="leading-tight min-w-0">
                <div className="text-xs font-semibold text-text-primary truncate">
                  {profile?.display_name || "Writer"}
                </div>
                <div className="text-[10px] text-text-tertiary truncate">
                  @{profile?.username || "writer"}
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="flex items-center justify-center py-2 px-3 text-xs font-medium text-text-primary hover:underline transition-colors"
          >
            Sign in to Poetly →
          </Link>
        )}
      </div>
    </div>
  );
}
