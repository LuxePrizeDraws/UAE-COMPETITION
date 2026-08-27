import { useState } from 'react';
import './TermsModal.css';

interface TermsModalProps {
  competitionTitle: string;
  entryPrice: number;
  quantity: number;
  currency: string;
  onAccept: () => void;
  onDecline: () => void;
}

const TermsModal = ({
  competitionTitle,
  entryPrice,
  quantity,
  currency,
  onAccept,
  onDecline,
}: TermsModalProps) => {
  const [agreed, setAgreed] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const totalCost = quantity * entryPrice;

  const canProceed = agreed && ageConfirmed;

  return (
    <div className="terms-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="terms-modal">
        <div className="terms-modal-header">
          <h2 id="modal-title">Terms &amp; Conditions</h2>
          <p className="terms-modal-subtitle">Please review and accept before entering</p>
        </div>

        <div className="terms-modal-competition">
          <p className="terms-modal-comp-name">{competitionTitle}</p>
          <p className="terms-modal-cost">
            {quantity} {quantity === 1 ? 'ticket' : 'tickets'} &times; {entryPrice} {currency} ={' '}
            <strong>{totalCost} {currency}</strong>
          </p>
        </div>

        <div className="terms-modal-summary">
          <h3>Key Terms Summary</h3>
          <ul>
            <li>🎯 This is a "Win to Buy" promotional competition — not gambling</li>
            <li>🔒 Entries are non-refundable once submitted</li>
            <li>📊 Odds are displayed transparently on each competition card</li>
            <li>🏆 Prizes delivered within 14 days of winner verification</li>
            <li>💰 Winners are responsible for any applicable taxes on prizes</li>
            <li>🌍 Participation restricted to eligible countries only</li>
            <li>⚠️ Maximum 100 entries per draw, £500/month recommended soft cap</li>
          </ul>
        </div>

        <div className="terms-modal-responsible">
          <p>
            ⚠️ <strong>Play Responsibly.</strong> If you need help:{' '}
            <strong>GamCare 0808 8020 133</strong> | <strong>BeGambleAware.org</strong>
          </p>
        </div>

        <div className="terms-modal-checkboxes">
          <label className="terms-modal-checkbox-label">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
            />
            <span>
              I confirm I am aged <strong>18 or over</strong> (UK) / <strong>21 or over</strong>{' '}
              (UAE) and reside in an eligible country
            </span>
          </label>

          <label className="terms-modal-checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I have read and agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms &amp; Conditions
              </a>{' '}
              and confirm this entry is for personal use only
            </span>
          </label>
        </div>

        <div className="terms-modal-actions">
          <button
            className="terms-modal-accept"
            disabled={!canProceed}
            onClick={onAccept}
            aria-disabled={!canProceed}
          >
            {canProceed ? `ACCEPT &amp; ENTER — ${totalCost} ${currency}` : 'Please accept terms to continue'}
          </button>
          <button className="terms-modal-decline" onClick={onDecline}>
            Cancel
          </button>
        </div>

        <p className="terms-modal-full-link">
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            View full Terms &amp; Conditions →
          </a>
        </p>
      </div>
    </div>
  );
};

export default TermsModal;
