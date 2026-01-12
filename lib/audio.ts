/**
 * Audio Manager for Mario Charts
 *
 * Uses Howler.js for cross-browser audio support.
 * Audio is disabled by default and can be toggled by users.
 */

import { Howl } from "howler";

// Audio state
let isAudioEnabled = false;
let isInitialized = false;

// Sound instances (lazy loaded)
let sounds: {
  achievement?: Howl;
  copy?: Howl;
  party?: Howl;
  click?: Howl;
  coin?: Howl;
} = {};

// Storage key for audio preference
const AUDIO_STORAGE_KEY = "mario-charts-audio-enabled";

/**
 * Initialize audio system
 * Must be called after user interaction (browser autoplay policy)
 */
export function initAudio(): void {
  if (isInitialized || typeof window === "undefined") return;

  // Load user preference
  try {
    const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
    isAudioEnabled = stored === "true";
  } catch {
    isAudioEnabled = false;
  }

  // Lazy load sounds when needed
  isInitialized = true;
}

/**
 * Load a specific sound
 */
function loadSound(name: keyof typeof sounds): Howl {
  // Note: In production, these would be actual audio file paths
  // For now, we use placeholder URLs that would be replaced
  const soundUrls: Record<keyof typeof sounds, string> = {
    achievement: "/sounds/achievement.mp3",
    copy: "/sounds/copy.mp3",
    party: "/sounds/party.mp3",
    click: "/sounds/click.mp3",
    coin: "/sounds/coin.mp3",
  };

  if (!sounds[name]) {
    sounds[name] = new Howl({
      src: [soundUrls[name]],
      volume: 0.5,
      preload: false, // Don't preload until needed
    });
  }

  return sounds[name]!;
}

/**
 * Play a sound effect
 */
export function playSound(name: keyof typeof sounds): void {
  if (!isAudioEnabled || typeof window === "undefined") return;

  try {
    const sound = loadSound(name);
    sound.play();
  } catch (error) {
    console.warn(`Failed to play sound: ${name}`, error);
  }
}

/**
 * Play achievement unlock sound
 */
export function playAchievement(): void {
  playSound("achievement");
}

/**
 * Play copy success sound
 */
export function playCopy(): void {
  playSound("copy");
}

/**
 * Play party mode sound
 */
export function playParty(): void {
  playSound("party");
}

/**
 * Play click sound
 */
export function playClick(): void {
  playSound("click");
}

/**
 * Play coin collect sound
 */
export function playCoin(): void {
  playSound("coin");
}

/**
 * Toggle audio on/off
 */
export function toggleAudio(): boolean {
  isAudioEnabled = !isAudioEnabled;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, String(isAudioEnabled));
    } catch {
      // Ignore storage errors
    }
  }

  return isAudioEnabled;
}

/**
 * Enable audio
 */
export function enableAudio(): void {
  isAudioEnabled = true;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Disable audio
 */
export function disableAudio(): void {
  isAudioEnabled = false;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, "false");
    } catch {
      // Ignore storage errors
    }
  }

  // Stop all playing sounds
  Object.values(sounds).forEach((sound) => {
    if (sound) {
      sound.stop();
    }
  });
}

/**
 * Check if audio is enabled
 */
export function isEnabled(): boolean {
  return isAudioEnabled;
}

/**
 * Set volume for all sounds
 */
export function setVolume(volume: number): void {
  const clampedVolume = Math.max(0, Math.min(1, volume));

  Object.values(sounds).forEach((sound) => {
    if (sound) {
      sound.volume(clampedVolume);
    }
  });
}

/**
 * Preload specific sounds
 */
export function preloadSounds(names: (keyof typeof sounds)[]): void {
  names.forEach((name) => {
    const sound = loadSound(name);
    sound.load();
  });
}

/**
 * Cleanup all sounds
 */
export function cleanup(): void {
  Object.values(sounds).forEach((sound) => {
    if (sound) {
      sound.unload();
    }
  });
  sounds = {};
  isInitialized = false;
}
