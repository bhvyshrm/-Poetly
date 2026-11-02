"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const dimensionMap = {
  xs: 24,
  sm: 32,
  md: 36,
  lg: 48,
  xl: 64,
};

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
  priority = false,
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = (name?.trim()?.[0] || "P").toUpperCase();
  const dimension = dimensionMap[size] || 36;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-surface-secondary select-none border border-border-default ${sizeClass} ${className}`}
      aria-label={name ? `${name}'s avatar` : "User avatar"}
    >
      {src && !imageFailed ? (
        <Image
          src={src}
          alt={name ? `${name}'s avatar` : "Avatar"}
          width={dimension}
          height={dimension}
          unoptimized
          priority={priority}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-display font-medium text-text-primary">{initial}</span>
      )}
    </div>
  );
}
