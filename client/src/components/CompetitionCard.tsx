import { Link } from 'react-router-dom';
import type { Competition } from '../types';
import './CompetitionCard.css';

interface CompetitionCardProps {
  competition: Competition;
}

const CompetitionCard = ({ competition }: CompetitionCardProps) => {
  const progressPercent = (competition.soldEntries / competition.totalEntries) * 100;
  const remainingEntries = competition.totalEntries - competition.soldEntries;

  return (
    <article className="competition-card">
      <div className="card-header">
        <span className="card-badge">{competition.prizeType}</span>
        {competition.featured && <span className="card-featured">Featured</span>}
      </div>

      <div className="card-content">
        <div className="prize-section">
          <p className="prize-label">{competition.location}</p>
          <h3 className="prize-amount">{competition.shortTitle}</h3>
          <p className="prize-description">{competition.description}</p>
          {competition.prizeDetails.includes && (
            <div className="prize-includes">
              {competition.prizeDetails.includes.slice(0, 3).map((item) => (
                <span key={item} className="include-item">
                  ✓ {item}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="prize-image-placeholder">
          <div className="image-placeholder" aria-hidden="true">
            {competition.image}
          </div>
        </div>
      </div>

      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">Entry</span>
          <span className="stat-value">{competition.entryPrice} AED</span>
          <span className="stat-sublabel">per ticket</span>
        </div>
        <div className="stat">
          <span className="stat-label">Prize Value</span>
          <span className="stat-value">{competition.prizeAmount.toLocaleString()} AED</span>
          <span className="stat-sublabel">exclusive reward</span>
        </div>
        <div className="stat">
          <span className="stat-label">Entries Left</span>
          <span className="stat-value">{remainingEntries.toLocaleString()}</span>
          <span className="stat-sublabel">draw: {competition.drawDate}</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Entries sold</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="progress-detail">
          {competition.soldEntries.toLocaleString()} / {competition.totalEntries.toLocaleString()} confirmed
        </div>
      </div>

      <div className="card-tags">
        {competition.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <Link className="btn-enter-now" to={`/competitions/${competition.id}`}>
        View Competition
      </Link>
    </article>
  );
};

export default CompetitionCard;
