import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './TournamentList.css';

interface Tournament {
  id: string;
  game: 'chess' | 'connect4';
  title: string;
  description: string;
  format: string;
  status: string;
  entryFee: number;
  currency: string;
  maxParticipants: number;
  participants: { id: string; name: string }[];
  prizePool: number;
  prizeBreakdown: { place: string; amount: number }[];
  platformFeePercent: number;
  startsAt: string;
  registrationDeadline: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GAME_META = {
  chess: { icon: '♟️', label: 'Chess', color: '#c9a84c' },
  connect4: { icon: '🔴', label: 'Connect 4', color: '#e05555' },
};

function statusBadge(t: Tournament) {
  const spots = t.maxParticipants - t.participants.length;
  if (t.status === 'full') return { text: 'FULL', cls: 'badge--full' };
  if (t.status === 'in-progress') return { text: 'IN PROGRESS', cls: 'badge--progress' };
  if (t.status === 'completed') return { text: 'COMPLETED', cls: 'badge--done' };
  return { text: `${spots} SPOT${spots !== 1 ? 'S' : ''} LEFT`, cls: 'badge--open' };
}

export default function TournamentList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Derive active game filter from path: /tournaments/chess or /tournaments/connect4
  const gameFilter = location.pathname.includes('chess')
    ? 'chess'
    : location.pathname.includes('connect4')
    ? 'connect4'
    : null;

  useEffect(() => {
    setLoading(true);
    const qs = gameFilter ? `?game=${gameFilter}` : '';
    fetch(`${API_URL}/api/tournaments${qs}`)
      .then((r) => r.json())
      .then((data: Tournament[]) => { setTournaments(data); setLoading(false); })
      .catch(() => { setError('Could not load tournaments.'); setLoading(false); });
  }, [gameFilter]);

  const displayed = tournaments;

  return (
    <div className="tlist">
      {/* Hero */}
      <div className="tlist__hero">
        <h1 className="tlist__hero-title">
          {gameFilter === 'chess' && '♟️ Chess Tournaments'}
          {gameFilter === 'connect4' && '🔴 Connect 4 Tournaments'}
          {!gameFilter && '🎮 Skill Tournaments'}
        </h1>
        <p className="tlist__hero-sub">
          Skill-based competitions — entry fee funds the prize pool. The best player wins.
          No luck. No licence required.
        </p>
        <div className="tlist__game-tabs">
          <Link
            to="/tournaments"
            className={`tlist__game-tab ${!gameFilter ? 'tlist__game-tab--active' : ''}`}
          >
            All Games
          </Link>
          <Link
            to="/tournaments/chess"
            className={`tlist__game-tab tlist__game-tab--chess ${gameFilter === 'chess' ? 'tlist__game-tab--active' : ''}`}
          >
            ♟️ Chess
          </Link>
          <Link
            to="/tournaments/connect4"
            className={`tlist__game-tab tlist__game-tab--connect4 ${gameFilter === 'connect4' ? 'tlist__game-tab--active' : ''}`}
          >
            🔴 Connect 4
          </Link>
        </div>
      </div>

      {/* Legal note */}
      <div className="tlist__legal">
        ⚖️ <strong>Skill-based tournaments only.</strong> Chess and Connect 4 are recognised games of skill.
        Winners are determined by performance, not chance. No gambling licence required.
        Platform retains 20% hosting fee; 80% goes to the prize pool.
      </div>

      {loading && <div className="tlist__loading">Loading tournaments…</div>}
      {error && <div className="tlist__error">⚠ {error}</div>}

      <div className="tlist__grid">
        {displayed.map((t) => {
          const meta = GAME_META[t.game];
          const badge = statusBadge(t);
          const pct = Math.round((t.participants.length / t.maxParticipants) * 100);
          const deadline = new Date(t.registrationDeadline).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
          });
          return (
            <div key={t.id} className="tcard" style={{ '--game-color': meta.color } as React.CSSProperties}>
              <div className="tcard__top">
                <span className="tcard__game-icon">{meta.icon}</span>
                <span className={`tcard__badge ${badge.cls}`}>{badge.text}</span>
              </div>
              <h2 className="tcard__title">{t.title}</h2>
              <p className="tcard__desc">{t.description}</p>

              <div className="tcard__stats">
                <div className="tcard__stat">
                  <span>Entry Fee</span>
                  <strong>£{t.entryFee}</strong>
                </div>
                <div className="tcard__stat">
                  <span>Prize Pool</span>
                  <strong>£{t.prizePool.toLocaleString()}</strong>
                </div>
                <div className="tcard__stat">
                  <span>Format</span>
                  <strong>{t.format.replace(/-/g, ' ')}</strong>
                </div>
                <div className="tcard__stat">
                  <span>Register by</span>
                  <strong>{deadline}</strong>
                </div>
              </div>

              <div className="tcard__prizes">
                {t.prizeBreakdown.map((p) => (
                  <div key={p.place} className="tcard__prize-row">
                    <span>{p.place}</span>
                    <strong>£{p.amount.toLocaleString()}</strong>
                  </div>
                ))}
              </div>

              <div className="tcard__progress-wrap">
                <div className="tcard__progress-label">
                  <span>{t.participants.length} / {t.maxParticipants} registered</span>
                  <span>{pct}%</span>
                </div>
                <div className="tcard__progress-bar">
                  <div className="tcard__progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <Link
                to={`/tournaments/${t.id}`}
                className={`tcard__cta ${t.status === 'full' || t.status === 'completed' ? 'tcard__cta--disabled' : ''}`}
              >
                {t.status === 'open' ? 'View & Register →' : t.status === 'full' ? 'Full — View Bracket →' : 'View Details →'}
              </Link>
            </div>
          );
        })}
      </div>

      {!loading && displayed.length === 0 && (
        <p className="tlist__empty">No tournaments found. Check back soon.</p>
      )}
    </div>
  );
}
