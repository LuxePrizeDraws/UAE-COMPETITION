import { useCallback, useRef } from 'react';

/**
 * Returns a `playSound` function that triggers a short futuristic click tone
 * using the Web Audio API. No external audio files are required.
 * The AudioContext is lazily created on first interaction to satisfy
 * browser autoplay policies and keep the hook lightweight.
 */
export function useButtonSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(() => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;

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
