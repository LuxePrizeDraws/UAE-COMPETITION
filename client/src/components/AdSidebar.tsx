import { useAdSlot } from './useAdSlot';
import './Ads.css';

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
  const { adRef, resolvedSlot, isConfigured, adClient } = useAdSlot({
    placement,
    adSlot,
    fallbackEnvKey: 'VITE_AD_UNIT_SIDEBAR',
  });

  if (!isConfigured) return null;

  return (
    <div className={`ad-sidebar ${className}`} aria-label="Advertisement">
      <div className="ad-container">
        <span className="ad-label">Ad</span>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClient}
          data-ad-slot={resolvedSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
