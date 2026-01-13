"use client";

import { useState, useEffect, useCallback } from "react";
import {
  initAudio,
  toggleAudio as toggleAudioUtil,
  enableAudio,
  disableAudio,
  isEnabled,
  playAchievement,
  playCopy,
  playParty,
  playClick,
  playCoin,
} from "@/lib/audio";

interface UseAudioReturn {
  isEnabled: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
  play: {
    achievement: () => void;
    copy: () => void;
    party: () => void;
    click: () => void;
    coin: () => void;
  };
}

/**
 * Hook to manage audio system
 *
 * @example
 * ```tsx
 * const { isEnabled, toggle, play } = useAudio();
 *
 * // Toggle audio
 * <button onClick={toggle}>
 *   {isEnabled ? "🔊" : "🔇"}
 * </button>
 *
 * // Play achievement sound
 * play.achievement();
 * ```
 */
export function useAudio(): UseAudioReturn {
  const [enabled, setEnabled] = useState(false);

  // Initialize audio on mount
  useEffect(() => {
    initAudio();
    setEnabled(isEnabled());
  }, []);

  const toggle = useCallback(() => {
    const newState = toggleAudioUtil();
    setEnabled(newState);
  }, []);

  const enable = useCallback(() => {
    enableAudio();
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    disableAudio();
    setEnabled(false);
  }, []);

  const play = {
    achievement: playAchievement,
    copy: playCopy,
    party: playParty,
    click: playClick,
    coin: playCoin,
  };

  return {
    isEnabled: enabled,
    toggle,
    enable,
    disable,
    play,
  };
}
