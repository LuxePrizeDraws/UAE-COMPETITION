import { useState } from 'react';
import type * as React from 'react';
import './CompetitionCard.css';
import SuccessModal from './SuccessModal';
import { CurrencyCode, convertFromAED, formatCurrency } from '../utils/currency';
import { API_BASE } from '../config';

interface Competition {
  id: number;
  title: string;
  description: string;
  prizeType: string;
  prizeAmount: number;
  prizeDetails: {
    currency: string;
    description: string;
    includes?: string[];
  };
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  endsIn: string;
  tags: string[];
  profitMargin: string;
  expectedWinners: number;
}

interface CompetitionCardProps {
  competition: Competition;
  currency: CurrencyCode;
  complianceCurrency: CurrencyCode;
}

const TERMS_LINKS: Record<string, string> = {
  GBP: 'https://www.gamblingcommission.gov.uk',
  AED: 'https://www.gaming.gov.ae',
  USD: 'https://www.ftc.gov',
  EUR: 'https://europa.eu',
};

const AGE_REQUIREMENTS: Record<string, number> = {
  GBP: 18,
  AED: 21,
  USD: 18,
  EUR: 18,
};

const CompetitionCard = ({ competition, currency, complianceCurrency }: CompetitionCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [prizeChoice, setPrizeChoice] = useState<'prize' | 'cash'>('prize');
  const [isEntering, setIsEntering] = useState(false);
  const [successData, setSuccessData] = useState<{
    entryNumbers: string[];
  } | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progressPercent = (competition.soldEntries / competition.totalEntries) * 100;
  const remainingEntries = Math.max(competition.totalEntries - competition.soldEntries, 0);
  const soldOut = remainingEntries === 0;
  const odds = soldOut ? '0.000000' : ((1 / remainingEntries) * 100).toFixed(6);

  // Convert entry price and prize amounts to selected currency
  const entryPriceConverted = convertFromAED(competition.entryPrice, currency);
  const prizeAmountConverted = convertFromAED(competition.prizeAmount, currency);
  const totalCostConverted = entryPriceConverted * quantity;

  const ageRequirement = AGE_REQUIREMENTS[complianceCurrency] ?? 18;
  const termsLink = TERMS_LINKS[complianceCurrency] ?? '#';

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= 100) setQuantity(value);
  };

  const handleEnterNow = async () => {
    if (!ageConfirmed) {
      setError(`You must confirm you are ${ageRequirement}+ years old to enter.`);
      return;
    }
    setError(null);
    setIsEntering(true);

    try {
      const response = await fetch(`${API_BASE}/api/competitions/${competition.id}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, prizeChoice }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Entry failed');
      }

      setSuccessData({ entryNumbers: data.entryNumbers });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsEntering(false);
    }
  };

  return (
    <>
      <div className="competition-card">
        <div className="card-header">
          <span className="card-badge">{competition.prizeType}</span>
          <span className="currency-badge">{currency}</span>
        </div>

        <div className="card-content">
          <div className="prize-section">
            <p className="prize-label">WIN</p>
            <h3 className="prize-amount">
              {formatCurrency(prizeAmountConverted, currency)}
            </h3>
            {currency !== 'AED' && (
              <p className="prize-aed-note">
                ({competition.prizeAmount.toLocaleString()} AED)
              </p>
            )}
            <p className="prize-description">{competition.description}</p>
            {competition.prizeDetails.includes && (
              <div className="prize-includes">
                {competition.prizeDetails.includes.map((item, idx) => (
                  <span key={idx} className="include-item">✓ {item}</span>
                ))}
              </div>
            )}
          </div>

          <div className="prize-image-placeholder">
            <div className="image-placeholder">💎</div>
          </div>
        </div>

        {/* Prize / Cash Alternative Selector */}
        <div className="prize-choice-section">
          <p className="prize-choice-label">SELECT YOUR PRIZE:</p>
          <div className="prize-choice-options">
            <label className={`prize-choice-option ${prizeChoice === 'prize' ? 'active' : ''}`}>
              <input
                type="radio"
                name={`prize-choice-${competition.id}`}
                value="prize"
                checked={prizeChoice === 'prize'}
                onChange={() => setPrizeChoice('prize')}
              />
              <span className="option-icon">🏆</span>
              <span className="option-text">
                <strong>Win Prize Package</strong>
                <small>{competition.prizeDetails.description}</small>
              </span>
            </label>
            <label className={`prize-choice-option ${prizeChoice === 'cash' ? 'active' : ''}`}>
              <input
                type="radio"
                name={`prize-choice-${competition.id}`}
                value="cash"
                checked={prizeChoice === 'cash'}
                onChange={() => setPrizeChoice('cash')}
              />
              <span className="option-icon">💰</span>
              <span className="option-text">
                <strong>Win Cash Alternative</strong>
                <small>{formatCurrency(prizeAmountConverted, currency)} equivalent</small>
              </span>
            </label>
          </div>
        </div>

        <div className="card-stats">
          <div className="stat">
            <span className="stat-label">TICKET PRICE</span>
            <span className="stat-value">{formatCurrency(entryPriceConverted, currency)}</span>
            <span className="stat-sublabel">PER ENTRY</span>
          </div>
          <div className="stat">
            <span className="stat-label">ODDS (Each Entry)</span>
            <span className="stat-value">{soldOut ? 'Sold Out' : `1 in ${remainingEntries.toLocaleString()}`}</span>
            <span className="stat-sublabel">{odds}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">ENTRIES AVAILABLE</span>
            <span className="stat-value">{remainingEntries.toLocaleString()}</span>
            <span className="stat-sublabel">of {competition.totalEntries.toLocaleString()}</span>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span>Entries Sold</span>
            <span>{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="progress-detail">
            {competition.soldEntries.toLocaleString()} / {competition.totalEntries.toLocaleString()} sold
          </div>
        </div>

        <div className="transparency-section">
          <h4>💡 Transparent Structure</h4>
          <p className="transparency-text">{competition.profitMargin}</p>
          <p className="transparency-text">Expected Winners: {competition.expectedWinners}</p>
        </div>

        <div className="card-tags">
          {competition.tags.map((tag, idx) => (
            <span key={idx} className="tag">✓ {tag}</span>
          ))}
        </div>

        <div className="entry-controls">
          <div className="quantity-selector">
            <label>Number of Tickets:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={handleQuantityChange}
              className="quantity-input"
            />
          </div>
          <div className="cost-display">
            <span className="cost-label">Total Cost:</span>
            <span className="cost-amount">{formatCurrency(totalCostConverted, currency)}</span>
          </div>
        </div>

        {/* Age verification */}
        <label className="age-check">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
          />
          <span>I confirm I am {ageRequirement}+ years old and accept the{' '}
            <a href={termsLink} target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
          </span>
        </label>

        {error && <p className="entry-error">{error}</p>}

        <button
          className="btn-enter-now"
          onClick={handleEnterNow}
          disabled={isEntering}
        >
          {isEntering
            ? 'Processing...'
            : `ENTER NOW — ${formatCurrency(totalCostConverted, currency)} (${prizeChoice === 'prize' ? '🏆 Prize' : '💰 Cash'})`
          }
        </button>

        <div className="responsible-gambling">
          <p>⚠️ Please play responsibly. For support:{' '}
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">
              BeGambleAware.org
            </a>
          </p>
        </div>

        <div className="terms-link">
          <a href={termsLink} target="_blank" rel="noopener noreferrer">
            View Full Terms & Conditions
          </a>
        </div>
      </div>

      {successData && (
        <SuccessModal
          competitionTitle={competition.title}
          entryNumbers={successData.entryNumbers}
          totalCostConverted={totalCostConverted}
          currency={currency}
          prizeChoice={prizeChoice}
          onClose={() => setSuccessData(null)}
        />
      )}
    </>
  );
};

export default CompetitionCard;
