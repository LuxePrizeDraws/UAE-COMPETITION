import './LegendsLeague.css';

const tiers = [
  {
    icon: '🥉',
    name: 'Bronze Legend',
    range: '1–5 entries',
    color: '#cd7f32',
    perks: ['Entry in Hall of Fame', 'Bronze profile badge', 'Early access to new competitions'],
  },
  {
    icon: '🥈',
    name: 'Silver Legend',
    range: '6–25 entries',
    color: '#c0c0c0',
    perks: ['All Bronze perks', 'Silver profile badge', '1 free bonus entry/week'],
  },
  {
    icon: '🥇',
    name: 'Gold Legend',
    range: '26–100 entries',
    color: '#c9a84c',
    perks: ['All Silver perks', 'Gold profile badge', '5% discount on all entries'],
  },
  {
    icon: '💎',
    name: 'Platinum Legend',
    range: '100+ entries',
    color: '#a5d8ff',
    perks: ['All Gold perks', 'Platinum VIP badge', '10% discount + 2 free entries/week', 'Priority draw access'],
  },
  {
    icon: '🏆',
    name: 'Champion',
    range: 'Winners only',
    color: '#f5d020',
    perks: ['Lifetime Champion status', 'Featured on homepage', 'Community celebration', 'Exclusive champion badge', 'VIP forever perks'],
  },
];

const hallOfFame = [
  { name: 'Mohammed A.', prize: '£250,000 Cash', date: 'Jan 2025', tier: 'Champion' },
  { name: 'Sarah K.', prize: 'Lamborghini Huracán', date: 'Feb 2025', tier: 'Champion' },
  { name: 'James P.', prize: '£100,000 Cash', date: 'Mar 2025', tier: 'Champion' },
  { name: 'Aisha R.', prize: 'Ferrari 488', date: 'Apr 2025', tier: 'Champion' },
];

export default function LegendsLeague() {
  return (
    <div className="ll-page">
      {/* Hero */}
      <section className="ll-hero">
        <div className="ll-hero-glow" />
        <div className="ll-hero-content">
          <span className="ll-hero-badge">👑 Exclusive Membership</span>
          <h1 className="ll-hero-title">THE LEGENDS LEAGUE</h1>
          <p className="ll-hero-sub">
            Every ticket you buy earns your place among legends. Climb the ranks, unlock exclusive perks,
            and stand alongside our greatest winners — for life.
          </p>
          <a href="#tiers" className="ll-cta">SEE YOUR TIER ↓</a>
        </div>
      </section>

      {/* How it works */}
      <section className="ll-how">
        <div className="container">
          <h2 className="ll-section-title">HOW IT WORKS</h2>
          <div className="ll-how-grid">
            <div className="ll-how-item">
              <div className="ll-how-num">1</div>
              <h3>Buy Any Ticket</h3>
              <p>Purchase any competition entry on the platform — you're automatically enrolled.</p>
            </div>
            <div className="ll-how-item">
              <div className="ll-how-num">2</div>
              <h3>Earn Your Tier</h3>
              <p>Your tier upgrades automatically as your entry count grows. Bronze → Silver → Gold → Platinum.</p>
            </div>
            <div className="ll-how-item">
              <div className="ll-how-num">3</div>
              <h3>Unlock Perks</h3>
              <p>Each tier unlocks exclusive benefits — discounts, free entries, and VIP access.</p>
            </div>
            <div className="ll-how-item">
              <div className="ll-how-num">4</div>
              <h3>Win = Champion</h3>
              <p>Every winner instantly achieves permanent Champion status with lifetime recognition.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="ll-tiers" id="tiers">
        <div className="container">
          <h2 className="ll-section-title">TIER SYSTEM</h2>
          <div className="ll-tiers-grid">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="ll-tier-card"
                style={{ '--tier-color': tier.color } as React.CSSProperties}
              >
                <div className="ll-tier-icon">{tier.icon}</div>
                <h3 className="ll-tier-name">{tier.name}</h3>
                <p className="ll-tier-range">{tier.range}</p>
                <ul className="ll-tier-perks">
                  {tier.perks.map((p) => (
                    <li key={p}>✓ {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hall of Fame */}
      <section className="ll-hof">
        <div className="container">
          <h2 className="ll-section-title">🏆 HALL OF FAME</h2>
          <p className="ll-hof-sub">Our Champions — their victories live here forever.</p>
          <div className="ll-hof-grid">
            {hallOfFame.map((w) => (
              <div key={w.name} className="ll-hof-card">
                <div className="ll-hof-trophy">🏆</div>
                <div className="ll-hof-name">{w.name}</div>
                <div className="ll-hof-prize">{w.prize}</div>
                <div className="ll-hof-date">Winner · {w.date}</div>
                <span className="ll-hof-badge">{w.tier}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ll-bottom-cta">
        <div className="container">
          <h2>EVERY TICKET MAKES YOU A LEGEND</h2>
          <p>Join thousands of members already climbing the ranks.</p>
          <a href="/" className="ll-cta ll-cta--large">ENTER A COMPETITION NOW →</a>
        </div>
      </section>
    </div>
  );
}
