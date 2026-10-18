import React from "react";

export interface RightRailProps {
  children?: React.ReactNode;
  className?: string;
  width?: string;
}

export default function RightRail({
  children,
  className = "",
  width = "w-[300px] xl:w-[340px]",
}: RightRailProps) {
  if (!children) return null;

  return (
    <aside
      className={`hidden lg:block shrink-0 ${width} ${className}`}
      aria-label="Contextual panel"
    >
      <div className="sticky top-[calc(var(--nav-height,60px)+1.25rem)] max-h-[calc(100vh-var(--nav-height,60px)-2.5rem)] overflow-y-auto space-y-6 pb-12 pr-1 scrollbar-thin">
        {children}
      </div>
    </aside>
  );
}
