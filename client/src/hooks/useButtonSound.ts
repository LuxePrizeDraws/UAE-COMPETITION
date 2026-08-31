import { useCallback } from 'react';

/**
 * Module-level AudioContext singleton, created lazily on first interaction.
 * A single instance is shared across all components to avoid hitting the
 * browser's concurrent AudioContext limit.
 */
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioContext) {
      sharedAudioContext = new AudioContext();
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

/**
 * Returns a `playSound` function that triggers a short futuristic click tone
 * using the Web Audio API. No external audio files are required.
 */
export function useButtonSound() {
  const playSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch {
      // Silently ignore if Web Audio API is unavailable
    }
  }, []);

  return playSound;
}
