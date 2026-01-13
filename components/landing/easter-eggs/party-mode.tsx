"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useBadges, useAudio } from "@/hooks";
import { confettiConfig } from "@/lib/animations";

interface PartyModeProps {
  isActive: boolean;
  onEnd: () => void;
}

/**
 * Party Mode Component
 *
 * Effects:
 * - Rainbow color cycling on charts
 * - Confetti explosion
 * - Dancing elements
 * - Badge unlock
 */
export function PartyMode({ isActive, onEnd }: PartyModeProps) {
  const { play } = useAudio();

  useEffect(() => {
    if (!isActive) return;

    // Play party sound
    play.party();

    // Confetti burst
    const burst = () => {
      confetti({
        ...confettiConfig.party,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
      });
    };

    // Multiple bursts
    burst();
    const intervals = [
      setTimeout(burst, 200),
      setTimeout(burst, 400),
      setTimeout(burst, 600),
      setTimeout(burst, 800),
    ];

    // Continuous confetti for 5 seconds
    const confettiInterval = setInterval(() => {
      confetti({
        particleCount: 20,
        spread: 60,
        origin: { x: Math.random(), y: 0 },
        colors: confettiConfig.party.colors,
      });
    }, 200);

    // End party mode after 10 seconds
    const endTimer = setTimeout(() => {
      onEnd();
    }, 10000);

    return () => {
      intervals.forEach(clearTimeout);
      clearInterval(confettiInterval);
      clearTimeout(endTimer);
    };
  }, [isActive, onEnd, play]);

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Full screen overlay with rainbow animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[100]"
            style={{
              background:
                "linear-gradient(45deg, rgba(255,0,0,0.1), rgba(255,127,0,0.1), rgba(255,255,0,0.1), rgba(0,255,0,0.1), rgba(0,0,255,0.1), rgba(139,0,255,0.1))",
              backgroundSize: "400% 400%",
              animation: "rainbow-bg 2s ease infinite",
            }}
          />

          {/* Party mode indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotate: [0, -5, 5, -5, 5, 0],
            }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{
              rotate: { duration: 0.5, repeat: Infinity },
            }}
            className="fixed left-1/2 top-20 z-[101] -translate-x-1/2"
          >
            <div className="rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 px-6 py-3 text-lg font-bold text-white shadow-2xl">
              🎉 PARTY MODE! 🎉
            </div>
          </motion.div>

          {/* Floating emojis */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: -100,
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
              }}
              className="pointer-events-none fixed z-[99] text-3xl"
              style={{ left: `${Math.random() * 100}%` }}
            >
              {["🎮", "🎉", "🎊", "✨", "🌟", "🎈", "🎁", "🪩"][
                Math.floor(Math.random() * 8)
              ]}
            </motion.div>
          ))}

          {/* CSS for rainbow animation */}
          <style jsx global>{`
            @keyframes rainbow-bg {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }

            .party-mode-active * {
              animation: hue-rotate 2s linear infinite !important;
            }

            @keyframes hue-rotate {
              from {
                filter: hue-rotate(0deg);
              }
              to {
                filter: hue-rotate(360deg);
              }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage party mode state
 */
export function usePartyMode() {
  const { unlock } = useBadges();
  const { play } = useAudio();

  const activate = useCallback(() => {
    // Unlock badge
    unlock("party-animal");

    // Play achievement sound
    play.achievement();

    // Add party mode class to body
    document.body.classList.add("party-mode-active");

    return () => {
      document.body.classList.remove("party-mode-active");
    };
  }, [unlock, play]);

  return { activate };
}
