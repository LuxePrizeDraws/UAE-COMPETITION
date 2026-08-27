import { useEffect, useState } from 'react';
import CompetitionCard from '../components/CompetitionCard';
import { API_BASE_URL } from '../config';
import './Home.css';

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

const Home = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/competitions`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCompetitions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Error: ${err.message}`);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home">
      <header style={{ padding: '2rem', textAlign: 'center', background: '#000', color: '#c9a84c' }}>
        <h1>🏆 UAE Premium Competitions</h1>
      </header>
      <main style={{ padding: '2rem' }}>
        {loading && <p>Loading competitions...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {competitions.map((c) => (
          <CompetitionCard key={c.id} competition={c} />
        ))}
      </main>
    </div>
  );
};

export default Home;
