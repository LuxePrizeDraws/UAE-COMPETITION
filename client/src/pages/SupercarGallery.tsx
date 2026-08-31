import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SupercarCarousel from '../components/supercars/SupercarCarousel';
import SupercarCard from '../components/supercars/SupercarCard';
import SupercarFilter, { SupercarFilterState } from '../components/supercars/SupercarFilter';
import SupercarLightbox from '../components/supercars/SupercarLightbox';
import { Supercar } from '../types/supercar';
import './SupercarGallery.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PAGE_SIZE = 8;

const DEFAULT_FILTERS: SupercarFilterState = {
  search: '',
  brand: '',
  type: '',
  color: '',
  price: '',
  sort: 'newest',
};

export default function SupercarGallery() {
  const [allCars, setAllCars] = useState<Supercar[]>([]);
  const [cars, setCars] = useState<Supercar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SupercarFilterState>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/api/supercars`)
      .then((res) => res.json())
      .then((data: Supercar[]) => {
        setAllCars(data);
        setCars(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.type) params.set('type', filters.type);
    if (filters.color) params.set('color', filters.color);
    if (filters.price) params.set('price', filters.price);
    if (filters.sort) params.set('sort', filters.sort);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    if (!allCars.length) return;
    fetch(`${API_URL}/api/supercars/filter?${query}`)
      .then((res) => res.json())
      .then((data: Supercar[]) => {
        setCars(data);
        setPage(1);
      });
  }, [query, allCars.length]);

  const paginated = cars.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < cars.length;

  return (
    <div className="supercar-gallery-page">
      <header className="supercar-gallery-page__hero">
        <p className="supercar-gallery-page__eyebrow">Luxury Supercar Gallery</p>
        <h1>The Ultimate Prize Collection</h1>
        <p>Browse premium supercars, compare specs, and discover your next dream prize.</p>
        <Link to="/" className="supercar-gallery-page__back">← Back to Home</Link>
      </header>

      <SupercarCarousel cars={cars} />

      <SupercarFilter
        allCars={allCars}
        value={filters}
        onChange={setFilters}
        onClear={() => setFilters(DEFAULT_FILTERS)}
        count={cars.length}
      />

      {loading ? (
        <p className="supercar-gallery-page__loading">Loading supercar collection...</p>
      ) : (
        <section className="supercar-gallery-grid" aria-live="polite">
          {paginated.map((car) => (
            <SupercarCard key={car.id} car={car} onClick={(selected) => setSelectedId(selected.id)} />
          ))}
        </section>
      )}

      {hasMore && (
        <div className="supercar-gallery-page__pagination">
          <button onClick={() => setPage((prev) => prev + 1)}>Load more supercars</button>
        </div>
      )}

      <SupercarLightbox cars={cars} selectedId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
