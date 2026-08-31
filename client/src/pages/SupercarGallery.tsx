import { useState, useEffect } from 'react';
import './SupercarGallery.css';

interface Supercar {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  horsepower: number;
  topSpeed: number;
  zeroToSixty: number;
  value: number;
  currency: string;
  category: string;
  image: string;
  available: boolean;
  competitionId: number | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CATEGORIES = ['all', 'Sports', 'Hypercar', 'Grand Tourer', 'Luxury'];

export default function SupercarGallery() {
  const [filtered, setFiltered] = useState<Supercar[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category !== 'all') qs.set('category', category);
    if (search.trim()) qs.set('search', search.trim());
    const url = `${API_URL}/api/supercars${qs.toString() ? `?${qs}` : ''}`;
    fetch(url)
      .then((r) => r.json())
      .then((data: Supercar[]) => {
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load supercars. Please try again.');
        setLoading(false);
      });
  }, [category, search]);

  return (
    <div className="supercar-gallery">
      <div className="gallery-hero">
        <h1 className="gallery-hero__title">🏎️ Supercar Gallery</h1>
        <p className="gallery-hero__sub">
          Prize vehicles available across our competitions. Win one — or take the cash alternative.
        </p>
      </div>

      <div className="gallery-controls">
        <div className="gallery-search">
          <input
            type="text"
            placeholder="Search make, model, colour…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gallery-search__input"
          />
        </div>
        <div className="gallery-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`gallery-filter ${category === cat ? 'gallery-filter--active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="gallery-loading">
          <div className="gallery-spinner" />
          <p>Loading supercars…</p>
        </div>
      )}

      {error && <p className="gallery-error">⚠ {error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="gallery-empty">No supercars match your search.</p>
      )}

      <div className="gallery-grid">
        {filtered.map((car) => (
          <div key={car.id} className={`car-card ${!car.available ? 'car-card--unavailable' : ''}`}>
            <div className="car-card__image">{car.image}</div>
            {!car.available && (
              <span className="car-card__badge car-card__badge--sold">Not in current draw</span>
            )}
            {car.available && car.competitionId && (
              <span className="car-card__badge car-card__badge--live">🔴 Live — Competition #{car.competitionId}</span>
            )}

            <div className="car-card__body">
              <h2 className="car-card__make">{car.year} {car.make}</h2>
              <h3 className="car-card__model">{car.model}</h3>
              <p className="car-card__color">🎨 {car.color}</p>

              <div className="car-card__specs">
                <div className="spec">
                  <span>Power</span>
                  <strong>{car.horsepower} hp</strong>
                </div>
                <div className="spec">
                  <span>Top Speed</span>
                  <strong>{car.topSpeed} mph</strong>
                </div>
                <div className="spec">
                  <span>0–60</span>
                  <strong>{car.zeroToSixty}s</strong>
                </div>
                <div className="spec">
                  <span>Value</span>
                  <strong>£{car.value.toLocaleString()}</strong>
                </div>
              </div>

              <span className="car-card__category">{car.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
