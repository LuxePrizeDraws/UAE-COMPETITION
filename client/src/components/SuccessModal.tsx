import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CurrencyCode } from '../utils/currency';
import './SuccessModal.css';

interface SuccessModalProps {
  competitionTitle: string;
  entryNumbers: string[];
  totalCostConverted: number;
  currency: CurrencyCode;
  prizeChoice: 'prize' | 'cash';
  onClose: () => void;
}

const SuccessModal = ({
  competitionTitle,
  entryNumbers,
  totalCostConverted,
  currency,
  prizeChoice,
  onClose,
}: SuccessModalProps) => {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    let rafId: number;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#d4af37', '#f5d060', '#ffffff', '#b8860b'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#d4af37', '#f5d060', '#ffffff', '#b8860b'],
      });

      if (Date.now() < end) {
        rafId = requestAnimationFrame(frame);
      }
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-emoji">🎉</span>
          <h2 className="modal-title" id="success-modal-title">Entry Confirmed!</h2>
          <p className="modal-subtitle">You're in the running to win!</p>
        </div>

        <div className="modal-body">
          <div className="modal-competition">
            <span className="modal-label">Competition</span>
            <span className="modal-value">{competitionTitle}</span>
          </div>

          <div className="modal-competition">
            <span className="modal-label">Prize Choice</span>
            <span className="modal-value prize-choice-badge">
              {prizeChoice === 'prize' ? '🏆 Prize Package' : '💰 Cash Alternative'}
            </span>
          </div>

          <div className="modal-competition">
            <span className="modal-label">Amount Paid</span>
            <span className="modal-value gold-text">
              {totalCostConverted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}
            </span>
          </div>

          <div className="entry-numbers-section">
            <span className="modal-label">Your Entry Numbers</span>
            <div className="entry-numbers">
              {entryNumbers.map((num, i) => (
                <span key={i} className="entry-number">{num}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <p className="modal-compliance">
            🔒 Your entry is securely recorded. Good luck! Play Responsibly.
            If you need support visit{' '}
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">
              BeGambleAware.org
            </a>
          </p>
          <button className="btn-close-modal" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
