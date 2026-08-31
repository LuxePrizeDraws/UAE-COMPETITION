import { useState } from 'react';
import './PostalEntryModal.css';

interface Competition {
  id: number;
  title: string;
  prizeType: string;
  prizeAmount: number;
  currency: string;
  endsIn: string;
}

interface PostalAddress {
  name: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

interface PostalResult {
  reference: string;
  competitionTitle: string;
  postalAddress: PostalAddress;
  instructions: string[];
  equalOddsStatement: string;
}

interface PostalEntryModalProps {
  competition: Competition;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PostalEntryModal({ competition, onClose }: PostalEntryModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PostalResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !email.trim()) {
      setError('Please fill in your name, address and email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/competitions/${competition.id}/enter-postal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="postal-overlay" onClick={onClose}>
      <div className="postal-modal" onClick={(e) => e.stopPropagation()}>
        <button className="postal-modal__close" onClick={onClose} aria-label="Close">✕</button>

        {result ? (
          <div className="postal-confirmation" id="postal-print-area">
            <div className="postal-confirmation__header">
              <div className="postal-confirmation__icon">✉️</div>
              <h2>Postal Entry Registered!</h2>
              <p className="postal-confirmation__sub">
                Your reference number is below — write it on your entry form.
              </p>
            </div>

            <div className="postal-reference-box">
              <span className="postal-reference-label">Entry Reference</span>
              <span className="postal-reference-code">{result.reference}</span>
            </div>

            <div className="postal-equal-odds">
              <span className="postal-equal-odds__icon">⚖️</span>
              <p>{result.equalOddsStatement}</p>
            </div>

            <div className="postal-address-box">
              <h3>📮 Post Your Form To:</h3>
              <address>
                <strong>{result.postalAddress.name}</strong><br />
                {result.postalAddress.line1}<br />
                {result.postalAddress.line2}<br />
                {result.postalAddress.city}<br />
                {result.postalAddress.postcode}<br />
                {result.postalAddress.country}
              </address>
            </div>

            <div className="postal-instructions">
              <h3>📋 Instructions</h3>
              <ol>
                {result.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="postal-entry-form-section">
              <h3>✏️ Entry Form (Print & Post)</h3>
              <div className="postal-entry-form printable">
                <p><strong>COMPETITION ENTRY FORM</strong></p>
                <p>Competition: {result.competitionTitle}</p>
                <p>Reference: {result.reference}</p>
                <div className="postal-form-field"><label>Full Name:</label><div className="postal-form-line" /></div>
                <div className="postal-form-field"><label>Address:</label><div className="postal-form-line" /><div className="postal-form-line" /></div>
                <div className="postal-form-field"><label>Postcode:</label><div className="postal-form-line" /></div>
                <div className="postal-form-field"><label>Email:</label><div className="postal-form-line" /></div>
                <div className="postal-form-field"><label>Phone:</label><div className="postal-form-line" /></div>
                <p className="postal-form-legal">
                  No purchase necessary. Free postal entries have identical odds to digital entries.
                  Must be 18+. By posting this form I confirm I accept the Terms &amp; Conditions.
                </p>
              </div>
            </div>

            <div className="postal-confirmation__actions">
              <button className="btn-postal-print" onClick={handlePrint}>🖨️ Print Entry Form</button>
              <button className="btn-postal-close" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="postal-modal__header">
              <span className="postal-modal__badge free-badge">FREE POSTAL ENTRY</span>
              <h2 className="postal-modal__title">{competition.title}</h2>
              <p className="postal-modal__prize">
                Win {competition.prizeAmount.toLocaleString()} {competition.currency}
              </p>
            </div>

            <div className="postal-equal-odds">
              <span className="postal-equal-odds__icon">⚖️</span>
              <p>
                <strong>Same odds as digital entries.</strong> Free postal entries have identical
                chances to win — completely fair and transparent. No purchase necessary.
              </p>
            </div>

            <div className="postal-info-strip">
              <div><span>💰</span><span>Cost to Enter</span><strong>FREE</strong></div>
              <div><span>🏆</span><span>Prize</span><strong>£{competition.prizeAmount.toLocaleString()}</strong></div>
              <div><span>⏰</span><span>Closes In</span><strong>{competition.endsIn}</strong></div>
            </div>

            <p className="postal-modal__intro">
              Fill in your details below to generate a unique reference number and entry form to print and post.
            </p>

            <form className="postal-form" onSubmit={handleSubmit} noValidate>
              <div className="postal-form-group">
                <label htmlFor="postal-name">Full Name <span className="required">*</span></label>
                <input
                  id="postal-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="postal-form-group">
                <label htmlFor="postal-address">Home Address <span className="required">*</span></label>
                <textarea
                  id="postal-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, street, city, postcode"
                  rows={3}
                  required
                />
              </div>
              <div className="postal-form-group">
                <label htmlFor="postal-email">Email Address <span className="required">*</span></label>
                <input
                  id="postal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="postal-form-group">
                <label htmlFor="postal-phone">Phone (optional)</label>
                <input
                  id="postal-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 000000"
                />
              </div>

              {error && <p className="postal-error">⚠ {error}</p>}

              <button type="submit" className="btn-postal-submit" disabled={loading}>
                {loading ? '⏳ Processing...' : '✉️ Generate Entry Form — FREE'}
              </button>
            </form>

            <div className="postal-legal-note">
              <p>
                🔒 Compliant with UK postal lottery laws. Free postal entries have identical odds
                to digital entries. No purchase is necessary to enter or win. Must be 18 or over.
                Winners are selected via a random draw from all entries (postal + digital combined).
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
