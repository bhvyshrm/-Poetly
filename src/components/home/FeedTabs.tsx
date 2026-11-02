"use client";

export type FeedTabType = "for-you" | "following" | "new-voices" | "trending";

const tabs: { id: FeedTabType; label: string }[] = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "new-voices", label: "New Voices" },
  { id: "trending", label: "Trending" },
];

interface FeedTabsProps {
  activeTab?: FeedTabType;
  onTabChange?: (tab: FeedTabType) => void;
}

export default function FeedTabs({ activeTab = "for-you", onTabChange }: FeedTabsProps) {
  return (
    <div className="flex items-center gap-6 sm:gap-8 border-b border-border-default px-1 pt-1 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`font-sans text-sm pb-3 relative transition-colors whitespace-nowrap cursor-pointer ${
              isActive
                ? "text-text-primary font-semibold"
                : "text-text-tertiary hover:text-text-primary font-medium"
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

