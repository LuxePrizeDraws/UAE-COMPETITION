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
  entriesNeededForDraw: number;
  soldEntries: number;
  entriesRemaining: number;
  drawReadyProgress: number;
  endsIn: string;
  tags: string[];
  profitMargin: string;
  expectedWinners: number;
  comingSoon?: boolean;
  frequency?: string;
}

interface CompetitionCardProps {
  competition: Competition;
}

const CompetitionCard = ({ competition }: CompetitionCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const progressPercent = competition.drawReadyProgress ?? (competition.soldEntries / competition.totalEntries) * 100;
  const totalCost = quantity * competition.entryPrice;
  const remainingEntries = competition.entriesRemaining ?? (competition.totalEntries - competition.soldEntries);
  const currencySymbol = competition.prizeDetails.currency === 'GBP' ? '£' : '';
  const currencyLabel = currencySymbol || competition.prizeDetails.currency;
  const odds = ((1 / remainingEntries) * 100).toFixed(6);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= 100) {
      setQuantity(value);
    }
  };

  return (
    <div className="competition-card">
      {competition.comingSoon && (
        <div className="coming-soon-overlay">
          <span className="coming-soon-label">COMING SOON</span>
        </div>
      )}
      <div className="card-header">
        <span className="card-badge">{competition.prizeType}</span>
        {competition.frequency && (
          <span className="card-frequency">{competition.frequency}</span>
        )}
      </div>

      <div className="card-content">
        <div className="prize-section">
          <p className="prize-label">WIN</p>
          <h3 className="prize-amount">
            {currencyLabel}{competition.prizeAmount.toLocaleString()}
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
          <span className="stat-value">{currencyLabel}{competition.entryPrice}</span>
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
          <span className="stat-sublabel">of {competition.entriesNeededForDraw.toLocaleString()}</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Draw Progress</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="progress-detail">
          {competition.soldEntries.toLocaleString()} / {competition.entriesNeededForDraw.toLocaleString()} entries
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
          <span className="cost-amount">{currencyLabel}{totalCost}</span>
        </div>
      </div>

      <button className="btn-enter-now" disabled={competition.comingSoon}>
        {competition.comingSoon ? 'COMING SOON' : `ENTER NOW - ${currencyLabel}${totalCost}`}
      </button>

      <div className="terms-link">
        <a href="#">View Full Terms & Conditions</a>
      </div>
    </div>
  );
};

export default CompetitionCard;
