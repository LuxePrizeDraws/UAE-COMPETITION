import { useAdSlot } from './useAdSlot';
import './Ads.css';

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
  const { adRef, resolvedSlot, isConfigured, adClient } = useAdSlot({
    placement,
    adSlot,
    fallbackEnvKey: 'VITE_AD_UNIT_BANNER',
  });

  if (!isConfigured) return null;

  return (
    <div className={`ad-banner ${className}`} aria-label="Advertisement">
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
