import './Ads.css';

export type PrizeCategory =
  | 'cash'
  | 'vehicle'
  | 'experience'
  | 'jewelry'
  | 'watch'
  | 'electronics'
  | 'travel'
  | 'package'
  | 'default';

interface AffiliateProduct {
  icon: string;
  name: string;
  desc: string;
  commission: string;
  url: string;
  utmSource?: string;
}

const AFFILIATE_MAP: Record<PrizeCategory, AffiliateProduct[]> = {
  watch: [
    {
      icon: '⌚',
      name: 'Luxury Watches',
      desc: 'Shop premium timepieces',
      commission: 'Up to 8% commission',
      url: 'https://www.amazon.co.uk/s?k=luxury+watches&tag=REPLACE_TAG',
    },
    {
      icon: '💎',
      name: 'Watch Straps & Accessories',
      desc: 'Customise your timepiece',
      commission: 'Up to 10% commission',
      url: 'https://www.amazon.co.uk/s?k=watch+accessories&tag=REPLACE_TAG',
    },
  ],
  jewelry: [
    {
      icon: '💍',
      name: 'Fine Jewellery',
      desc: 'Diamond & gold collections',
      commission: 'Up to 12% commission',
      url: 'https://www.amazon.co.uk/s?k=fine+jewellery&tag=REPLACE_TAG',
    },
    {
      icon: '✨',
      name: 'Jewellery Insurance',
      desc: 'Protect your prize',
      commission: 'Up to £40 per referral',
      url: 'https://www.comparethemarket.com/home-insurance/content/jewellery-insurance/',
    },
  ],
  vehicle: [
    {
      icon: '🏎️',
      name: 'Supercar Insurance',
      desc: 'Specialist cover for your new car',
      commission: 'Up to £50 per referral',
      url: 'https://www.admiral.com/car-insurance',
    },
    {
      icon: '🔧',
      name: 'Car Care & Detailing',
      desc: 'Premium products for prestige cars',
      commission: 'Up to 6% commission',
      url: 'https://www.amazon.co.uk/s?k=car+detailing+kit&tag=REPLACE_TAG',
    },
  ],
  travel: [
    {
      icon: '✈️',
      name: 'Luxury Flights',
      desc: 'Business & first class deals',
      commission: '2–5% per booking',
      url: 'https://www.skyscanner.net/',
    },
    {
      icon: '🏨',
      name: '5-Star Hotels',
      desc: 'Find your perfect stay',
      commission: '4–8% per booking',
      url: 'https://www.booking.com/',
    },
    {
      icon: '🛡️',
      name: 'Travel Insurance',
      desc: 'Worldwide cover from £10',
      commission: 'Up to £15 per referral',
      url: 'https://www.comparethemarket.com/travel-insurance/',
    },
  ],
  experience: [
    {
      icon: '🥂',
      name: 'Luxury Experiences',
      desc: 'Unforgettable moments',
      commission: 'Up to 10% commission',
      url: 'https://www.virginexperiencedays.co.uk/',
    },
    {
      icon: '✈️',
      name: 'Luxury Hotel Breaks',
      desc: 'Hand-picked 5-star escapes',
      commission: '5–10% per booking',
      url: 'https://www.booking.com/luxury',
    },
  ],
  electronics: [
    {
      icon: '📱',
      name: 'Premium Electronics',
      desc: 'Latest tech & gadgets',
      commission: '2–5% commission',
      url: 'https://www.amazon.co.uk/s?k=premium+electronics&tag=REPLACE_TAG',
    },
    {
      icon: '🔒',
      name: 'Gadget Insurance',
      desc: 'Protect your new tech',
      commission: 'Up to £20 per referral',
      url: 'https://www.comparethemarket.com/',
    },
  ],
  cash: [
    {
      icon: '📈',
      name: 'Investment Accounts',
      desc: 'Grow your winnings',
      commission: 'Up to £100 per referral',
      url: 'https://www.nutmeg.com/',
    },
    {
      icon: '🏦',
      name: 'Premium Bank Accounts',
      desc: 'Make the most of your prize',
      commission: 'Up to £75 per referral',
      url: 'https://www.monzo.com/premium/',
    },
    {
      icon: '⚖️',
      name: 'Financial Planning',
      desc: 'Specialist winner advice',
      commission: 'Referral fee',
      url: 'https://www.unbiased.co.uk/',
    },
  ],
  package: [
    {
      icon: '🏡',
      name: 'Luxury Property',
      desc: 'Invest your prize wisely',
      commission: 'Referral fee',
      url: 'https://www.rightmove.co.uk/',
    },
    {
      icon: '📈',
      name: 'Wealth Management',
      desc: 'Expert financial guidance',
      commission: 'Up to £200 per referral',
      url: 'https://www.unbiased.co.uk/',
    },
  ],
  default: [
    {
      icon: '🛍️',
      name: 'Amazon Luxury Store',
      desc: 'Premium products & gifts',
      commission: 'Up to 10% commission',
      url: 'https://www.amazon.co.uk/luxury?tag=REPLACE_TAG',
    },
    {
      icon: '💰',
      name: 'Compare Insurance',
      desc: 'Protect what matters',
      commission: 'Up to £50 per referral',
      url: 'https://www.comparethemarket.com/',
    },
  ],
};

interface AffiliateWidgetProps {
  /** Prize category for contextual affiliate links */
  category?: PrizeCategory;
  /** Custom widget title */
  title?: string;
  className?: string;
}

/**
 * Contextual affiliate product widget.
 * Shows prize-relevant affiliate links with FTC-compliant disclosure.
 */
export default function AffiliateWidget({
  category = 'default',
  title,
  className = '',
}: AffiliateWidgetProps) {
  const products = AFFILIATE_MAP[category] || AFFILIATE_MAP.default;
  const widgetTitle = title || `Related to Your Prize 🎁`;

  // Add UTM tracking to each URL
  const withUtm = (url: string) => {
    try {
      const u = new URL(url);
      u.searchParams.set('utm_source', 'luxeprizedraws');
      u.searchParams.set('utm_medium', 'affiliate');
      u.searchParams.set('utm_campaign', `prize-${category}`);
      return u.toString();
    } catch {
      return url;
    }
  };

  return (
    <div className={`affiliate-widget ${className}`}>
      <div className="affiliate-widget__label">Sponsored — Affiliate Links</div>
      <div className="affiliate-widget__title">{widgetTitle}</div>
      <div className="affiliate-widget__grid">
        {products.map((p) => (
          <a
            key={`${p.name}-${p.url}`}
            href={withUtm(p.url)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="affiliate-item"
            aria-label={`Affiliate link: ${p.name}`}
          >
            <span className="affiliate-item__icon">{p.icon}</span>
            <span className="affiliate-item__name">{p.name}</span>
            <span className="affiliate-item__desc">{p.desc}</span>
            <span className="affiliate-item__commission">{p.commission}</span>
          </a>
        ))}
      </div>
      <div className="affiliate-widget__disclaimer">
        * Affiliate links — we may earn a commission at no cost to you.
      </div>
    </div>
  );
}
