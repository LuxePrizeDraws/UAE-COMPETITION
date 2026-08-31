import { Link } from 'react-router-dom';
import './PostalEntry.css';

export default function PostalEntry() {
  return (
    <div className="postal-page">
      {/* Hero */}
      <section className="postal-hero">
        <div className="container">
          <span className="postal-eyebrow">📮 Free Entry</span>
          <h1 className="postal-title">Enter Any Competition<br />Completely Free</h1>
          <p className="postal-subtitle">
            Every competition on LuxePrize can be entered for free by post.<br />
            Same draw. Same odds. Zero cost.
          </p>
          <div className="postal-equal-banner">
            <span className="equal-badge">✓ Equal Odds</span>
            <span>Postal entries are placed in the same draw as digital entries — no disadvantage, ever.</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="postal-steps">
        <div className="container">
          <h2 className="section-title">How to Enter by <span>Post</span></h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>Choose a Competition</h3>
              <p>Browse our live competitions on the <Link to="/">home page</Link> and decide which prize you'd like to enter.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Write Your Entry</h3>
              <p>On a piece of plain paper, write:
                <ul>
                  <li>Your full name</li>
                  <li>Your full address &amp; postcode</li>
                  <li>Your phone number or email</li>
                  <li>The competition name or ID</li>
                  <li>Your prize preference (cash or physical)</li>
                </ul>
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Send to Us</h3>
              <p>Post your entry to our address below. One free entry per envelope. Allow 5–7 working days for receipt.</p>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <h3>You're In the Draw</h3>
              <p>Your entry is added to the same draw as digital entrants with identical odds. If you win, we'll contact you directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Address */}
      <section className="postal-address-section">
        <div className="container">
          <div className="address-card">
            <div className="address-icon">🏤</div>
            <div>
              <h3>Postal Address</h3>
              <address className="address-block">
                <strong>LuxePrize Competitions</strong>
                PO Box 12345<br />
                London, EC1A 1BB<br />
                United Kingdom
              </address>
            </div>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="postal-rules">
        <div className="container">
          <h2 className="section-title">Free Entry <span>Rules</span></h2>
          <div className="rules-grid">
            <div className="rule-item">
              <span className="rule-icon">✓</span>
              <div>
                <h4>One entry per envelope</h4>
                <p>Each envelope counts as one entry. To enter multiple tickets or competitions, send separate envelopes.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✓</span>
              <div>
                <h4>Must be 18+</h4>
                <p>You must be 18 years of age or older to enter. By submitting your entry you confirm this.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✓</span>
              <div>
                <h4>UK residents only</h4>
                <p>Postal entries are open to UK residents only. Digital entries are available internationally.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✓</span>
              <div>
                <h4>Received before draw close</h4>
                <p>Your entry must be received before the competition closing date. We recommend posting at least 7 days in advance.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✓</span>
              <div>
                <h4>Equal odds guaranteed</h4>
                <p>All postal entries are placed in the same numbered draw pool as digital entries. No weighting differences.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✓</span>
              <div>
                <h4>Ring-fenced prize</h4>
                <p>Whether you enter digitally or by post, the prize is ring-fenced and guaranteed to be awarded.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="postal-cta">
        <div className="container">
          <h2>Ready to Enter?</h2>
          <p>Browse all live competitions and choose your prize.</p>
          <Link to="/" className="btn-luxury">View Live Competitions →</Link>
        </div>
      </section>
    </div>
  );
}
