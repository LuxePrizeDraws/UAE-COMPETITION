import { useEffect, useRef } from 'react';
import './Ads.css';

// Google AdSense client ID from environment variable
const AD_CLIENT = import.meta.env.VITE_GOOGLE_AD_CLIENT_ID || '';

interface AdBannerProps {
  /** Ad unit slot ID from Google AdMob/AdSense */
  adSlot?: string;
  /** Where on the page this ad appears (for labelling) */
  placement?: string;
  className?: string;
}

/**
 * Responsive banner ad component.
 * Renders a Google AdSense ins element with lazy loading.
 * Shows nothing if VITE_GOOGLE_AD_CLIENT_ID is not set.
 */
export default function AdBanner({ adSlot, placement = 'banner', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  // Resolve slot: per-placement env var wins, then prop, then generic fallback
  const envKey = `VITE_AD_UNIT_${placement.toUpperCase().replace(/-/g, '_')}`;
  const resolvedSlot = (import.meta.env[envKey] as string | undefined) || adSlot || import.meta.env.VITE_AD_UNIT_BANNER || '';

  useEffect(() => {
    // Don't render if ad client/slot not configured
    if (!AD_CLIENT || !resolvedSlot) return;
    if (pushed.current) return;

    try {
      // Push ad after mount using IntersectionObserver for lazy loading
      const el = adRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !pushed.current) {
            pushed.current = true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            observer.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } catch {
      // Ignore ad errors
    }
  }, [resolvedSlot]);

  if (!AD_CLIENT || !resolvedSlot) return null;

  return (
    <div className={`ad-banner ${className}`} aria-label="Advertisement">
      <div className="ad-container">
        <span className="ad-label">Ad</span>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={resolvedSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
