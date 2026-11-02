"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type LogoSize = "sm" | "md" | "lg";

const sizes: Record<LogoSize, { box: number; text: string }> = {
  sm: { box: 28, text: "text-lg" },
  md: { box: 32, text: "text-xl" },
  lg: { box: 44, text: "text-2xl" },
};

export default function Logo({ size = "md", withWordmark = true }: { size?: LogoSize; withWordmark?: boolean }) {
  const [missing, setMissing] = useState(false);
  const dims = sizes[size];

  return (
    <Link href="/home" className="flex items-center gap-2.5" aria-label="Poetly home" style={{ minHeight: 44 }}>
      {!missing ? (
        <Image
          src="/logo.svg"
          alt="Poetly"
          width={dims.box}
          height={dims.box}
          priority
          onError={() => setMissing(true)}
        />
      ) : (
        <span
          className="bg-primary flex items-center justify-center rounded-md text-on-primary font-display font-semibold"
          style={{ width: dims.box, height: dims.box }}
          aria-hidden="true"
        >
          P
        </span>
      )}
      {withWordmark && (
        <span className={`font-display text-text-primary tracking-tight ${dims.text}`}>
          Poetly
        </span>
      )}
    </Link>
  );
}
