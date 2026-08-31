import { useEffect, useRef } from 'react';
import './Ads.css';

const AD_CLIENT = import.meta.env.VITE_GOOGLE_AD_CLIENT_ID || '';

interface AdSidebarProps {
  adSlot?: string;
  placement?: string;
  className?: string;
}

/**
 * Sidebar / medium-rectangle ad (300×250 mobile, 300×600 desktop).
 * Lazy-loaded via IntersectionObserver.
 * Shows nothing if VITE_GOOGLE_AD_CLIENT_ID is not configured.
 */
export default function AdSidebar({ adSlot, placement = 'sidebar', className = '' }: AdSidebarProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const envKey = `VITE_AD_UNIT_${placement.toUpperCase().replace(/-/g, '_')}`;
  const resolvedSlot = (import.meta.env[envKey] as string | undefined) || adSlot || import.meta.env.VITE_AD_UNIT_SIDEBAR || '';

  useEffect(() => {
    if (!AD_CLIENT || !resolvedSlot) return;
    if (pushed.current) return;

    try {
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
    <div className={`ad-sidebar ${className}`} aria-label="Advertisement">
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
