/**
 * Badge System for Mario Charts Easter Eggs
 *
 * Badges are earned by discovering hidden features and interactions.
 * They persist in localStorage and are displayed in the footer.
 */

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: "common" | "rare" | "legendary";
}

export const BADGES: Badge[] = [
  {
    id: "konami-master",
    name: "Konami Master",
    icon: "🎮",
    description: "Entered the Konami Code",
    rarity: "legendary",
  },
  {
    id: "coin-collector",
    name: "Coin Collector",
    icon: "🪙",
    description: "Found all hidden coins",
    rarity: "rare",
  },
  {
    id: "chart-wrangler",
    name: "Chart Wrangler",
    icon: "🤠",
    description: "Dragged a chart around",
    rarity: "common",
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    icon: "⚡",
    description: "Scrolled way too fast",
    rarity: "common",
  },
  {
    id: "night-owl",
    name: "Night Owl",
    icon: "🦉",
    description: "Visited between 2-5 AM",
    rarity: "rare",
  },
  {
    id: "first-copy",
    name: "First Copy",
    icon: "📋",
    description: "Copied your first code snippet",
    rarity: "common",
  },
  {
    id: "mario-mode",
    name: "It's-a Me!",
    icon: "🍄",
    description: "Activated Mario mode",
    rarity: "legendary",
  },
  {
    id: "party-animal",
    name: "Party Animal",
    icon: "🎉",
    description: "Experienced party mode",
    rarity: "rare",
  },
];

const STORAGE_KEY = "mario-charts-badges";

/**
 * Get all earned badge IDs from localStorage
 */
export function getEarnedBadgeIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get all earned badges with full data
 */
export function getEarnedBadges(): Badge[] {
  const earnedIds = getEarnedBadgeIds();
  return BADGES.filter((badge) => earnedIds.includes(badge.id));
}

/**
 * Check if a specific badge has been earned
 */
export function hasBadge(badgeId: string): boolean {
  return getEarnedBadgeIds().includes(badgeId);
}

/**
 * Unlock a badge and save to localStorage
 * Returns true if newly unlocked, false if already had
 */
export function unlockBadge(badgeId: string): boolean {
  if (typeof window === "undefined") return false;

  const earnedIds = getEarnedBadgeIds();

  if (earnedIds.includes(badgeId)) {
    return false; // Already unlocked
  }

  const badge = BADGES.find((b) => b.id === badgeId);
  if (!badge) {
    console.warn(`Unknown badge ID: ${badgeId}`);
    return false;
  }

  earnedIds.push(badgeId);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(earnedIds));
    return true;
  } catch {
    console.error("Failed to save badge to localStorage");
    return false;
  }
}

/**
 * Get badge by ID
 */
export function getBadge(badgeId: string): Badge | undefined {
  return BADGES.find((b) => b.id === badgeId);
}

/**
 * Clear all badges (for testing)
 */
export function clearAllBadges(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get badge count by rarity
 */
export function getBadgeStats(): {
  total: number;
  earned: number;
  byRarity: Record<Badge["rarity"], { total: number; earned: number }>;
} {
  const earnedIds = getEarnedBadgeIds();

  const stats = {
    total: BADGES.length,
    earned: earnedIds.length,
    byRarity: {
      common: { total: 0, earned: 0 },
      rare: { total: 0, earned: 0 },
      legendary: { total: 0, earned: 0 },
    },
  };

  BADGES.forEach((badge) => {
    stats.byRarity[badge.rarity].total++;
    if (earnedIds.includes(badge.id)) {
      stats.byRarity[badge.rarity].earned++;
    }
  });

  return stats;
}

/**
 * Check for time-based badges (e.g., night owl)
 */
export function checkTimeBadges(): string | null {
  const hour = new Date().getHours();

  // Night owl: 2-5 AM
  if (hour >= 2 && hour < 5) {
    if (!hasBadge("night-owl")) {
      return "night-owl";
    }
  }

  return null;
}
