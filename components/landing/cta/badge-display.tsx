"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBadges } from "@/hooks";
import type { Badge } from "@/lib/badges";

interface BadgeDisplayProps {
  className?: string;
}

/**
 * Badge Display Component
 *
 * Shows earned badges in the footer.
 * Badges are unlocked by discovering easter eggs.
 */
export function BadgeDisplay({ className }: BadgeDisplayProps) {
  const { badges } = useBadges();

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-xs text-muted-foreground">Your badges:</span>
      <div className="flex items-center gap-1">
        {badges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}

interface BadgeItemProps {
  readonly badge: Badge;
}

function BadgeItem({ badge }: BadgeItemProps) {
  const rarityColors = {
    common: "bg-muted ring-border",
    rare: "bg-primary/10 ring-primary/30",
    legendary: "bg-yellow-500/20 ring-yellow-500/50",
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.2, rotate: 10 }}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full ring-1 cursor-pointer",
        rarityColors[badge.rarity]
      )}
      title={`${badge.name}: ${badge.description}`}
    >
      <span className="text-sm">{badge.icon}</span>

      {/* Legendary glow */}
      {badge.rarity === "legendary" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(250, 204, 21, 0)",
              "0 0 10px 2px rgba(250, 204, 21, 0.3)",
              "0 0 0 0 rgba(250, 204, 21, 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

/**
 * Badge Unlock Toast Component
 */
interface BadgeToastProps {
  badge: Badge | null;
  onDismiss: () => void;
}

export function BadgeToast({ badge, onDismiss }: BadgeToastProps) {
  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
        >
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-sm",
              badge.rarity === "legendary"
                ? "border-yellow-500/50 bg-yellow-500/10"
                : badge.rarity === "rare"
                ? "border-primary/30 bg-primary/10"
                : "border-border bg-muted"
            )}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {badge.icon}
            </motion.span>
            <div>
              <p className="text-sm font-medium text-foreground">Badge Unlocked!</p>
              <p className="text-xs text-muted-foreground">{badge.name}</p>
            </div>
            <button
              onClick={onDismiss}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
