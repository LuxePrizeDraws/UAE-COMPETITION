import { useState } from 'react';
import './CompetitionCard.css';

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
}

const CompetitionCard = ({ competition }: CompetitionCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const progressPercent = (competition.soldEntries / competition.totalEntries) * 100;
  const totalCost = quantity * competition.entryPrice;
  const formattedEntryPrice = competition.entryPrice.toFixed(2);
  const formattedTotalCost = totalCost.toFixed(2);
  const remainingEntries = competition.totalEntries - competition.soldEntries;
  const odds = ((1 / remainingEntries) * 100).toFixed(6);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= 100) {
      setQuantity(value);
    }
  };

  const handleEnterNow = () => {
    const confirmed = window.confirm(`Buy ${quantity} ticket${quantity > 1 ? 's' : ''} for £${formattedTotalCost}?`);
    if (!confirmed) return;

    setShowCelebration(true);
    window.setTimeout(() => setShowCelebration(false), 1800);
  };

  return (
    <div className="competition-card">
      <div className="card-header">
        <span className="card-badge">{competition.prizeType}</span>
      </div>

      <div className="card-content">
        <div className="prize-section">
          <p className="prize-label">WIN</p>
          <h3 className="prize-amount">
            {competition.prizeAmount.toLocaleString()} {competition.prizeDetails.currency}
          </h3>
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

      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">TICKET PRICE</span>
          <span className="stat-value">£{formattedEntryPrice}</span>
          <span className="stat-sublabel">PER ENTRY</span>
        </div>
        <div className="stat">
          <span className="stat-label">ODDS (Each Entry)</span>
          <span className="stat-value">1 in {remainingEntries.toLocaleString()}</span>
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
          <span className="cost-amount">£{formattedTotalCost}</span>
        </div>
      </div>

      <button className="btn-enter-now" onClick={handleEnterNow}>
        ENTER NOW - £{formattedTotalCost}
      </button>

      {showCelebration && (
        <div className="ticket-confetti" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={index} className="confetti-piece">🎉</span>
          ))}
        </div>
      )}

      <div className="terms-link">
        <a href="#">View Full Terms & Conditions</a>
      </div>
    </div>
  );
};

export default CompetitionCard;
