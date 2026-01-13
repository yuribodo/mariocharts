"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useBadges } from "@/hooks";
import { PartyMode, usePartyMode } from "./party-mode";

interface EasterEggsContextValue {
  isPartyMode: boolean;
  activatePartyMode: () => void;
  badges: ReturnType<typeof useBadges>;
}

const EasterEggsContext = createContext<EasterEggsContextValue | null>(null);

export function useEasterEggs() {
  const context = useContext(EasterEggsContext);
  if (!context) {
    throw new Error("useEasterEggs must be used within EasterEggsProvider");
  }
  return context;
}

interface EasterEggsProviderProps {
  children: React.ReactNode;
}

/**
 * Easter Eggs Provider
 *
 * Manages all easter eggs and their states:
 * - Console message
 * - Speed scroll detection
 * - Time-based badges
 */
export function EasterEggsProvider({ children }: EasterEggsProviderProps) {
  const [isPartyMode, setIsPartyMode] = useState(false);
  const badges = useBadges();
  const { activate: activateParty } = usePartyMode();

  // Console message on mount
  useEffect(() => {
    printConsoleMessage();
    const cleanup = setupConsoleCommands(badges.unlock);
    return cleanup;
  }, [badges.unlock]);

  // Speed scroll detection
  useEffect(() => {
    let lastScrollTop = 0;
    let scrollSpeed = 0;
    let speedTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const st = window.scrollY;
      const diff = Math.abs(st - lastScrollTop);
      scrollSpeed = diff;
      lastScrollTop = st;

      // If scrolling very fast for 1 second
      if (scrollSpeed > 200) {
        clearTimeout(speedTimeout);
        speedTimeout = setTimeout(() => {
          if (scrollSpeed > 200) {
            badges.unlock("speed-demon");
          }
          scrollSpeed = 0;
        }, 1000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(speedTimeout);
    };
  }, [badges]);

  const handlePartyModeEnd = useCallback(() => {
    setIsPartyMode(false);
  }, []);

  const activatePartyMode = useCallback(() => {
    if (!isPartyMode) {
      setIsPartyMode(true);
      activateParty();
    }
  }, [isPartyMode, activateParty]);

  return (
    <EasterEggsContext.Provider
      value={{ isPartyMode, activatePartyMode, badges }}
    >
      {children}
      <PartyMode isActive={isPartyMode} onEnd={handlePartyModeEnd} />
    </EasterEggsContext.Provider>
  );
}

/**
 * Print styled message to browser console
 */
function printConsoleMessage() {
  if (typeof window === "undefined") return;

  const styles = {
    title: "font-size: 24px; font-weight: bold; color: #a855f7;",
    subtitle: "font-size: 14px; color: #ec4899;",
    text: "font-size: 12px; color: #888;",
    link: "font-size: 12px; color: #22d3ee; text-decoration: underline;",
  };

  console.log("%c🎨 Mario Charts", styles.title);
  console.log(
    "%cYou found the console! You must be a developer.",
    styles.subtitle
  );
  console.log(
    `%cCheck out our GitHub: %chttps://github.com/yuribodo/mariocharts`,
    styles.text,
    styles.link
  );
  console.log(
    "%c\nPS: Try typing mario() in the console 😉",
    styles.text
  );
}

/**
 * Set up hidden console commands
 * Returns cleanup function to remove commands on unmount
 */
function setupConsoleCommands(unlock: (id: string) => boolean): () => void {
  if (typeof window === "undefined") return () => {};

  const win = window as unknown as Record<string, unknown>;

  // Mario power-up command
  win.mario = () => {
    console.log("%c🍄 Power Up!", "font-size: 40px;");

    // Visual effect
    document.body.style.transform = "scale(1.05)";
    document.body.style.transition = "transform 0.3s ease";

    setTimeout(() => {
      document.body.style.transform = "scale(1)";
    }, 300);

    // Unlock badge
    unlock("mario-mode");

    return "🍄 1UP!";
  };

  // Party command
  win.party = () => {
    console.log("%c🎉 Party Mode!", "font-size: 30px;");
    return "Party mode activated!";
  };

  // Stats command
  win.stats = () => {
    const badgesEarned = JSON.parse(
      localStorage.getItem("mario-charts-badges") || "[]"
    );
    console.log("%c📊 Your Stats", "font-size: 16px; font-weight: bold;");
    console.log(`Badges earned: ${badgesEarned.length}`);
    console.log("Badges:", badgesEarned);
    return { badges: badgesEarned };
  };

  // Return cleanup function
  return () => {
    delete win.mario;
    delete win.party;
    delete win.stats;
  };
}
