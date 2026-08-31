import './MissionImpact.css';

export default function MissionImpact() {
  return (
    <main className="mission-page">
      <div className="mission-container">

        {/* Hero */}
        <section className="mission-hero">
          <h1>Our Mission</h1>
          <p className="mission-tagline">
            A transparent, community-focused prize platform built on fair access, honest economics,
            and meaningful social impact.
          </p>
        </section>

        {/* Mission statement */}
        <section className="mission-section">
          <h2>What We Stand For</h2>
          <p>
            UAE Competition Platform exists to deliver a secure, engaging, and genuinely fair prize
            experience. Every competition we run is governed by transparent odds, ring-fenced prize
            funds, and a publicly verifiable draw process. We believe everyone deserves a fair shot —
            and we build every feature around that belief.
          </p>
          <p>
            Beyond entertainment, we are committed to using the success of this platform to give back.
            Every £1,000,000 in verified platform revenue triggers a £50,000 donation to mental health
            awareness initiatives, published publicly with proof of transfer.
          </p>
        </section>

        {/* Social impact */}
        <section className="mission-section mission-impact">
          <h2>Social Impact Commitment</h2>
          <div className="impact-cards">
            <div className="impact-card">
              <span className="impact-icon">🧠</span>
              <h3>Mental Health Awareness</h3>
              <p>
                We donate <strong>£50,000 for every £1,000,000</strong> in verified platform revenue to
                mental health charities and crisis-prevention programmes. Donations are made quarterly
                and receipts are published in our transparency report.
              </p>
            </div>
            <div className="impact-card">
              <span className="impact-icon">🔒</span>
              <h3>Ring-Fenced Prize Funds</h3>
              <p>
                Prize money is held in dedicated, segregated accounts from the moment a competition
                opens. It cannot be used for operational expenses. Winners are paid promptly from
                these protected funds.
              </p>
            </div>
            <div className="impact-card">
              <span className="impact-icon">📊</span>
              <h3>Transparent Odds</h3>
              <p>
                Every competition displays the total number of tickets available and tickets sold in
                real time so you always know your true odds before you enter.
              </p>
            </div>
            <div className="impact-card">
              <span className="impact-icon">⚡</span>
              <h3>Fast Payouts</h3>
              <p>
                Winners receive payment or prize fulfilment confirmation within 5 business days of
                the verified draw. No delays, no unnecessary friction.
              </p>
            </div>
          </div>
        </section>

        {/* Transparency / reporting */}
        <section className="mission-section">
          <h2>Reporting &amp; Transparency</h2>
          <p>
            We believe accountability must be built in, not bolted on. Our transparency commitments include:
          </p>
          <ul className="mission-list">
            <li>
              <strong>Quarterly Impact Reports</strong> — published summaries of revenue milestones,
              donation transfers, and charity receipts.
            </li>
            <li>
              <strong>Live Draw Records</strong> — every draw result is logged, timestamped, and
              available for audit in the Live Dashboard.
            </li>
            <li>
              <strong>Ring-Fencing Certificates</strong> — independent confirmation that prize funds
              are held in segregated accounts, updated monthly.
            </li>
            <li>
              <strong>Winner Announcements</strong> — verified winner details (with consent) are
              published after every draw.
            </li>
          </ul>
        </section>

        {/* Future foundation */}
        <section className="mission-section mission-foundation">
          <h2>Looking Ahead: A Dedicated Mental Health Foundation</h2>
          <p>
            As the platform grows, we intend to establish a dedicated charitable foundation focused on
            mental health awareness, early intervention, and suicide prevention. The foundation will be
            structured with independent governance to ensure donations reach front-line support services.
          </p>
          <p>
            If you are struggling with your mental health right now, please reach out. Support is
            available 24/7:
          </p>
          <ul className="mission-list">
            <li><strong>Samaritans (UK):</strong> 116 123 (free, 24/7)</li>
            <li><strong>Crisis Text Line:</strong> Text HOME to 85258</li>
            <li><strong>Mind:</strong> <a href="https://www.mind.org.uk" target="_blank" rel="noopener noreferrer">mind.org.uk</a></li>
          </ul>
        </section>

      </div>
    </main>
  );
}
