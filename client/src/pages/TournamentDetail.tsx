import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './TournamentDetail.css';

interface Participant { id: string; name: string; registeredAt: string; seed?: number; }
interface BracketMatch { matchId: string; round: number; player1: Participant | null; player2: Participant | null; winner: Participant | null; }
interface Tournament {
  id: string; game: 'chess' | 'connect4'; title: string; description: string;
  format: string; status: string; entryFee: number; currency: string;
  maxParticipants: number; participants: Participant[]; prizePool: number;
  prizeBreakdown: { place: string; amount: number }[]; platformFeePercent: number;
  startsAt: string; registrationDeadline: string; rules: string[]; bracket: BracketMatch[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const GAME_META = {
  chess:    { icon: '♟️', color: '#c9a84c', accentCls: 'accent--chess' },
  connect4: { icon: '🔴', color: '#e05555', accentCls: 'accent--connect4' },
};

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration form
  const [name, setName] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const fetchTournament = () => {
    setLoading(true);
    fetch(`${API_URL}/api/tournaments/${id}`)
      .then((r) => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then((data: Tournament) => { setTournament(data); setLoading(false); })
      .catch(() => { setError('Tournament not found.'); setLoading(false); });
  };

  useEffect(() => { fetchTournament(); }, [id]);

  const handleRegister = async () => {
    if (!name.trim()) { setRegError('Please enter your player name.'); return; }
    setRegLoading(true); setRegError(null);
    try {
      const res = await fetch(`${API_URL}/api/tournaments/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json() as { error?: string; message?: string };
      if (!res.ok) { setRegError(data.error || 'Registration failed.'); }
      else { setRegSuccess(`✅ You're registered as "${name}"! Entry fee: £${tournament?.entryFee}. Payment details will be sent via email.`); fetchTournament(); }
    } catch { setRegError('Could not connect to the server.'); }
    finally { setRegLoading(false); }
  };

  if (loading) return <div className="tdetail__loading">Loading…</div>;
  if (error || !tournament) return <div className="tdetail__error">⚠ {error || 'Not found.'} <Link to="/tournaments">← Back</Link></div>;

  const meta = GAME_META[tournament.game];
  const spotsLeft = tournament.maxParticipants - tournament.participants.length;
  const canRegister = tournament.status === 'open' && spotsLeft > 0;
  const rounds = tournament.bracket.length > 0 ? [...new Set(tournament.bracket.map((m) => m.round))].sort((a, b) => a - b) : [];

  return (
    <div className="tdetail">
      {/* Header */}
      <div className="tdetail__header" style={{ '--game-color': meta.color } as React.CSSProperties}>
        <Link to="/tournaments" className="tdetail__back">← All Tournaments</Link>
        <div className="tdetail__game-badge">
          <span className="tdetail__game-icon">{meta.icon}</span>
          <span>{tournament.game === 'chess' ? 'Chess' : 'Connect 4'}</span>
        </div>
        <h1 className="tdetail__title">{tournament.title}</h1>
        <p className="tdetail__desc">{tournament.description}</p>

        <div className="tdetail__meta-row">
          <span className="tdetail__pill">🏆 Prize Pool: <strong>£{tournament.prizePool.toLocaleString()}</strong></span>
          <span className="tdetail__pill">🎟 Entry: <strong>£{tournament.entryFee}</strong></span>
          <span className="tdetail__pill">👥 <strong>{tournament.participants.length}/{tournament.maxParticipants}</strong> registered</span>
          <span className="tdetail__pill">📋 {tournament.format.replace(/-/g, ' ')}</span>
        </div>
      </div>

      <div className="tdetail__body">
        {/* Left column */}
        <div className="tdetail__left">
          {/* Prize breakdown */}
          <section className="tdetail__section">
            <h2 className="tdetail__section-title">💰 Prize Breakdown</h2>
            <div className="tdetail__prize-table">
              {tournament.prizeBreakdown.map((p) => (
                <div key={p.place} className="tdetail__prize-row">
                  <span>{p.place}</span>
                  <strong>£{p.amount.toLocaleString()}</strong>
                </div>
              ))}
              <div className="tdetail__prize-row tdetail__prize-row--fee">
                <span>🏛 Platform hosting fee ({tournament.platformFeePercent}%)</span>
                <strong>£{(tournament.entryFee * tournament.maxParticipants * tournament.platformFeePercent / 100).toLocaleString()}</strong>
              </div>
            </div>
          </section>

          {/* Rules */}
          <section className="tdetail__section">
            <h2 className="tdetail__section-title">📜 Tournament Rules</h2>
            <ul className="tdetail__rules">
              {tournament.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </section>

          {/* Legal */}
          <section className="tdetail__legal">
            ⚖️ <strong>Skill-based competition.</strong> {tournament.game === 'chess' ? 'Chess' : 'Connect 4'} is a
            game of skill. The winner is determined entirely by performance — no element of chance applies.
            This tournament operates under the skill-game exemption and does not constitute gambling in most jurisdictions.
            Always verify local regulations. Players must be 18+.
          </section>
        </div>

        {/* Right column */}
        <div className="tdetail__right">
          {/* Registration */}
          <section className="tdetail__section tdetail__register-box" style={{ '--game-color': meta.color } as React.CSSProperties}>
            <h2 className="tdetail__section-title">🎟 Register</h2>
            {regSuccess ? (
              <div className="tdetail__reg-success">{regSuccess}</div>
            ) : canRegister ? (
              <>
                <p className="tdetail__spots">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</p>
                <input
                  className="tdetail__input"
                  type="text"
                  placeholder="Your player name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                />
                {regError && <p className="tdetail__reg-error">⚠ {regError}</p>}
                <button className="tdetail__reg-btn" onClick={handleRegister} disabled={regLoading}>
                  {regLoading ? '⏳ Registering…' : `Register — Pay £${tournament.entryFee} entry fee`}
                </button>
                <p className="tdetail__reg-note">
                  Entry fee collected securely before the tournament starts. Payment instructions sent by email on registration.
                </p>
              </>
            ) : (
              <div className="tdetail__reg-closed">
                {tournament.status === 'full' ? '🔴 Tournament is full.' : '🔒 Registration closed.'}
              </div>
            )}
          </section>

          {/* Participants */}
          <section className="tdetail__section">
            <h2 className="tdetail__section-title">👥 Registered Players ({tournament.participants.length})</h2>
            {tournament.participants.length === 0 ? (
              <p className="tdetail__no-players">No players registered yet. Be the first!</p>
            ) : (
              <ol className="tdetail__player-list">
                {tournament.participants.map((p) => (
                  <li key={p.id}>
                    <span className="tdetail__player-seed">#{p.seed}</span>
                    <span className="tdetail__player-name">{p.name}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Bracket */}
          {rounds.length > 0 && (
            <section className="tdetail__section">
              <h2 className="tdetail__section-title">🗓 Bracket</h2>
              <div className="tdetail__bracket">
                {rounds.map((round) => (
                  <div key={round} className="tdetail__round">
                    <h3 className="tdetail__round-title">
                      {round === Math.max(...rounds) ? '🏆 Final' : round === Math.max(...rounds) - 1 ? 'Semi-Final' : `Round ${round}`}
                    </h3>
                    {tournament.bracket.filter((m) => m.round === round).map((match) => (
                      <div key={match.matchId} className={`tdetail__match ${match.winner ? 'tdetail__match--done' : ''}`}>
                        <div className={`tdetail__match-player ${match.winner?.id === match.player1?.id ? 'tdetail__match-player--winner' : ''}`}>
                          {match.player1?.name ?? 'TBD'}
                        </div>
                        <div className="tdetail__match-vs">vs</div>
                        <div className={`tdetail__match-player ${match.winner?.id === match.player2?.id ? 'tdetail__match-player--winner' : ''}`}>
                          {match.player2?.name ?? 'TBD'}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
