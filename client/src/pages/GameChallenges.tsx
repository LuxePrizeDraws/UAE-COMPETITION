import { Link } from 'react-router-dom';
import './GameChallenges.css';

const gameChallenges = [
  {
    title: 'Connect 4 Cash Clash',
    prize: '£2,500 winner prize',
    format: '1v1 knockout ladder',
    cadence: 'Nightly challenge windows',
    status: 'Open for demo',
    summary: 'Fast tactical matches designed for high-visibility brackets, quick audience understanding, and an easy cash-prize story.',
  },
  {
    title: 'Chess Masters Cash Open',
    prize: '£7,500 total prize pool',
    format: 'Timed Swiss + finals',
    cadence: 'Weekend major',
    status: 'Featured event',
    summary: 'Longer-form strategy competition with leaderboard depth, finalist rounds, and a premium tournament presentation layer.',
  },
  {
    title: 'Draughts Gold Cup',
    prize: '£3,000 champion payout',
    format: 'Group stage + elimination',
    cadence: 'Weekly cycle',
    status: 'Next launch block',
    summary: 'Classic board-game challenge surfaced as a cash-prize format for players who prefer deliberate skill-based play.',
  },
] as const;

export default function GameChallenges() {
  return (
    <main className="game-challenges-page">
      <section className="game-challenges-page__hero">
        <div className="container">
          <p className="game-challenges-page__eyebrow">Cash Prize Game Challenges</p>
          <h1>Connect 4, chess, and draughts are now surfaced in the demo</h1>
          <p>
            This page adds the requested skill-game layer to the app with a dedicated section for
            cash-prize challenge formats, keeping them visible alongside the existing draw products.
          </p>
          <div className="game-challenges-page__actions">
            <Link to="/dashboard" className="game-challenges-page__btn game-challenges-page__btn--primary">Open dashboard</Link>
            <Link to="/" className="game-challenges-page__btn">Back to homepage</Link>
          </div>
        </div>
      </section>

      <section className="game-challenges-page__section">
        <div className="container">
          <h2>Challenge formats</h2>
          <div className="game-challenges-page__grid">
            {gameChallenges.map((challenge) => (
              <article key={challenge.title} className="game-challenges-page__card">
                <span>{challenge.status}</span>
                <h3>{challenge.title}</h3>
                <p>{challenge.summary}</p>
                <dl className="game-challenges-page__meta">
                  <div>
                    <dt>Prize</dt>
                    <dd>{challenge.prize}</dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>{challenge.format}</dd>
                  </div>
                  <div>
                    <dt>Cadence</dt>
                    <dd>{challenge.cadence}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
