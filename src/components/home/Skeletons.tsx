"use client";

export function ComposerSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton-avatar" />
        <div className="flex-1">
          <div className="skeleton-line long" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );
}

export function DailyMomentSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="space-y-3">
        <div className="skeleton-line short" />
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
      </div>
      <div className="mt-6 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton-line short" style={{ width: "80px" }} />
            <div className="skeleton-line medium" style={{ width: "200px" }} />
          </div>
          <div className="skeleton-line" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
        </div>
      </div>
    </div>
  );
}

export function PoemCardSkeleton() {
  return (
    <div className="glass-surface rounded-2xl p-6 sm:p-7 space-y-5 specular-top-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full skeleton shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="w-32 h-3.5 skeleton rounded" />
          <div className="w-20 h-2.5 skeleton rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="w-2/3 h-7 skeleton rounded" />
        <div className="w-full h-4 skeleton rounded" />
        <div className="w-5/6 h-4 skeleton rounded" />
        <div className="w-1/2 h-4 skeleton rounded" />
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-5 rounded-full skeleton" />
        <div className="w-14 h-5 rounded-full skeleton" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border-subtle/40">
        <div className="flex gap-6">
          <div className="w-12 h-4 skeleton rounded" />
          <div className="w-12 h-4 skeleton rounded" />
        </div>
        <div className="w-6 h-4 skeleton rounded" />
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="skeleton-avatar" style={{ width: "32px", height: "32px" }} />
          <div className="flex-1 space-y-2">
            <div className="skeleton-line long" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WriterSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton-avatar" style={{ width: "40px", height: "40px" }} />
          <div className="flex-1 space-y-2">
            <div className="skeleton-line" style={{ width: "100px" }} />
            <div className="skeleton-line" style={{ width: "80px" }} />
          </div>
          <div className="skeleton-line" style={{ width: "60px", height: "32px", borderRadius: "9999px" }} />
        </div>
      ))}
    </div>
  );
}
