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
  status?: string;
}

interface CompetitionCardProps {
  competition: Competition;
  onEnter?: (id: number) => void;
}

const CompetitionCard = ({ competition, onEnter }: CompetitionCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [entryMode, setEntryMode] = useState<'online' | 'postal'>('online');
  const progressPercent = (competition.soldEntries / competition.totalEntries) * 100;
  const totalCost = quantity * competition.entryPrice;
  const remainingEntries = competition.totalEntries - competition.soldEntries;
  const odds = ((1 / remainingEntries) * 100).toFixed(6);
  const isVehicle = competition.id === 7 || /vehicle|supercar|car/i.test(`${competition.prizeType} ${competition.description}`);
  const isCash = [1, 3, 4, 5, 6].includes(competition.id) || /cash|money|currency/i.test(`${competition.prizeType} ${competition.description}`);
  const visualType = isVehicle ? 'vehicle' : isCash ? 'cash' : 'lifestyle';

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= 100) {
      setQuantity(value);
    }
  };

  return (
    <div className={`competition-card competition-card--${visualType}`}>
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
          <div className="image-placeholder">{isVehicle ? '🏎️' : isCash ? '💵' : '✨'}</div>
          <div className="image-caption">{isVehicle ? 'Supercar' : isCash ? 'Cash Draw' : 'Luxury Package'}</div>
        </div>
      </div>

      {isVehicle && (
        <div className="supercar-ticker" aria-label="Supercar prizes">
          <div className="supercar-ticker__track">
            <span>Porsche 911 Turbo S</span>
            <span>Lamborghini Huracán</span>
            <span>Ferrari 488 GTB</span>
            <span>Porsche 911 Turbo S</span>
            <span>Lamborghini Huracán</span>
            <span>Ferrari 488 GTB</span>
          </div>
        </div>
      )}

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

      <div className="postal-highlight">📮 FREE POSTAL ENTRY</div>

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

      <button
        className={`entry-tab ${entryMode === 'online' ? 'entry-tab--active' : ''}`}
        onClick={() => setEntryMode('online')}
      >
        Online Entry
      </button>
      <button
        className={`entry-tab ${entryMode === 'postal' ? 'entry-tab--active' : ''}`}
        onClick={() => setEntryMode('postal')}
      >
        FREE POSTAL ENTRY
      </button>

      <div className="entry-actions">
        <button
          className="btn-enter-now"
          disabled={competition.status === 'coming-soon'}
          onClick={() => { setEntryMode('online'); onEnter?.(competition.id); }}
        >
          {competition.status === 'coming-soon' ? '⏳ COMING SOON' : `ENTER ONLINE - ${totalCost} AED`}
        </button>
        <button
          className="btn-enter-now btn-postal"
          disabled={competition.status === 'coming-soon'}
          onClick={() => setEntryMode('postal')}
        >
          {competition.status === 'coming-soon' ? '⏳ COMING SOON' : 'POSTAL ENTRY DETAILS'}
        </button>
      </div>

      <div className={`postal-terms ${entryMode === 'postal' ? 'postal-terms--active' : ''}`}>
        <strong>FREE POSTAL ENTRY</strong>
        <p>Send your full name, mobile number, email, and competition title on a postcard to Luxe Prize Draws, PO Box 911, London, UK.</p>
        <p>One postcard equals one entry. Postal entries are free and get the same draw treatment as paid online entries.</p>
      </div>

      <div className="terms-link">
        <a href="#">View Full Terms & Conditions</a>
      </div>
    </div>
  );
};

export default CompetitionCard;
