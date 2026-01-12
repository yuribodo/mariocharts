"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getEarnedBadges,
  unlockBadge as unlockBadgeUtil,
  hasBadge,
  checkTimeBadges,
  getBadge,
  type Badge,
} from "@/lib/badges";

interface UseBadgesReturn {
  badges: Badge[];
  unlock: (badgeId: string) => boolean;
  has: (badgeId: string) => boolean;
  lastUnlocked: Badge | null;
  clearLastUnlocked: () => void;
}

/**
 * Hook to manage badge system
 *
 * @example
 * ```tsx
 * const { badges, unlock, lastUnlocked } = useBadges();
 *
 * // Unlock a badge
 * const wasNewlyUnlocked = unlock("konami-master");
 *
 * // Show toast when badge is unlocked
 * useEffect(() => {
 *   if (lastUnlocked) {
 *     showToast(`Badge unlocked: ${lastUnlocked.name}`);
 *   }
 * }, [lastUnlocked]);
 * ```
 */
export function useBadges(): UseBadgesReturn {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [lastUnlocked, setLastUnlocked] = useState<Badge | null>(null);

  // Load badges on mount
  useEffect(() => {
    setBadges(getEarnedBadges());

    // Check for time-based badges
    const timeBadge = checkTimeBadges();
    if (timeBadge) {
      const wasNew = unlockBadgeUtil(timeBadge);
      if (wasNew) {
        const badge = getBadge(timeBadge);
        if (badge) {
          setLastUnlocked(badge);
          setBadges(getEarnedBadges());
        }
      }
    }
  }, []);

  const unlock = useCallback((badgeId: string): boolean => {
    const wasNew = unlockBadgeUtil(badgeId);

    if (wasNew) {
      const badge = getBadge(badgeId);
      if (badge) {
        setLastUnlocked(badge);
        setBadges(getEarnedBadges());
      }
    }

    return wasNew;
  }, []);

  const has = useCallback((badgeId: string): boolean => {
    return hasBadge(badgeId);
  }, []);

  const clearLastUnlocked = useCallback(() => {
    setLastUnlocked(null);
  }, []);

  return {
    badges,
    unlock,
    has,
    lastUnlocked,
    clearLastUnlocked,
  };
}
