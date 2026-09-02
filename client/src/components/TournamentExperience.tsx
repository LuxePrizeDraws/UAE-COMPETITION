import { FormEvent, useEffect, useMemo, useState } from 'react';
import '../pages/FeaturePages.css';

interface Tournament {
  id: number;
  slug: 'chess' | 'connect4';
  name: string;
  shortTitle: string;
  format: string;
  status: 'open' | 'upcoming';
  startDate: string;
  maxPlayers: number;
  registeredPlayers: number;
  entryFee: number;
  currency: string;
  timeControl?: string;
  rounds: number;
  description: string;
  highlights: string[];
  rules: string[];
}

interface RegistrationForm {
  name: string;
  email: string;
  termsAccepted: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TournamentExperience({ slug }: { slug: 'chess' | 'connect4' }) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<RegistrationForm>({ name: '', email: '', termsAccepted: false });

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    fetch(`${API_URL}/api/tournaments/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || 'Tournament is not available right now.');
        }
        return res.json();
      })
      .then((data: Tournament) => {
        setTournament(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Could not load tournament details.');
        setLoading(false);
      });
  }, [slug]);

  const playersRemaining = useMemo(() => {
    if (!tournament) return 0;
    return Math.max(tournament.maxPlayers - tournament.registeredPlayers, 0);
  }, [tournament]);

  const registrationPercent = useMemo(() => {
    if (!tournament || tournament.maxPlayers === 0) return 0;
    return Math.min((tournament.registeredPlayers / tournament.maxPlayers) * 100, 100);
  }, [tournament]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (form.name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!form.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!form.termsAccepted) {
      setError('Please accept tournament terms before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/api/tournaments/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Registration failed. Please try again.');
      }

      setSuccessMessage(`${payload.message} Registration ID: ${payload.registrationId}`);
      setForm({ name: '', email: '', termsAccepted: false });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="feature-page__status">Loading tournament details...</p>;
  }

  if (error && !tournament) {
    return <p className="feature-page__status feature-page__status--error">{error}</p>;
  }

  if (!tournament) {
    return <p className="feature-page__status feature-page__status--error">Tournament was not found.</p>;
  }

  return (
    <section className="feature-page">
      <div className="feature-page__hero">
        <h1>{tournament.name}</h1>
        <p>{tournament.description}</p>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <h2>Tournament Snapshot</h2>
          <ul className="feature-list">
            <li><strong>Format:</strong> {tournament.format}</li>
            <li><strong>Status:</strong> {tournament.status.toUpperCase()}</li>
            <li><strong>Starts:</strong> {new Date(tournament.startDate).toLocaleString()}</li>
            {tournament.timeControl && <li><strong>Time Control:</strong> {tournament.timeControl}</li>}
            <li><strong>Rounds:</strong> {tournament.rounds}</li>
            <li><strong>Entry Fee:</strong> {tournament.currency} {tournament.entryFee}</li>
          </ul>
        </article>

        <article className="feature-card">
          <h2>Player Capacity</h2>
          <p>
            {tournament.registeredPlayers} / {tournament.maxPlayers} players registered
          </p>
          <div className="feature-progress" aria-label="Registration progress">
            <span style={{ width: `${registrationPercent.toFixed(1)}%` }} />
          </div>
          <p>{playersRemaining} slots still available.</p>
        </article>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <h2>Highlights</h2>
          <ul className="feature-list">
            {tournament.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="feature-card">
          <h2>Rules</h2>
          <ul className="feature-list">
            {tournament.rules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="feature-card">
        <h2>Register for {tournament.shortTitle}</h2>
        <form className="feature-form" onSubmit={onSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>
          <label className="feature-form__checkbox">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(event) => setForm((prev) => ({ ...prev, termsAccepted: event.target.checked }))}
            />
            I agree to the tournament terms and fair play rules.
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Join Tournament'}
          </button>
        </form>
        {error && <p className="feature-page__status feature-page__status--error">{error}</p>}
        {successMessage && <p className="feature-page__status feature-page__status--success">{successMessage}</p>}
      </article>
    </section>
  );
}
