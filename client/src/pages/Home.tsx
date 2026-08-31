import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CompetitionCard from '../components/CompetitionCard';
import EntryModal from '../components/EntryModal';
import './Home.css';

interface Competition {
  id: number;
  title: string;
  description: string;
  prizeType: string;
  prizeAmount: number;
  currency: string;
  cashAlternative: boolean;
  cashAlternativeAmount: number;
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  endsIn: string;
  status: string;
  tags: string[];
  profitMargin: string;
  expectedWinners: number;
  prizeIncludes?: string[];
}

interface CardCompetition {
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
  status: string;
}

type SortOption = 'entry-low-high' | 'entry-high-low' | 'prize-high-low' | 'progress-most-filled';
type StatusFilter = 'all' | 'live';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Home() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('entry-low-high');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetch(`${API_URL}/api/competitions`)
      .then((res) => res.json())
      .then((data) => {
        setCompetitions(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load competitions. Please try again later.');
        setLoading(false);
      });
  }, []);

  const liveComps = competitions.filter((competition) => competition.status === 'live');
  const comingSoon = competitions.filter((competition) => competition.status === 'coming-soon');

  const cardCompetitions = useMemo<CardCompetition[]>(() => competitions.map((competition) => ({
    id: competition.id,
    title: competition.title,
    description: competition.description,
    prizeType: competition.prizeType,
    prizeAmount: competition.prizeAmount,
    prizeDetails: {
      currency: competition.currency,
      description: competition.prizeType,
      includes: competition.prizeIncludes,
    },
    entryPrice: competition.entryPrice,
    totalEntries: competition.totalEntries,
    soldEntries: competition.soldEntries,
    endsIn: competition.endsIn,
    tags: competition.tags,
    profitMargin: competition.profitMargin,
    expectedWinners: competition.expectedWinners,
    status: competition.status,
  })), [competitions]);

  const filteredCompetitions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...cardCompetitions]
      .filter((competition) => {
        const matchesStatus = statusFilter === 'all' || competition.status === 'live';
        const matchesSearch = !query
          || competition.title.toLowerCase().includes(query)
          || competition.description.toLowerCase().includes(query);

        return matchesStatus && matchesSearch;
      })
      .sort((left, right) => {
        switch (sortOption) {
          case 'entry-high-low':
            return right.entryPrice - left.entryPrice;
          case 'prize-high-low':
            return right.prizeAmount - left.prizeAmount;
          case 'progress-most-filled':
            return (right.soldEntries / right.totalEntries) - (left.soldEntries / left.totalEntries);
          case 'entry-low-high':
          default:
            return left.entryPrice - right.entryPrice;
        }
      });
  }, [cardCompetitions, searchTerm, sortOption, statusFilter]);

  const filteredComingSoonCount = filteredCompetitions.filter((competition) => competition.status === 'coming-soon').length;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient" />
        </div>
        <div className="hero-content">
          <span className="hero-badge">🏆 UAE Premium Competitions</span>
          <h1 className="hero-title">Win Life-Changing Prizes</h1>
          <p className="hero-subtitle">
            Fair draws · Cash alternatives · Transparent odds · Guaranteed winners
          </p>
          <div className="hero-badges">
            <div className="badge"><span className="badge-icon">💰</span><span className="badge-text">Cash Alternatives</span></div>
            <div className="badge"><span className="badge-icon">📊</span><span className="badge-text">Transparent Odds</span></div>
            <div className="badge"><span className="badge-icon">✅</span><span className="badge-text">Guaranteed Winners</span></div>
            <div className="badge"><span className="badge-icon">🔴</span><span className="badge-text">Live Draws</span></div>
          </div>
          <a href="#competitions" className="btn-cta">VIEW COMPETITIONS ↓</a>
        </div>
      </section>

      <div className="home-stats">
        <div className="container">
          <div className="home-stats__inner">
            <div className="home-stat"><strong>{competitions.length}</strong><span>Competitions</span></div>
            <div className="home-stat"><strong>{liveComps.length}</strong><span>Live Now</span></div>
            <div className="home-stat"><strong>£18.4M</strong><span>Annual Prizes</span></div>
            <div className="home-stat"><strong>100%</strong><span>Cash Alternative</span></div>
          </div>
        </div>
      </div>

      <section className="competitions-section" id="competitions">
        <div className="container">
          <h2 className="section-title">🎯 COMPETITIONS</h2>

          <div className="competition-toolbar">
            <div className="competition-toolbar__field competition-toolbar__field--search">
              <label htmlFor="competition-search">Search</label>
              <input
                id="competition-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title or description"
              />
            </div>

            <div className="competition-toolbar__field">
              <label htmlFor="competition-sort">Sort By</label>
              <select
                id="competition-sort"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
              >
                <option value="entry-low-high">Entry Price (Low-High)</option>
                <option value="entry-high-low">Entry Price (High-Low)</option>
                <option value="prize-high-low">Prize Value (High-Low)</option>
                <option value="progress-most-filled">Progress (Most Filled)</option>
              </select>
            </div>

            <div className="competition-toolbar__field">
              <label htmlFor="competition-filter">Status</label>
              <select
                id="competition-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value="all">All</option>
                <option value="live">Live Only</option>
              </select>
            </div>
          </div>

          <p className="competition-toolbar__summary">
            Showing <strong>{filteredCompetitions.length}</strong> competition{filteredCompetitions.length === 1 ? '' : 's'}
            {statusFilter === 'live' ? ' · Live only' : ''}
          </p>

          {loading && <p className="loading">Loading competitions...</p>}
          {error && <p className="loading" style={{ color: '#f87171' }}>{error}</p>}
          {!loading && !error && (
            filteredCompetitions.length > 0 ? (
              <div className="competitions-grid">
                {filteredCompetitions.map((comp) => (
                  <CompetitionCard
                    key={comp.id}
                    competition={comp}
                    onEnter={(id) => {
                      const competition = competitions.find((item) => item.id === id);
                      if (competition) {
                        setSelectedComp(competition);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="loading">No competitions matched your search. Try adjusting the filters.</p>
            )
          )}
          {comingSoon.length > 0 && filteredComingSoonCount > 0 && (
            <p className="coming-soon-note">
              ⏳ <strong>{filteredComingSoonCount} competition{filteredComingSoonCount > 1 ? 's' : ''} coming soon</strong> — check back shortly!
            </p>
          )}
        </div>
      </section>

      <section className="trust-section">
        <div className="container">
          <h2 className="section-title">WHY CHOOSE US</h2>
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Bank-grade security and SSL encryption on all transactions</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📡</div>
              <h3>Live Fair Draws</h3>
              <p>Every draw is conducted live and verifiably fair</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">💰</div>
              <h3>Cash Alternative</h3>
              <p>Every prize has a cash equivalent — you always have the choice</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📊</div>
              <h3>Transparent Odds</h3>
              <p>40% house margin shown publicly. No hidden fees or surprises</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} UAE Competition Platform · Fair, Transparent &amp; Compliant Draws</p>
          <Link to="/dashboard" className="footer-dash-link">📊 View Live Dashboard →</Link>
        </div>
      </footer>

      {selectedComp && (
        <EntryModal competition={selectedComp} onClose={() => setSelectedComp(null)} />
      )}
    </div>
  );
}
