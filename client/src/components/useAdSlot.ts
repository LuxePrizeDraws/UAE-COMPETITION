import { useEffect, useRef } from 'react';

const AD_CLIENT = import.meta.env.VITE_GOOGLE_AD_CLIENT_ID || '';

/**
 * Resolves the ad slot for a given placement name.
 * Checks per-placement env var first, then the provided fallback slot,
 * then generic banner/sidebar fallback env vars.
 */
function resolveSlot(placement: string, adSlot?: string, fallbackEnvKey?: string): string {
  const envKey = `VITE_AD_UNIT_${placement.toUpperCase().replace(/-/g, '_')}`;
  return (
    (import.meta.env[envKey] as string | undefined) ||
    adSlot ||
    (fallbackEnvKey ? (import.meta.env[fallbackEnvKey] as string | undefined) : undefined) ||
    ''
  );
}

interface UseAdSlotOptions {
  placement: string;
  adSlot?: string;
  /** Generic fallback env key, e.g. 'VITE_AD_UNIT_BANNER' */
  fallbackEnvKey?: string;
}

/**
 * Shared hook for ad components.
 * Returns `{ adRef, resolvedSlot, isConfigured }`.
 * Pushes the ad to adsbygoogle via IntersectionObserver (lazy loading).
 * Re-pushes if resolvedSlot changes.
 */
export function useAdSlot({ placement, adSlot, fallbackEnvKey }: UseAdSlotOptions) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const prevSlot = useRef('');

  const resolvedSlot = resolveSlot(placement, adSlot, fallbackEnvKey);
  const isConfigured = Boolean(AD_CLIENT && resolvedSlot);

  useEffect(() => {
    if (!isConfigured) return;

    // Reset push state when slot changes so the new unit is pushed
    if (prevSlot.current && prevSlot.current !== resolvedSlot) {
      pushed.current = false;
    }
    prevSlot.current = resolvedSlot;

    if (pushed.current) return;

    const el = adRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !pushed.current) {
          pushed.current = true;
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          } catch {
            // Ignore ad errors (e.g. ad blocker)
          }
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isConfigured, resolvedSlot]);

  return { adRef, resolvedSlot, isConfigured, adClient: AD_CLIENT };
}
