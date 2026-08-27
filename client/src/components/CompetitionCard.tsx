import { useState } from 'react';
import './CompetitionCard.css';
import TermsModal from './TermsModal';

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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const progressPercent = (competition.soldEntries / competition.totalEntries) * 100;
  const totalCost = quantity * competition.entryPrice;
  const remainingEntries = competition.totalEntries - competition.soldEntries;
  const odds = ((1 / remainingEntries) * 100).toFixed(6);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= 100) {
      setQuantity(value);
    }
  };

  const handleEnterClick = () => {
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    setShowTermsModal(false);
    try {
      const response = await fetch(`/api/competitions/${competition.id}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, termsAccepted: true }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(`Entry failed: ${data.error || 'Unknown error'}`);
      } else {
        alert(`Entry submitted! You have ${data.quantity} ticket${data.quantity > 1 ? 's' : ''} in the draw.`);
      }
    } catch {
      alert('Failed to submit entry. Please check your connection and try again.');
    }
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
  };

  return (
    <div className="competition-card">
      {showTermsModal && (
        <TermsModal
          competitionTitle={competition.title}
          entryPrice={competition.entryPrice}
          quantity={quantity}
          currency={competition.prizeDetails.currency}
          onAccept={handleTermsAccept}
          onDecline={handleTermsDecline}
        />
      )}
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
          <span className="stat-value">{competition.entryPrice} AED</span>
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
          <span className="cost-amount">{totalCost} AED</span>
        </div>
      </div>

      <button className="btn-enter-now" onClick={handleEnterClick}>ENTER NOW - {totalCost} AED</button>

      <div className="terms-link">
        <a href="/terms" target="_blank" rel="noopener noreferrer">View Full Terms &amp; Conditions</a>
      </div>

      <div className="compliance-notice">
        <span className="compliance-badge">18+ UK | 21+ UAE</span>
        <span className="compliance-badge">Play Responsibly</span>
        <span className="compliance-badge">Certified Fair Draw</span>
      </div>
    </div>
  );
};

export default CompetitionCard;
